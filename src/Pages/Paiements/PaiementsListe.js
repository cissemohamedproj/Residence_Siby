import React, { useContext, useState } from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import { usePaiementsPaged, usePaiementsSummary } from '../../Api/queriesPaiement';
import ReçuPaiement from './ReçuPaiement';
import {
  BackButton,
  DashboardButton,
  HomeButton,
} from '../components/NavigationButton';
import FormModal from '../components/FormModal';
import PaiementForm from './PaiementForm';
import { AuthContext } from '../../Auth/AuthContext';
import PaginationControls from '../components/PaginationControls';

export default function PaiementsListe() {
  const { auth } = useContext(AuthContext);
  const connectedUserRole = auth?.user?.role ?? null;
  // ------------------------------------------------------------
  // OPTIMISATION: pagination + recherche (server-side) + résumé global
  // ------------------------------------------------------------
  const [page, setPage] = useState(1);
  const limit = 20;
  const [searchTerm, setSearchTerm] = useState('');

  const { data: paged, isLoading, error } = usePaiementsPaged({
    page,
    limit,
    search: searchTerm,
  });
  const paiementsData = paged?.items || [];

  // OPTIMISATION: totaux globaux renvoyés par le backend (sans charger contrats/rentals/paiements).
  const { data: summary } = usePaiementsSummary();
  const [paiementToUpdate, setPaiementToUpdate] = useState(null);
  const [formModalTitle, setFormModalTitle] = useState('Nouveau Paiement');
  const [form_modal, setForm_modal] = useState(false);

  const [selectedPaiement, setSelectedPaiement] = useState(false);
  const [selectedPaiementTotalPaye, setSelectedPaiementTotalPaye] = useState(0);
  const [show_modal, setShow_modal] = useState(false);

  // const filterPaiement = paiementsData?.reduce((acc, item) => {
  //   // Vérifie si le contrat existe déjà dans l'accumulateur
  //   const existe = acc.find((it) => it?.contrat?._id === item?.contrat?._id);

  //   if (existe) {
  //     // Si déjà présent → on additionne totalPaye
  //     existe.totalPaye = (existe.totalPaye || 0) + (item.totalPaye || 0);
  //   } else {
  //     // Sinon → on ajoute le contrat avec son totalPaye initial
  //     acc.push({ ...item, totalPaye: item.totalPaye || 0 });
  //   }

  //   return acc;
  // }, []);

  // Total Payés (global)
  const sumTotalPaye = summary?.sumTotalPaye ?? 0;
  // const sumTotalPaye = filterPaiement?.reduce((curr, item) => {
  //   return (curr += item?.totalPaye);
  // }, 0);

  const sumTotalAmount = summary?.sumTotalAmount ?? 0;
  const sumTotalReliqua = summary?.sumTotalReliqua ?? 0;
  // const sumTotalReliqua = filterPaiement?.reduce(
  //   (acc, item) => (acc += item?.contrat?.totalAmount - item?.totalPaye),
  //   0
  // );

  // Ouverture de Modal Reçu Paiement
  function tog_show_modal() {
    setShow_modal(!show_modal);
  }

  // Ouverture de Modal Form
  function tog_form_modal() {
    setForm_modal(!form_modal);
  }

  return (
    <React.Fragment>
      <div className='page-content'>
        {/* <ActiveSecteur /> */}
        <Container fluid>
          <Breadcrumbs title='Transaction' breadcrumbItem='Paiements' />
          <div className='d-flex flex-wrap gap-4 justify-content-center align-items-center'>
            <BackButton />
            <DashboardButton />
            <HomeButton />
          </div>

          {/* -------------------------- */}
          <FormModal
            form_modal={form_modal}
            setForm_modal={setForm_modal}
            tog_form_modal={tog_form_modal}
            modal_title={formModalTitle}
            size='md'
            bodyContent={
              <PaiementForm
                paiementToEdit={paiementToUpdate}
                // totalContratAmount={selectedContrat?.totalAmount}
                // totalReliqua={sumTotalReliqua}
                tog_form_modal={tog_form_modal}
              />
            }
          />
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
                  <h4 className='text-center fw-bold'>
                    Liste de tous les Paiements
                  </h4>
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
                      Montant Total des Contrats:{' '}
                      <span className='text-info'>
                        {formatPrice(sumTotalAmount || 0)} F{' '}
                      </span>{' '}
                    </h6>
                    <h6 className='text-end'>
                      Total Net Payés:{' '}
                      <span className='text-success'>
                        {formatPrice(sumTotalPaye || 0)} F{' '}
                      </span>{' '}
                    </h6>
                    <h6 className='text-end'>
                      Total Reliquat:{' '}
                      <span className='text-danger'>
                        {formatPrice(sumTotalReliqua || 0)} F{' '}
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
                      {paiementsData?.length === 0 && (
                        <div className='text-center text-mutate'>
                          Aucun paiement trouver !
                        </div>
                      )}
                      {!error && !isLoading && paiementsData?.length > 0 && (
                        <table
                          className='table rs-data-table align-middle table-nowrap table-hover'
                          id='paiementTable'
                        >
                          <thead className='table-light'>
                            <tr>
                              <th
                                scope='col'
                                className='rs-th-nowrap'
                                data-sort='paiementDate'
                              >
                                Date de Paiement
                              </th>
                              <th scope='col' className='rs-th-text'>
                                Client
                              </th>
                              <th scope='col' className='rs-th-nowrap'>
                                Téléphone
                              </th>
                              <th scope='col' className='rs-th-num'>
                                Total Contrat
                              </th>
                              <th scope='col' className='rs-th-num'>
                                Remise
                              </th>
                              <th scope='col' className='rs-th-num'>
                                Total après remise
                              </th>
                              <th scope='col' className='rs-th-num'>
                                Net Payé
                              </th>
                              <th scope='col' className='rs-th-num'>
                                Reliquat
                              </th>
                              <th scope='col' className='rs-th-actions'>
                                Action
                              </th>
                            </tr>
                          </thead>

                          <tbody className='list form-check-all'>
                            {paiementsData?.length > 0 &&
                              paiementsData?.map((paiement) => {
                                const client =
                                  paiement?.contrat?.client ||
                                  paiement?.rental?.client;
                                const contrat =
                                  paiement?.contrat || paiement?.rental;
                                return (
                                  <tr key={paiement?._id}>
                                    <th
                                      scope='row'
                                      className='rs-td-nowrap'
                                    >
                                      {new Date(
                                        paiement?.paiementDate
                                      ).toLocaleDateString()}
                                    </th>
                                    <td className='rs-td-text'>
                                      {capitalizeWords(
                                        client?.firstName +
                                          ' ' +
                                          client?.lastName
                                      )}{' '}
                                    </td>
                                    <td className='rs-td-nowrap'>
                                      {formatPhoneNumber(client?.phoneNumber)}{' '}
                                    </td>
                                    <td className='rs-td-num'>
                                      {formatPrice(
                                        contrat?.amount ||
                                          contrat?.totalAmount ||
                                          0
                                      )}{' '}
                                      F
                                    </td>
                                    <td className='rs-td-num text-warning'>
                                      {formatPrice(
                                        paiement?.contrat?.reduction || 0
                                      )}{' '}
                                      F
                                    </td>
                                    <td className='rs-td-num'>
                                      {formatPrice(
                                        contrat?.amount ||
                                          contrat?.totalAmount ||
                                          0
                                      )}{' '}
                                      F
                                    </td>

                                    <td className='rs-td-num'>
                                      {formatPrice(paiement?.totalPaye || 0)}
                                      {' F '}
                                    </td>
                                    <td className='rs-td-num text-danger'>
                                      {formatPrice(
                                        contrat?.totalAmount ||
                                          contrat?.amount -
                                            paiement?.totalPaye ||
                                          0
                                      )}
                                      {' F '}
                                    </td>

                                    <td className='rs-td-actions'>
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
                                        {connectedUserRole === 'admin' && (
                                          <div className='edit mx-2'>
                                            <button
                                              className='btn btn-sm btn-success edit-item-btn'
                                              onClick={() => {
                                                setFormModalTitle(
                                                  'Modifier les données'
                                                );
                                                setPaiementToUpdate(paiement);
                                                tog_form_modal();
                                              }}
                                            >
                                              <i className='ri-pencil-fill text-white'></i>
                                            </button>
                                          </div>
                                        )}
                                      </div>
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
