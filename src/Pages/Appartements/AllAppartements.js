import React, { useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';

import { useAllAppartement } from '../../Api/queriesAppartement';
import {
  BackButton,
  DashboardButton,
  HomeButton,
} from '../components/NavigationButton';
import ActiveSecteur from '../Secteurs/ActiveSecteur';

export default function AllAppartements() {
  // Recuperer la Liste des Appartement
  const { data: appartementData, isLoading, error } = useAllAppartement();
  const [searchTerm, setSearchTerm] = useState('');

  // Fonction pour la recherche

  const filterAppartement = appartementData?.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item?.name.toLowerCase().includes(search) ||
      item?.appartementNumber.toString().includes(search) ||
      item?.secteur?.adresse.includes(search)
    );
  });

  return (
    <React.Fragment>
      <div className='page-content'>
        <ActiveSecteur />
        <Container fluid>
          <Breadcrumbs title='Secteurs' breadcrumbItem="Liste d'Appartements" />

          <div className='d-flex flex-wrap gap-4 justify-content-center align-items-center'>
            <BackButton />
            <DashboardButton />
            <HomeButton />
          </div>
          {/* -------------------------- */}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <Row className='d-flex justify-content-between align-items-center g-4 mb-3'>
                    <Col md={6}>
                      {filterAppartement?.length > 0 && (
                        <p className='text-center font-size-15 mt-2'>
                          Appartements Total:{' '}
                          <span className='badge bg-warning'>
                            {' '}
                            {filterAppartement?.length}{' '}
                          </span>
                        </p>
                      )}
                    </Col>
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

                    <div className='table-responsive table-card rs-table-scroll mt-3 mb-1'>
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
                                  N° d'appartement
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
                              </tr>
                            </thead>

                            <tbody className='list form-check-all text-center'>
                              {filterAppartement?.map((appart) => (
                                <tr key={appart?._id} className='text-center'>
                                  <td className='rs-td-tag'>
                                    <span className='badge bg-info text-light'>
                                      {formatPhoneNumber(
                                        appart?.appartementNumber
                                      )}
                                    </span>
                                  </td>
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
                                    {formatPrice(appart?.heurePrice)} {' F '}
                                  </td>
                                  <td>
                                    {formatPrice(appart?.dayPrice)} {' F '}
                                  </td>
                                  <td>
                                    {formatPrice(appart?.weekPrice)} {' F '}
                                  </td>
                                  <td>
                                    {formatPrice(appart?.mounthPrice)} {' F '}
                                  </td>

                                  <td>
                                    {capitalizeWords(
                                      appart?.description || appart?.name
                                    )}
                                  </td>
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
