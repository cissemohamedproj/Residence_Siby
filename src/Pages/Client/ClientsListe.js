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
import { useClientsPaged, useDeleteClient } from '../../Api/queriesClient';
import ClientForm from './ClientForm';
import { useNavigate } from 'react-router-dom';
import {
  BackButton,
  DashboardButton,
  HomeButton,
} from '../components/NavigationButton';
import ActiveSecteur from '../Secteurs/ActiveSecteur';
import { AuthContext } from '../../Auth/AuthContext';
import PaginationControls from '../components/PaginationControls';

export default function ClientListe() {
  const { auth } = useContext(AuthContext);
  const connectedUserRole = auth?.user?.role ?? null;
  const [form_modal, setForm_modal] = useState(false);
  // ------------------------------------------------------------
  // OPTIMISATION: pagination + recherche (server-side)
  // ------------------------------------------------------------
  const [page, setPage] = useState(1);
  const limit = 20;
  const { mutate: deleteClient, isLoading: isDeleting } = useDeleteClient();
  const [clientToUpdate, setClientToUpdate] = useState(null);
  const [formModalTitle, setFormModalTitle] = useState('Ajouter un Client');
  const navigate = useNavigate();
  // State de Rechercher
  const [searchTerm, setSearchTerm] = useState('');

  // OPTIMISATION: on récupère directement la page filtrée côté backend.
  // NB: pas de reload page, React Query gère le cache.
  const {
    data: paged,
    isLoading,
    error,
  } = useClientsPaged({ page, limit, search: searchTerm });

  const filteredClient = paged?.items || [];

  function tog_form_modal() {
    setForm_modal(!form_modal);
  }

  const clientContrat = (client) => {
    // OPTIMISATION: le backend calcule `contractCount` par client (badge).
    return client?.contractCount || 0;
  };

  return (
    <React.Fragment>
      <div className='page-content'>
        <ActiveSecteur />
        <Container fluid>
          <Breadcrumbs title='Secteurs' breadcrumbItem='List des Client' />
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
              <ClientForm
                clientToEdit={clientToUpdate}
                tog_form_modal={tog_form_modal}
              />
            }
          />

          {/* -------------------- */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='clientsList'>
                    <Row className='g-4 mb-3'>
                      {connectedUserRole === 'admin' && (
                        <Col md={4} className='col-sm-auto'>
                          <div className='d-flex gap-1'>
                            <Button
                              color='info'
                              className='add-btn'
                              id='create-btn'
                              onClick={() => {
                                setClientToUpdate(null);
                                tog_form_modal();
                              }}
                            >
                              <i className='fas fa-user align-center me-1'></i>{' '}
                              Ajouter un Client
                            </Button>
                          </div>
                        </Col>
                      )}
                      <Col md={4}>
                        <p className='text-center font-size-15 mt-2'>
                          Total Clients:{' '}
                          <span className='badge bg-warning'>
                            {' '}
                            {paged?.total ?? filteredClient?.length ?? 0}{' '}
                          </span>
                        </p>
                      </Col>
                      <Col md={4} className='col-sm'>
                        <div className='d-flex justify-content-sm-end gap-2'>
                          {searchTerm !== '' && (
                            <Button
                              color='danger'
                              onClick={() => setSearchTerm('')}
                            >
                              <i className='fas fa-window-close'></i>
                            </Button>
                          )}
                          <div className='search-box me-4'>
                            <input
                              type='text'
                              className='form-control search border border-dark rounded'
                              placeholder='Rechercher...'
                              value={searchTerm}
                              onChange={(e) => {
                                // OPTIMISATION UX: si la recherche change,
                                // on revient à la 1ère page pour afficher des résultats
                                // sans forcer l'utilisateur à "changer la page index".
                                setSearchTerm(e.target.value);
                                setPage(1);
                              }}
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

                    {/* OPTIMISATION UX: pagination en haut (visible + contrastée) */}
                    <PaginationControls
                      page={paged?.page}
                      totalPages={paged?.totalPages}
                      onPageChange={(p) => setPage(p)}
                      wrapperClassName='mb-3 mt-2'
                    />

                    <div className='table-responsive table-card rs-table-scroll mt-3 mb-1'>
                      {!filteredClient?.length && !isLoading && !error && (
                        <div className='text-center text-mutate'>
                          Aucun Clients trouvée !
                        </div>
                      )}
                      {!error && filteredClient?.length > 0 && !isLoading && (
                        <table
                          className='table rs-data-table align-middle table-nowrap table-hover'
                          id='fournisseurTable'
                        >
                          <thead className='table-light'>
                            <tr>
                              <th
                                scope='col'
                                className='rs-th-num'
                                style={{ width: '50px' }}
                              >
                                ID
                              </th>
                              <th
                                scope='col'
                                className='rs-th-actions'
                                style={{ width: '20px' }}
                              ></th>
                              <th scope='col' className='rs-th-text'>
                                Nom
                              </th>
                              <th scope='col' className='rs-th-text'>
                                Prénom
                              </th>
                              <th scope='col' className='rs-th-nowrap'>
                                Pièce d'identité
                              </th>
                              <th scope='col' className='rs-th-nowrap'>
                                Téléphone
                              </th>
                              <th scope='col' className='rs-th-actions'>
                                Action
                              </th>
                            </tr>
                          </thead>

                          <tbody className='list form-check-all'>
                            {filteredClient?.map((client, index) => (
                              <tr key={client._id}>
                                <th className='rs-td-num' scope='row'>
                                  {/* OPTIMISATION: index global (page) */}
                                  {(page - 1) * limit + index + 1}
                                </th>
                                <td className='rs-td-actions'>
                                  <button
                                    type='button'
                                    className='btn text-info position-relative'
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                      navigate(`/client/${client?._id}`)
                                    }
                                  >
                                    <u>Contrat</u>
                                    <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning'>
                                      {formatPrice(clientContrat(client) || 0)}
                                    </span>
                                  </button>
                                </td>
                                <td className='rs-td-text'>
                                  {capitalizeWords(client.firstName)}{' '}
                                </td>
                                <td className='rs-td-text'>
                                  {capitalizeWords(client.lastName)}{' '}
                                </td>
                                <td className='rs-td-nowrap'>
                                  {client.pieceNumber}{' '}
                                </td>

                                <td className='rs-td-nowrap'>
                                  {formatPhoneNumber(client.phoneNumber)}
                                </td>

                                {connectedUserRole === 'admin' && (
                                  <td className='rs-td-actions'>
                                    {isDeleting && <LoadingSpiner />}
                                    {!isDeleting && (
                                      <div className='d-flex justify-content-center align-items-center gap-2'>
                                        <div>
                                          <button
                                            className='btn btn-sm btn-success edit-item-btn'
                                            onClick={() => {
                                              setFormModalTitle(
                                                'Modifier les données'
                                              );
                                              setClientToUpdate(client);
                                              tog_form_modal();
                                            }}
                                          >
                                            <i className='ri-pencil-fill text-white'></i>
                                          </button>
                                        </div>
                                        {isDeleting && <LoadingSpiner />}
                                        {!isDeleting && (
                                          <div className='remove'>
                                            <button
                                              className='btn btn-sm btn-danger remove-item-btn'
                                              onClick={() => {
                                                deleteButton(
                                                  client._id,
                                                  client.firstName +
                                                    ' ' +
                                                    client.lastName,
                                                  deleteClient
                                                );
                                              }}
                                            >
                                              <i className='ri-delete-bin-fill text-white'></i>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
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
