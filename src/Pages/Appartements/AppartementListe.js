import React, { useContext, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { useParams } from 'react-router-dom';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import { deleteButton } from '../components/AlerteModal';

import {
  useAppartementsBySecteur,
  useAppartementsBySecteurPaged,
  useDeleteAppartement,
} from '../../Api/queriesAppartement';
import FormModal from '../components/FormModal';
import AppartementForm from './AppartementForm';
import { useOneSecteur } from '../../Api/queriesSecteurs';
import { AuthContext } from '../../Auth/AuthContext';
import PaginationControls from '../components/PaginationControls';

export default function AppartementListe() {
  const secteur = useParams();
  const { auth } = useContext(AuthContext);
  const connectedUserRole = auth?.user?.role ?? null;
  // ------------------------------------------------------------
  // OPTIMISATION: pagination + recherche côté backend par secteur
  // ------------------------------------------------------------
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 20;

  const { data: paged, isLoading, error } = useAppartementsBySecteurPaged({
    secteurId: secteur.id,
    page,
    limit,
    search: searchTerm,
  });

  // IMPORTANT: page=1 à chaque changement de recherche (UX identique aux autres pages).
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // OPTIMISATION: on conserve l'ancien hook non paginé disponible
  // (utile si tu veux revenir au comportement précédent).
  // eslint-disable-next-line no-unused-vars
  const { data: appartementData } = useAppartementsBySecteur(secteur.id);
  const {
    data: selectedSecteurData,
    isLoading: secteurLoading,
    error: secteurError,
  } = useOneSecteur(secteur.id);

  // Supprimer une Appartement
  const { mutate: deleteAppartement, isLoading: isDeleting } =
    useDeleteAppartement();
  const [form_modal, setForm_modal] = useState(false);
  const [appatementToUpdate, setAppartementToUpdate] = useState(null);
  const [formModalTitle, setFormModalTitle] = useState(
    'Ajouter un appartement'
  );

  const tog_form_modal = () => {
    setForm_modal(!form_modal);
  };

  // Fonction pour la recherche

  // OPTIMISATION: données filtrées/recherchées/paginées côté backend.
  // On garde le nom de variable pour conserver la logique d'affichage inchangée.
  const filterAppartement = paged?.items || [];

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Secteurs' breadcrumbItem="Liste d'Appartements" />
          <FormModal
            form_modal={form_modal}
            setForm_modal={setForm_modal}
            tog_form_modal={tog_form_modal}
            modal_title={formModalTitle}
            size='md'
            bodyContent={
              <AppartementForm
                appartementToEdit={appatementToUpdate}
                selectedSecteur={secteur}
                tog_form_modal={tog_form_modal}
              />
            }
          />
          {/* -------------------------- */}

          <Row>
            <Col lg={12}>
              <Card>
                {secteurLoading && <LoadingSpiner />}
                {selectedSecteurData && !secteurLoading && !secteurError && (
                  <h5 className='text-center my-2 text-info'>
                    Appartements de :{' '}
                    <span className=' text-warning'>
                      Secteur{' '}
                      {formatPhoneNumber(selectedSecteurData?.secteurNumber)}
                    </span>
                  </h5>
                )}
                <CardBody>
                  {connectedUserRole === 'admin' && (
                    <Col>
                      <Button
                        color='info d-flex px-4 gap-2 justify-content-center align-items-center'
                        onClick={() => {
                          setAppartementToUpdate(null);
                          tog_form_modal();
                        }}
                      >
                        <i className='fas fa-plus'></i> Ajouter
                      </Button>
                    </Col>
                  )}
                  <Row className='d-flex justify-content-between align-items-center gap-4 mb-3'>
                    <Col>
                      {paged?.total > 0 && (
                        <p className='text-center font-size-15 mt-2'>
                          Appartements Total:{' '}
                          <span className='text-warning'>
                            {' '}
                            {paged?.total}{' '}
                          </span>
                        </p>
                      )}
                    </Col>
                    <Col className='col-sm'>
                      <div className='d-flex justify-content-sm-end gap-2'>
                        {searchTerm !== '' && (
                          <Button color='danger' onClick={() => setSearchTerm('')}>
                            <i className='fas fa-window-close'></i>
                          </Button>
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
                  <div id='appartementList'>
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

                    <div
                      className='table-responsive table-card rs-table-scroll mt-3 mb-1'
                      // OPTIMISATION UX: suppression de la hauteur minimale forcée
                      // pour éviter l'overflow/scroll imbriqué sur secteur/:id.
                      style={{}}
                    >
                      {!filterAppartement?.length && !isLoading && !error && (
                        <div className='text-center text-mutate'>
                          Aucun Appartement dans ce Secteur !
                        </div>
                      )}
                      {!error &&
                        filterAppartement?.length > 0 &&
                        !isLoading && (
                          <table
                            className='table rs-data-table align-middle table-nowrap table-hover'
                            id='appartementTable'
                          >
                            <thead className='table-light'>
                              <tr className='text-center'>
                                <th scope='col' style={{ width: '50px' }}>
                                  N°
                                </th>
                                <th>Disponibilité</th>
                                <th>Etat</th>
                                <th>Nom</th>
                                <th>Secteur</th>
                                <th>Prix / Heure</th>
                                <th>Prix / Jours</th>
                                <th>Prix / Semaine</th>
                                <th>Prix / Mois</th>

                                <th>Description</th>

                                <th>Action</th>
                              </tr>
                            </thead>

                            <tbody className='list form-check-all text-center'>
                              {filterAppartement?.map((appart) => (
                                <tr key={appart?._id} className='text-center'>
                                  <th scope='row'>
                                    {formatPhoneNumber(
                                      appart?.appartementNumber
                                    )}
                                  </th>
                                  <td>
                                    {appart?.isAvailable ? (
                                      <span className='badge bg-success'>
                                        Disponible
                                      </span>
                                    ) : (
                                      <span className='badge bg-danger'>
                                        non disponible
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <i
                                      className={`${
                                        appart?.etat
                                          ? 'fas fa-check-circle text-success'
                                          : 'fas fa-times-circle text-danger'
                                      }`}
                                    ></i>
                                  </td>

                                  <td>{capitalizeWords(appart?.name)}</td>
                                  <td>
                                    {capitalizeWords(appart?.secteur?.adresse)}
                                  </td>
                                  <td>
                                    {formatPrice(appart?.heurePrice || 0)}{' '}
                                    {' F '}
                                  </td>
                                  <td>
                                    {formatPrice(appart?.dayPrice || 0)} {' F '}
                                  </td>
                                  <td>
                                    {formatPrice(appart?.weekPrice || 0)}{' '}
                                    {' F '}
                                  </td>
                                  <td>
                                    {formatPrice(appart?.mounthPrice || 0)}{' '}
                                    {' F '}
                                  </td>

                                  <td>
                                    {capitalizeWords(
                                      appart?.description || appart?.name
                                    )}
                                  </td>

                                  {connectedUserRole === 'admin' && (
                                    <td>
                                      <div className='d-flex gap-2'>
                                        {isDeleting && <LoadingSpiner />}{' '}
                                        {!isDeleting && (
                                          <div className='remove'>
                                            <button
                                              className='btn btn-sm btn-warning remove-item-btn'
                                              data-bs-toggle='modal'
                                              data-bs-target='#deleteRecordModal'
                                              onClick={(e) => {
                                                setAppartementToUpdate(appart);
                                                setFormModalTitle(
                                                  'Modifier le Donnée'
                                                );
                                                tog_form_modal();
                                                e.stopPropagation();
                                              }}
                                            >
                                              Modifier
                                            </button>
                                          </div>
                                        )}
                                        {!isDeleting && (
                                          <div className='remove'>
                                            <button
                                              className='btn btn-sm btn-danger remove-item-btn'
                                              data-bs-toggle='modal'
                                              data-bs-target='#deleteRecordModal'
                                              onClick={() => {
                                                deleteButton(
                                                  appart?._id,
                                                  appart?.name,
                                                  deleteAppartement
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
