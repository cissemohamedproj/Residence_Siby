import React from 'react';
import { motion } from 'framer-motion';

import { Row, Container, Col, Card, CardBody } from 'reactstrap';
//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';

import { companyName } from '../CompanyInfo/CompanyInfo';
import {
  TotalSecteur,
  TotalAppartement,
  TotalClient,
  TotalContrat,
} from './Total_Items';
import { useActiveContrats } from '../../Api/queriesContrat';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import DureeSejourDisplay from '../components/DureeSejourDisplay';
import LoadingSpiner from '../components/LoadingSpiner';
import { useNavigate } from 'react-router-dom';
import AllReservationListe from '../Reservation/AllReservationListe';
import ActiveSecteur from '../Secteurs/ActiveSecteur';

const Dashboard = () => {
  document.title = `Tableau de Bord | ${companyName} `;

  const {
    data: contrats,
    isLoading: loadingContrat,
    error: errorContrat,
  } = useActiveContrats();

  const navigate = useNavigate();

  const filterActualContrat = contrats?.filter((item) => {
    return item?.statut;
  });

  const today = new Date().toISOString().substring(0, 10);

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid={true}>
          <Breadcrumbs
            title='Administrateur'
            breadcrumbItem='Tableau de bord'
          />
          <ActiveSecteur />
          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Row>
              <Col sm={3} md={6}>
                <TotalSecteur />
              </Col>

              <Col sm={3} md={6}>
                <TotalAppartement />
              </Col>

              <Col sm={3} md={6}>
                <TotalClient />
              </Col>

              <Col sm={3} md={6}>
                <TotalContrat />
              </Col>
            </Row>
          </motion.div>

          <Row>
            <Col lg={12}>
              <Card className='rs-data-card'>
                <CardBody>
                  <div id='clientsList'>
                    <h3 className='text-center fw-bold mb-0'>Contrats en cours</h3>
                    <Row className='g-4 mb-3'>
                      <Col>
                        <p className='text-center font-size-15 mt-2'>
                          Nombre:{' '}
                          <span className='badge bg-warning'>
                            {' '}
                            {filterActualContrat?.length}{' '}
                          </span>
                        </p>
                      </Col>
                    </Row>
                    {errorContrat && (
                      <div className='text-danger text-center'>
                        Erreur de chargement des données
                      </div>
                    )}
                    {loadingContrat && <LoadingSpiner />}

                    <div
                      className='table-responsive table-card rs-table-scroll mt-3'
                      style={{ minHeight: 350 }}
                    >
                      {!filterActualContrat?.length &&
                        !loadingContrat &&
                        !errorContrat && (
                          <div className='text-center text-muted py-5'>
                            Aucun contrat enregistré.
                          </div>
                        )}
                      {!errorContrat &&
                        filterActualContrat?.length > 0 &&
                        !loadingContrat && (
                          <table
                            className='table  align-middle table-nowrap table-hover  rs-contrat-table mb-0'
                            id='contratTable'
                          >
                            <thead className='table-light'>
                              <tr>
                                <th scope='col' className='rs-th-tag'>
                                  Statut
                                </th>
                                <th scope='col' className='rs-th-tag'>
                                  N° d'appartement
                                </th>
                                <th scope='col' className='rs-th-text'>
                                  Secteur
                                </th>
                                <th scope='col' className='rs-th-text'>
                                  Client
                                </th>
                                <th scope='col' className='rs-th-nowrap'>
                                  Téléphone
                                </th>
                                <th scope='col' className='rs-th-nowrap'>
                                  Date d'entrée
                                </th>
                                <th scope='col' className='rs-th-nowrap'>
                                  Date de Sortie
                                </th>
                                <th scope='col' className='rs-th-text text-center'>
                                  Durée
                                </th>
                                <th scope='col' className='rs-th-num'>
                                  Montant
                                </th>
                                <th scope='col' className='rs-th-num'>
                                  Remise
                                </th>
                                <th scope='col' className='rs-th-num'>
                                  Après Remise
                                </th>
                                <th scope='col' className='rs-th-actions'>
                                  Action
                                </th>
                              </tr>
                            </thead>

                            <tbody className='list form-check-all'>
                              {filterActualContrat?.map((contrat) => (
                                <tr key={contrat?._id}>
                                  <td
                                    className={`rs-td-status text-light ${
                                      contrat?.statut
                                        ? 'bg-success'
                                        : 'bg-danger'
                                    }`}
                                  >
                                    {contrat?.statut ? 'En cours' : 'Terminé'}
                                  </td>
                                  <td className='rs-td-tag'>
                                    <span className='badge bg-info rounded rounded-pill text-light'>
                                      {formatPrice(
                                        contrat?.appartement?.appartementNumber
                                      )}
                                    </span>
                                  </td>
                                  <td className='rs-td-text'>
                                    {contrat?.appartement?.secteur?.adresse}
                                  </td>
                                  <td className='rs-td-text'>
                                    {capitalizeWords(
                                      contrat?.client?.firstName +
                                        ' ' +
                                        contrat?.client?.lastName
                                    )}{' '}
                                  </td>
                                  <td className='rs-td-nowrap'>
                                    {formatPhoneNumber(
                                      contrat?.client?.phoneNumber
                                    )}{' '}
                                  </td>
                                  <td className='rs-td-nowrap'>
                                    {new Date(
                                      contrat?.startDate
                                    ).toLocaleDateString('fr-Fr', {
                                      weekday: 'short',
                                      day: '2-digit',
                                      month: 'numeric',
                                      year: 'numeric',
                                    })}{' '}
                                  </td>
                                  <td
                                    className={`rs-td-nowrap ${
                                      new Date(contrat?.endDate)
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
                                    {new Date(
                                      contrat?.endDate
                                    ).toLocaleDateString('fr-Fr', {
                                      weekday: 'short',
                                      day: '2-digit',
                                      month: 'numeric',
                                      year: 'numeric',
                                    })}{' '}
                                  </td>

                                  <td className='rs-td-text text-center align-middle'>
                                    <DureeSejourDisplay
                                      mois={contrat.mois}
                                      semaine={contrat.semaine}
                                      jour={contrat.jour}
                                      heure={contrat.heure}
                                    />
                                  </td>
                                  <td className='rs-td-num'>
                                    {formatPrice(contrat.amount || 0)} F
                                  </td>
                                  <td className='rs-td-num'>
                                    {formatPrice(contrat.reduction || 0)} F
                                  </td>
                                  <td className='rs-td-num'>
                                    {formatPrice(contrat.totalAmount || 0)} F
                                  </td>

                                  <td className='rs-td-actions'>
                                    <i className='fas fa-book-open align-center me-2 '></i>
                                    <strong
                                      className='rs-contrat-link'
                                      role='button'
                                      tabIndex={0}
                                      onClick={() => {
                                        navigate(
                                          `/contrat/document/${contrat._id}`
                                        );
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          navigate(
                                            `/contrat/document/${contrat._id}`
                                          );
                                        }
                                      }}
                                    >
                                      Contrat
                                    </strong>
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

          <AllReservationListe />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
