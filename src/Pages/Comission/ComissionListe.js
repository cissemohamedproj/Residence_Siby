import React, { useContext, useState } from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import { AuthContext } from '../../Auth/AuthContext';
import {
  useComissionsPaged,
  useDeleteComission,
} from '../../Api/queriesComission';
import ReçuComission from './ReçuComission';
import { deleteButton } from '../components/AlerteModal';
import PaginationControls from '../components/PaginationControls';

export default function ComissionListe() {
  const { auth } = useContext(AuthContext);
  const connectedUserRole = auth?.user?.role ?? null;
  // ------------------------------------------------------------
  // OPTIMISATION: pagination + recherche (server-side)
  // ------------------------------------------------------------
  const [page, setPage] = useState(1);
  const limit = 20;
  const [searchTerm, setSearchTerm] = useState('');

  const { data: paged, isLoading, error } = useComissionsPaged({
    page,
    limit,
    search: searchTerm,
  });

  const comissionsData = paged?.items || [];
  const { mutate: deleteComission, isLoading: isDeletting } =
    useDeleteComission();

  const [selectedComission, setSelectedComission] = useState(false);

  const [show_modal, setShow_modal] = useState(false);

  // Total Payés
  // OPTIMISATION: somme globale renvoyée par l'API (toutes les pages),
  // pour conserver le même total sans charger toute la collection.
  const sumTotalComission = paged?.sumTotalAmount ?? 0;

  // Ouverture de Modal Reçu Paiement
  function tog_show_modal() {
    setShow_modal(!show_modal);
  }

  return (
    <React.Fragment>
      <div className='page-content' style={{marginTop: '100px'}}>
        {/* <ActiveSecteur /> */}
        <Container fluid>
          {/* -------------------- */}
          <ReçuComission
            show_modal={show_modal}
            tog_show_modal={tog_show_modal}
            selectedComission={selectedComission}
          />
          {/* -------------------- */}
          <Row>
            <Col lg={12} >
              <Card>
                <CardBody>
                  <div id='paiementsList'>
                    {/* OPTIMISATION UX: recherche sans rechargement + pagination */}
                    <div className='d-flex justify-content-end mb-2'>
                      <div className='search-box'>
                        <input
                          type='text'
                          className='form-control search border border-dark rounded'
                          placeholder='Rechercher...'
                          value={searchTerm}
                          onChange={(e) => {
                            // OPTIMISATION UX: recherche => retour page 1
                            setSearchTerm(e.target.value);
                            setPage(1);
                          }}
                        />
                      </div>
                    </div>
                    <h6 className='text-end'>
                      Montant Total :{' '}
                      <span className='text-light badge bg-success px-2'>
                        {formatPrice(sumTotalComission || 0)} F{' '}
                      </span>{' '}
                    </h6>

                    {error && (
                      <div className='text-danger text-center'>
                        Erreur de chargement des données
                      </div>
                    )}
                    {isLoading && <LoadingSpiner />}

                    {/* OPTIMISATION UX: pagination en haut (visible + contrastée) */}
                    <PaginationControls
                      page={paged?.page}
                      totalPages={paged?.totalPages}
                      onPageChange={(p) => setPage(p)}
                      wrapperClassName='mb-3 mt-2'
                    />

                    <div className='table-responsive table-card rs-table-scroll mt-3 mb-1'>
                      {comissionsData?.length === 0 && (
                        <div className='text-center text-mutate'>
                          Aucune Comission trouver !
                        </div>
                      )}
                      {!error && !isLoading && comissionsData?.length > 0 && (
                        <table className='table rs-data-table align-middle table-nowrap table-hover'>
                          <thead className='table-light'>
                            <tr className='text-center'>
                              <th data-sort='paiementDate'>Date de Paiement</th>
                              <th>Secteur</th>
                              <th>Client</th>
                              <th>Téléphone</th>
                              <th>Montant</th>
                              <th>Bénéficiaire</th>
                              <th>Détails</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody className='list form-check-all text-center'>
                            {comissionsData?.length > 0 &&
                              comissionsData?.map((item) => {
                                const client = item?.client;

                                return (
                                  <tr key={item?._id}>
                                    <th scope='row'>
                                      {new Date(
                                        item?.paiementDate
                                      ).toLocaleDateString()}
                                    </th>
                                    <td>
                                      {capitalizeWords(item?.secteur?.adresse)}
                                    </td>
                                    <td>
                                      {capitalizeWords(
                                        client?.firstName +
                                          ' ' +
                                          client?.lastName
                                      )}{' '}
                                    </td>
                                    <td>
                                      {formatPhoneNumber(client?.phoneNumber)}{' '}
                                    </td>
                                    <td>{formatPrice(item?.amount || 0)} F</td>
                                    <td className='text-warning'>
                                      {capitalizeWords(item?.beneficiaire)}{' '}
                                    </td>
                                    <td>{capitalizeWords(item?.details)} </td>

                                    <td>
                                      {!isDeletting && (
                                        <div className='d-flex gap-2'>
                                          {isDeletting && <LoadingSpiner />}
                                          <div>
                                            <button
                                              className='btn btn-sm btn-secondary show-item-btn'
                                              onClick={() => {
                                                setSelectedComission(item);

                                                tog_show_modal();
                                              }}
                                            >
                                              <i className='bx bx-show align-center text-white'></i>
                                            </button>
                                          </div>
                                          {connectedUserRole === 'admin' && (
                                            <div>
                                              <button
                                                className='btn btn-sm  btn-danger '
                                                onClick={() => {
                                                  deleteButton(
                                                    item._id,
                                                    `la comission de: ${
                                                      client.firstName +
                                                      ' ' +
                                                      client.lastName
                                                    }`,

                                                    deleteComission
                                                  );
                                                }}
                                              >
                                                {' '}
                                                <i className='ri-delete-bin-fill align-center '></i>{' '}
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
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
