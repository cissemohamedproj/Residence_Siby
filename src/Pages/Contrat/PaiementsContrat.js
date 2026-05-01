import React, { useContext, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import FormModal from '../components/FormModal';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import { deleteButton } from '../components/AlerteModal';
import { useAllPaiements, useDeletePaiement } from '../../Api/queriesPaiement';
import { useParams } from 'react-router-dom';
import PaiementForm from '../Paiements/PaiementForm';
import { useOneContrat } from '../../Api/queriesContrat';
import ReçuPaiement from '../Paiements/ReçuPaiement';
import { AuthContext } from '../../Auth/AuthContext';
import {
  BackButton,
  DashboardButton,
  HomeButton,
} from '../components/NavigationButton';

export default function PaiementsContrat() {
  const contrat = useParams();
  const { auth } = useContext(AuthContext);
  const connectedUserRole = auth?.user?.role ?? null;
  const [form_modal, setForm_modal] = useState(false);
  const { data: paiementsData, isLoading, error } = useAllPaiements();
  const { mutate: deletePaiement, isDeleting } = useDeletePaiement();
  const { data: selectedContrat } = useOneContrat(contrat.id);
  const [paiementToUpdate, setPaiementToUpdate] = useState(null);
  const [formModalTitle, setFormModalTitle] = useState('Nouveau Paiement');

  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [show_modal, setShow_modal] = useState(false);

  // Fonction de Rechercher
  const filterPaiement = paiementsData?.filter(
    (paiement) =>
      (paiement?.contrat?._id === selectedContrat?._id &&
        paiement?.contrat?.client?._id === selectedContrat?.client?._id) ||
      (paiement?.rental?.appartement?._id ===
        selectedContrat?.appartement?._id &&
        paiement?.rental?.client?._id === selectedContrat?.client?._id)
  );

  // Ouverture de Modal Form
  function tog_form_modal() {
    setForm_modal(!form_modal);
  }

  // Ouverture de Modal Reçu Paiement
  function tog_show_modal() {
    setShow_modal(!show_modal);
  }
  const sumTotalPaye = filterPaiement?.reduce(
    (value, item) => (value += item.totalPaye),
    0
  );
  const sumTotalReliqua = Number(
    selectedContrat?.totalAmount - sumTotalPaye || 0
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Contrat' breadcrumbItem='Paiements' />
          <div className='d-flex flex-wrap justify-content-center align-items-center gap-4'>
            <BackButton />
            <DashboardButton />
            <HomeButton />
          </div>{' '}
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
                totalContratAmount={selectedContrat?.totalAmount}
                totalReliqua={sumTotalReliqua}
                tog_form_modal={tog_form_modal}
              />
            }
          />
          <ReçuPaiement
            show_modal={show_modal}
            tog_show_modal={tog_show_modal}
            contrat={selectedContrat}
            selectedPaiementID={selectedPaiement}
            totalReliqua={sumTotalReliqua}
          />
          {/* -------------------- */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='paiementsList'>
                    <Row className='g-4 mb-3 '>
                      {connectedUserRole === 'admin' && (
                        <Col className='col-sm-auto '>
                          <div className='d-flex gap-1'>
                            <Button
                              color='info'
                              className='add-btn'
                              id='create-btn'
                              onClick={() => {
                                setPaiementToUpdate(null);
                                setFormModalTitle('Nouveau Paiement');
                                tog_form_modal();
                              }}
                            >
                              <i className='fas fa-dollar-sign align-center me-1'></i>{' '}
                              Ajouter un Paiement
                            </Button>
                          </div>
                        </Col>
                      )}
                    </Row>
                    <h6 className='text-end'>
                      Montant:{' '}
                      <span className='text-info'>
                        {formatPrice(sumTotalPaye + sumTotalReliqua || 0)} F{' '}
                      </span>{' '}
                    </h6>
                    <h6 className='text-end'>
                      Total Payé:{' '}
                      <span className='text-info'>
                        {formatPrice(sumTotalPaye || 0)} F{' '}
                      </span>{' '}
                    </h6>
                    <h6 className='text-end'>
                      Reliquat:{' '}
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

                              <th>Net Payé</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody className='list form-check-all text-center'>
                            {filterPaiement?.length > 0 &&
                              filterPaiement?.map((paiement) => {
                                const client =
                                  paiement?.contrat?.client ||
                                  paiement?.rental?.client;

                                return (
                                  <tr
                                    key={paiement?._id}
                                    className='text-center'
                                  >
                                    <th scope='row'>
                                      {new Date(
                                        paiement?.paiementDate
                                      ).toLocaleDateString()}
                                    </th>
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

                                    <td>
                                      {formatPrice(paiement?.totalPaye || 0)}
                                      {' F '}
                                    </td>

                                    <td className=''>
                                      {isDeleting && <LoadingSpiner />}
                                      {!isDeleting && (
                                        <div className='d-flex justify-content-center align-items-center gap-2'>
                                          <div>
                                            <button
                                              className='btn btn-sm btn-secondary show-item-btn'
                                              onClick={() => {
                                                setSelectedPaiement(
                                                  paiement?._id
                                                );
                                                tog_show_modal();
                                              }}
                                            >
                                              <i className='bx bx-show align-center text-white'></i>
                                            </button>
                                          </div>
                                          {connectedUserRole === 'admin' && (
                                            <div className='d-flex'>
                                              <div className='edit mx-2'>
                                                <button
                                                  className='btn btn-sm btn-success edit-item-btn'
                                                  onClick={() => {
                                                    setFormModalTitle(
                                                      'Modifier les données'
                                                    );
                                                    setPaiementToUpdate(
                                                      paiement
                                                    );
                                                    tog_form_modal();
                                                  }}
                                                >
                                                  <i className='ri-pencil-fill text-white'></i>
                                                </button>
                                              </div>
                                              <div>
                                                <button
                                                  className='btn btn-sm btn-danger remove-item-btn'
                                                  onClick={() => {
                                                    deleteButton(
                                                      paiement?._id,
                                                      `Paiement de ${formatPrice(
                                                        paiement?.totalPaye
                                                      )} F
                                                    `,
                                                      deletePaiement
                                                    );
                                                  }}
                                                >
                                                  <i className='ri-delete-bin-fill text-white'></i>
                                                </button>
                                              </div>
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
