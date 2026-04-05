import React, { useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import FormModal from '../components/FormModal';
import { connectedUserRole } from '../Authentication/userInfos';
import {
  useAllComissions,
  useDeleteComission,
} from '../../Api/queriesComission';
import ComissionForm from './ComissionForm';
import { useParams } from 'react-router-dom';
import { deleteButton } from '../components/AlerteModal';
import ReçuComission from './ReçuComission';

export default function ClientComissionListe() {
  const param = useParams();
  const { data: comissionsData, isLoading, error } = useAllComissions();
  const { mutate: deleteComission, isLoading: isDeletting } =
    useDeleteComission();

  const [comissionToUpdate, setComissionToUpdate] = useState(null);
  const [formModalTitle, setFormModalTitle] = useState('Ajouter une Comission');
  const [form_modal, setForm_modal] = useState(false);

  const [selectedComission, setSelectedComission] = useState(false);

  const [show_modal, setShow_modal] = useState(false);

  // Fonction de Rechercher
  const filterComission = comissionsData?.filter(
    (item) => item?.client?._id === param?.id
  );

  // Total Payés
  const sumTotalComission = filterComission?.reduce((curr, item) => {
    return (curr += item?.amount);
  }, 0);

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
          {/* -------------------------- */}
          <FormModal
            form_modal={form_modal}
            setForm_modal={setForm_modal}
            tog_form_modal={tog_form_modal}
            modal_title={formModalTitle}
            size='md'
            bodyContent={
              <ComissionForm
                comissionToEdit={comissionToUpdate}
                tog_form_modal={tog_form_modal}
              />
            }
          />
          {/* -------------------- */}
          <ReçuComission
            show_modal={show_modal}
            tog_show_modal={tog_show_modal}
            selectedComission={selectedComission}
          />
          {/* -------------------- */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <h4 className='text-center fw-bold'>Liste de Comission</h4>
                  <div id='paiementsList'>
                    <h6 className='text-end'>
                      Montant Total :{' '}
                      <span className='text-info'>
                        {formatPrice(sumTotalComission || 0)} F{' '}
                      </span>{' '}
                    </h6>
                    <div className='d-flex gap-1'>
                      <Button
                        color='info'
                        className='add-btn'
                        id='create-btn'
                        onClick={() => {
                          setComissionToUpdate(null);
                          setFormModalTitle('Ajouter une Comission');
                          tog_form_modal();
                        }}
                      >
                        <i className='fas fa-dollar-sign align-center me-1'></i>{' '}
                        Ajouter une Comission
                      </Button>
                    </div>

                    {error && (
                      <div className='text-danger text-center'>
                        Erreur de chargement des données
                      </div>
                    )}
                    {isLoading && <LoadingSpiner />}

                    <div className='table-responsive table-card rs-table-scroll mt-3 mb-1'>
                      {filterComission?.length === 0 && (
                        <div className='text-center text-mutate'>
                          Aucune Comission trouver !
                        </div>
                      )}
                      {!error && !isLoading && filterComission?.length > 0 && (
                        <table className='table rs-data-table align-middle table-nowrap table-hover'>
                          <thead className='table-light'>
                            <tr className='text-center'>
                              <th data-sort='paiementDate'>Date de Paiement</th>
                              <th>Client</th>
                              <th>Téléphone</th>
                              <th>Montant</th>
                              <th>Bénéficiaire</th>
                              <th>Détails</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody className='list form-check-all text-center'>
                            {filterComission?.length > 0 &&
                              filterComission?.map((item) => {
                                const client = item?.client;

                                return (
                                  <tr key={item?._id}>
                                    <th scope='row'>
                                      {new Date(
                                        item?.paiementDate
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
                                            <div className='d-flex justify-content-center align-item-center'>
                                              <div className='edit mx-2'>
                                                <button
                                                  className='btn btn-sm btn-success edit-item-btn'
                                                  onClick={() => {
                                                    setFormModalTitle(
                                                      'Modifier les données'
                                                    );
                                                    setComissionToUpdate(item);
                                                    tog_form_modal();
                                                  }}
                                                >
                                                  <i className='ri-pencil-fill text-white'></i>
                                                </button>
                                              </div>
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
