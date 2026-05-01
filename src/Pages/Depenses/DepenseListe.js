import React, { useContext, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import FormModal from '../components/FormModal';
import LoadingSpiner from '../components/LoadingSpiner';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';
import { deleteButton } from '../components/AlerteModal';
import { useDepensesPaged, useDeleteDepense } from '../../Api/queriesDepense';
import DepenseForm from './DepenseForm';
import {
  BackButton,
  DashboardButton,
  HomeButton,
} from '../components/NavigationButton';
import ActiveSecteur from '../Secteurs/ActiveSecteur';
import { AuthContext } from '../../Auth/AuthContext';
import PaginationControls from '../components/PaginationControls';

export default function DepenseListe() {
  const [form_modal, setForm_modal] = useState(false);
  const [formModalTitle, setFormModalTitle] = useState('Ajouter une Dépense');
  // ------------------------------------------------------------
  // OPTIMISATION: pagination + recherche (server-side)
  // ------------------------------------------------------------
  const [page, setPage] = useState(1);
  const limit = 20;
  const { mutate: deleteDepense, isDeleting } = useDeleteDepense();
  const [depenseToUpdate, setDepenseToUpdate] = useState(null);
  const [todayExpense, setTodayExpense] = useState(false);
  const { auth } = useContext(AuthContext);
  const connectedUserRole = auth?.user?.role ?? null;

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  const { data: paged, isLoading, error } = useDepensesPaged({
    page,
    limit,
    search: searchTerm,
    today: todayExpense,
  });

  // On garde la variable `filterSearchDepense` pour conserver la logique d'affichage.
  // Les filtres sont appliqués côté backend (search + today).
  const filterSearchDepense = paged?.items || [];

  // Total Expense
  // OPTIMISATION: somme globale renvoyée par l'API (toutes les pages),
  // pour conserver le même total sans charger toute la collection.
  const sumTotalExpense = paged?.sumTotalAmount ?? 0;

  // Ouverture de Modal Form
  function tog_form_modal() {
    setForm_modal(!form_modal);
  }

  return (
    <React.Fragment>
      <div className='page-content'>
        <ActiveSecteur />
        <Container fluid>
          <Breadcrumbs title='Transaction' breadcrumbItem='Depense' />
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
              <DepenseForm
                depenseToEdit={depenseToUpdate}
                tog_form_modal={tog_form_modal}
              />
            }
          />

          {/* -------------------- */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='depenseList'>
                    <Row className='g-4 mb-3'>
                      {connectedUserRole === 'admin' && (
                        <Col md={6} className='col-sm-auto'>
                          <div className='d-flex gap-1'>
                            <Button
                              color='info'
                              className='add-btn'
                              id='create-btn'
                              onClick={() => {
                                setDepenseToUpdate(null);
                                tog_form_modal();
                              }}
                            >
                              <i className='fas fa-dollar-sign align-center me-1'></i>{' '}
                              Ajouter une Dépense
                            </Button>
                          </div>
                        </Col>
                      )}

                      <Col md={6} className='col-sm'>
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
                              className='form-control search border border-black rounded'
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
                      </Col>
                    </Row>
                    <div className='d-flex justify-content-around mt-4 flex-wrap'>
                      <h6 className=''>
                        Total Depensés:{' '}
                        <span className='badge bg-danger'>
                          {formatPrice(sumTotalExpense)} F{' '}
                        </span>
                      </h6>
                      <div className='mx-4 d-flex gap-2 text-warning'>
                        <input
                          type='checkbox'
                          className='form-check-input'
                          id='filterToday'
                          onChange={() => {
                            // OPTIMISATION UX: filtre => retour page 1
                            setTodayExpense(!todayExpense);
                            setPage(1);
                          }}
                        />
                        <label
                          className='form-check-label'
                          htmlFor='filterToday'
                        >
                          Depense d'Aujourd'hui
                        </label>
                      </div>
                    </div>
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
                      {filterSearchDepense?.length === 0 && (
                        <div className='text-center text-mutate'>
                          Aucune Dépense trouvée !
                        </div>
                      )}
                      {!error &&
                        !isLoading &&
                        filterSearchDepense.length > 0 && (
                          <table
                            className='table rs-data-table align-middle table-nowrap'
                            id='depenseTable'
                          >
                            <thead className='table-light'>
                              <tr>
                                <th
                                  scope='col'
                                  className='rs-th-nowrap'
                                  style={{ width: '50px' }}
                                >
                                  Date de dépense
                                </th>
                                <th scope='col' className='rs-th-text'>
                                  Secteur
                                </th>
                                <th scope='col' className='rs-th-text'>
                                  Motif de Dépense
                                </th>
                                <th scope='col' className='rs-th-num'>
                                  Montant Dépensé
                                </th>
                                <th scope='col' className='rs-th-actions'>
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className='list form-check-all'>
                              {filterSearchDepense?.length > 0 &&
                                filterSearchDepense?.map((depense) => (
                                  <tr key={depense._id}>
                                    <td className='rs-td-nowrap'>
                                      {new Date(
                                        depense.dateOfDepense
                                      ).toLocaleDateString()}{' '}
                                    </td>

                                    <td className='rs-td-text'>
                                      {capitalizeWords(
                                        depense?.secteur?.adresse
                                      )}
                                    </td>
                                    <td className='rs-td-text text-wrap'>
                                      {capitalizeWords(depense.motifDepense)}
                                    </td>

                                    <td className='rs-td-num text-danger'>
                                      {formatPrice(depense.totalAmount)}
                                      {' F '}
                                    </td>

                                    {connectedUserRole === 'admin' && (
                                      <td className='rs-td-actions'>
                                        <div className='d-flex gap-2'>
                                          <div className='edit'>
                                            <button
                                              className='btn btn-sm btn-success edit-item-btn'
                                              onClick={() => {
                                                setFormModalTitle(
                                                  'Modifier les données'
                                                );
                                                setDepenseToUpdate(depense);
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
                                                    depense._id,
                                                    `depense de ${depense.totalAmount} F
                                                   `,
                                                    deleteDepense
                                                  );
                                                }}
                                              >
                                                <i className='ri-delete-bin-fill text-white'></i>
                                              </button>
                                            </div>
                                          )}
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
