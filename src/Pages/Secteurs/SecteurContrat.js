import React, { useContext, useState } from 'react';
import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import DureeSejourDisplay from '../components/DureeSejourDisplay';
import { useContratsBySecteurPaged } from '../../Api/queriesContrat';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../Auth/AuthContext';
import PaginationControls from '../components/PaginationControls';
export default function SecteurContrat() {
  const param = useParams();
  // ------------------------------------------------------------
  // OPTIMISATION: pagination + recherche côté backend par secteur
  // ------------------------------------------------------------
  const [page, setPage] = useState(1);
  const limit = 20;
  // State de Rechercher
  const [searchTerm, setSearchTerm] = useState('');

  // IMPORTANT: page=1 à chaque changement de recherche
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const { data: paged, isLoading, error } = useContratsBySecteurPaged({
    secteurId: param?.id,
    page,
    limit,
    search: searchTerm,
  });

  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const connectedUserRole = auth?.user?.role ?? null;

  // OPTIMISATION: recherche gérée côté backend => pas de filtre côté front
  // On conserve le même nom de variable pour ne pas changer la logique d'affichage.
  const filteredContrat = paged?.items || [];

  const today = new Date().toISOString().substring(0, 10);

  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardBody>
            <div id='clientsList'>
              <h3 className='text-center fw-bold'>Contrats</h3>

              <Row className='gab-4 mb-3'>
                <Col>
                  <p className='text-center font-size-15 mt-2'>
                    Nombre:{' '}
                    <span className='text-warning'>
                      {' '}
                      {paged?.total || 0}{' '}
                    </span>
                  </p>
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

              {/* OPTIMISATION UX: pas de maxHeight/minHeight forcés pour éviter
                  le scroll vertical interne. Le tableau prend la hauteur
                  de son contenu, la page scroll naturellement. */}
              <div className='table-responsive table-card rs-table-scroll mt-3 mb-1' style={{ width: '100%' }}>
                {!filteredContrat?.length && !isLoading && !error && (
                  <div className='text-center text-mutate'>
                    Aucun Contrat Enregistré !
                  </div>
                )}
                {!error && filteredContrat?.length > 0 && !isLoading && (
                  <table
                    className='table rs-data-table align-middle table-hover'
                    id='fournisseurTable'
                  >
                    <thead className='table-light'>
                      <tr className='text-center'>
                        <th>Statut</th>
                        <th>Appartement</th>
                        <th>Client</th>
                        {/* <th>Téléphone</th> */}
                        <th>Début</th>
                        <th>Fin</th>
                        <th>Durée</th>
                        {/* <th>Semaine</th>

                        <th>Jour</th>
                        <th>Heure</th> */}
                        <th>Montant</th>
                        <th>Remise</th>
                        <th>Après Remise</th>

                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody className='list form-check-all text-center'>
                      {filteredContrat?.map((contrat) => (
                        <tr key={contrat?._id} className='text-center'>
                          <td
                            className={` text-light ${
                              contrat?.statut ? 'bg-success' : 'bg-danger'
                            }`}
                          >
                            {contrat?.statut ? 'En cours' : 'Terminé'}
                          </td>
                          <th className='badge bg-info  rounded rounded-pill text-center text-light'>
                            {formatPrice(
                              contrat?.appartement?.appartementNumber
                            )}{' '}
                          </th>
                          <td className='text-center '>
                          <p className='mb-0 '>{capitalizeWords(
                              contrat?.client?.firstName +
                                ' ' +
                                contrat?.client?.lastName
                            )}</p>

                            <p>{formatPhoneNumber(contrat?.client?.phoneNumber)}{' '}</p>
                          
                          </td>
                          

                          <td>
                            {new Date(contrat.startDate).toLocaleDateString(
                              'fr-Fr',
                              {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'numeric',
                                year: 'numeric',
                              }
                            )}{' '}
                          </td>
                          <td
                            className={`${
                              new Date(contrat.endDate)
                                .toISOString()
                                .substring(0, 10) > today
                                ? 'text-success'
                                : new Date(contrat.endDate)
                                    .toISOString()
                                    .substring(0, 10) < today
                                ? 'text-danger'
                                : new Date(contrat.endDate)
                                    .toISOString()
                                    .substring(0, 10) === today
                                ? 'text-warning'
                                : ''
                            }`}
                          >
                            {new Date(contrat.endDate).toLocaleDateString(
                              'fr-Fr',
                              {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'numeric',
                                year: 'numeric',
                              }
                            )}{' '}
                          </td>

                          <td className='align-middle'>
                            <DureeSejourDisplay
                              mois={contrat.mois}
                              semaine={contrat.semaine}
                              jour={contrat.jour}
                              heure={contrat.heure}
                            />
                          </td>


                          <td>{formatPrice(contrat.amount || 0)} F</td>
                          <td>{formatPrice(contrat.reduction || 0)} F</td>
                          <td>{formatPrice(contrat.totalAmount || 0)} F</td>

                          {connectedUserRole === 'admin' && (
                            <td className='text-center'>
                              <div className='d-flex justify-content-center align-items-center gap-2'>
                                <div className='edit'>
                                  <button
                                    className='btn btn-sm btn-info'
                                    onClick={() => {
                                      navigate(
                                        `/contrat/document/${contrat._id}`
                                      );
                                    }}
                                  >
                                    <i className='fas fa-receipt text-white'></i>
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
  );
}
