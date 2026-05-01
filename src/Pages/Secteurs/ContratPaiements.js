import React, { useContext, useState } from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import { usePaiementsContratBySecteurPaged } from '../../Api/queriesPaiement';
import ReçuPaiement from '../Paiements/ReçuPaiement';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../Auth/AuthContext';
import PaginationControls from '../components/PaginationControls';

export default function ContratPaiements() {
  const param = useParams();
  // ------------------------------------------------------------
  // OPTIMISATION: pagination + recherche côté backend par secteur (paiements CONTRAT)
  // ------------------------------------------------------------
  const [page, setPage] = useState(1);
  const limit = 20;
  const [searchTerm, setSearchTerm] = useState('');

  // IMPORTANT: page=1 à chaque changement de recherche
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const { data: paged, isLoading, error } = usePaiementsContratBySecteurPaged({
    secteurId: param?.id,
    page,
    limit,
    search: searchTerm,
  });
  const [selectedPaiement, setSelectedPaiement] = useState(false);
  const [selectedPaiementTotalPaye, setSelectedPaiementTotalPaye] = useState(0);
  const [show_modal, setShow_modal] = useState(false);
  const { auth } = useContext(AuthContext);
  const connectedUserRole = auth?.user?.role ?? null;

  // OPTIMISATION: l'endpoint `paiements/bySecteur/:id` peut renvoyer des paiements
  // liés à des CONTRATS et/ou à des RESERVATIONS (rental).
  //
  // IMPORTANT: cette page "ContratPaiements" exploite uniquement `paiement.contrat.*`
  // (client, téléphone, montants). Si `contrat` est null (paiement de reservation),
  // certaines cellules restent vides.
  //
  // Pour ne PAS changer la logique existante, on garde le même comportement qu'avant
  // l'optimisation: on n'affiche ici que les paiements ayant un `contrat`.
  // OPTIMISATION: l'endpoint renvoie déjà uniquement les paiements liés à un contrat
  // (même logique d'affichage qu'avant), avec totaux calculés côté backend.
  const filterPaiement = paged?.items || [];
  const sumTotalAmount = paged?.sumTotalAmount || 0;
  const sumTotalPaye = paged?.sumTotalPaye || 0;
  const sumTotalReliqua = paged?.sumTotalReliqua || 0;

  // Ouverture de Modal Reçu Paiement
  function tog_show_modal() {
    setShow_modal(!show_modal);
  }
  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          {/* -------------------- */}
          <ReçuPaiement
            show_modal={show_modal}
            tog_show_modal={tog_show_modal}
            selectedPaiementID={selectedPaiement}
            totalPaye={selectedPaiementTotalPaye}
          />
          {/* -------------------- */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='paiementsList'>
                    <h3 className='text-center fw-bold'>Paiements</h3>

                    <h6 className='text-end'>
                      Montant Total:{' '}
                      <span className='text-info'>
                        {formatPrice(sumTotalAmount || 0)} F{' '}
                      </span>{' '}
                    </h6>
                    <h6 className='text-end'>
                      Total Payé:{' '}
                      <span className='text-success'>
                        {formatPrice(sumTotalPaye || 0)} F{' '}
                      </span>{' '}
                    </h6>
                    <h6 className='text-end'>
                      Reliquat:{' '}
                      <span className='text-danger'>
                        {formatPrice(sumTotalReliqua || 0)} F{' '}
                      </span>{' '}
                    </h6>

                    <Row className='g-4 mb-3 d-felx flex-wrap align-items-center justify-content-center justify-content-md-between'>
                      <Col md={4}>
                        <p className='font-size-15 mt-2'>
                          Nombre:{' '}
                          <span className='badge bg-warning'>
                            {' '}
                            {paged?.total || 0}{' '}
                          </span>
                        </p>
                      </Col>
                      <Col md={4} className='col-sm'>
                        <div className='d-flex justify-content-sm-end gap-2'>
                          {searchTerm !== '' && (
                            <button
                              className='btn btn-danger'
                              onClick={() => setSearchTerm('')}
                            >
                              <i className='fas fa-window-close'></i>
                            </button>
                          )}
                          <div className='search-box me-4'>
                            <input
                              type='text'
                              className='form-control search border border-dark rounded'
                              placeholder='Rechercher...'
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                    {error && (
                      <div className='text-danger text-center'>
                        Erreur de chargement des données
                      </div>
                    )}
                    {isLoading && <LoadingSpiner />}

                    {/* OPTIMISATION UX: pagination toujours visible en haut */}
                    <PaginationControls
                      page={page}
                      totalPages={paged?.totalPages || 1}
                      onPageChange={setPage}
                      wrapperClassName='mb-3 mt-2'
                    />

                    {/* OPTIMISATION UX: pas de hauteur forcée -> pas de scroll interne.
                        Le tableau prend la hauteur de son contenu, la page scroll. */}
                    <div className='table-responsive table-card rs-table-scroll mt-3 mb-1'>
                      {filterPaiement?.length === 0 && (
                        <div className='text-center text-mutate'>
                          Aucun paiement trouver !
                        </div>
                      )}
                      {!error && !isLoading && filterPaiement?.length > 0 && (
                        <table
                          className='table rs-data-table align-middle table-nowrap table-hover'
                          id='paiementTable'
                        >
                          <thead className='table-light'>
                            <tr className='text-center'>
                              <th data-sort='paiementDate'>Date de Paiement</th>
                              <th>Client</th>
                              <th>Téléphone</th>
                              <th>Total Contrat</th>
                              <th>Remise</th>
                              <th>Total après remise</th>
                              <th>Net Payé</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody className='list form-check-all text-center'>
                            {filterPaiement?.length > 0 &&
                              filterPaiement?.map((paiement) => (
                                <tr key={paiement?._id}>
                                  <th scope='row'>
                                    {new Date(
                                      paiement?.paiementDate
                                    ).toLocaleDateString()}
                                  </th>
                                  <td>
                                    {capitalizeWords(
                                      paiement?.contrat?.client.firstName +
                                        ' ' +
                                        paiement?.contrat?.client.lastName
                                    )}{' '}
                                  </td>
                                  <td>
                                    {formatPhoneNumber(
                                      paiement?.contrat?.client?.phoneNumber
                                    )}{' '}
                                  </td>
                                  <td>
                                    {formatPrice(paiement?.contrat?.amount) ||
                                      0}{' '}
                                    F
                                  </td>
                                  <td className='text-warning'>
                                    {formatPrice(
                                      paiement?.contrat?.reduction || 0
                                    )}{' '}
                                    F
                                  </td>
                                  <td>
                                    {formatPrice(
                                      paiement?.contrat?.totalAmount
                                    ) || 0}{' '}
                                    F
                                  </td>

                                  <td>
                                    {formatPrice(paiement?.totalPaye)}
                                    {' F '}
                                  </td>

                                  {connectedUserRole === 'admin' && (
                                    <td>
                                      <div className='d-flex gap-2'>
                                        <div>
                                          <button
                                            className='btn btn-sm btn-secondary show-item-btn'
                                            onClick={() => {
                                              setSelectedPaiement(
                                                paiement?._id
                                              );
                                              setSelectedPaiementTotalPaye(
                                                paiement?.totalPaye
                                              );
                                              tog_show_modal();
                                            }}
                                          >
                                            <i className='bx bx-show align-center text-white'></i>
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}
