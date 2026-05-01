import React, { useState } from 'react';
import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import DureeSejourDisplay from '../components/DureeSejourDisplay';
import { useRentalsBySecteur } from '../../Api/queriesReservation';
import { useParams } from 'react-router-dom';
export default function SecteurReservationListe() {
  const param = useParams();
  // OPTIMISATION: on charge uniquement les réservations du secteur sélectionné.
  const { data: rentalsData, isLoading, error } = useRentalsBySecteur(param?.id);

  // State de Rechercher
  const [searchTerm, setSearchTerm] = useState('');

  // Fonction pour filtrer les clients en fonction du terme de recherche
  const filteredRental = rentalsData?.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      // OPTIMISATION: les réservations sont déjà filtrées par secteur côté backend.
      // On conserve la logique de recherche exactement identique.
      (`${item?.client?.firstName} ${item?.client?.lastName}`
        .toLowerCase()
        .includes(search) ||
        item?.client?.phoneNumber.toString().includes(search) ||
        item?.appartement?.secteur.adresse?.toString().includes(search) ||
        new Date(item?.rentalDate)?.toLocaleDateString().includes(search))
    );
  });

  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardBody>
            <div id='clientsList'>
              <h3 className='text-center fw-bold'>Reservations</h3>
              <Row className='g-4 mb-3 d-felx flex-wrap align-items-center justify-content-center justify-content-md-between'>
                <Col md={4}>
                  <p className='font-size-15 mt-2'>
                    Nombre:{' '}
                    <span className='badge bg-warning'>
                      {' '}
                      {filteredRental?.length}{' '}
                    </span>
                  </p>
                </Col>
                <Col md={4} className='col-sm'>
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

              <div
                className='table-responsive table-card rs-table-scroll mt-3'
                // OPTIMISATION UX: suppression de la hauteur minimale forcée
                // pour éviter l'overflow/scroll imbriqué sur secteur/:id.
                style={{}}
              >
                {!filteredRental?.length && !isLoading && !error && (
                  <div className='text-center text-mutate'>
                    Aucune Reservation Enregistré !
                  </div>
                )}
                {!error && filteredRental?.length > 0 && !isLoading && (
                  <table
                    className='table rs-data-table align-middle table-nowrap table-hover'
                    id='contratTable'
                  >
                    <thead className='table-light'>
                      <tr className='text-center'>
                        <th>Date de Reservation</th>
                        <th>Appartement</th>
                        <th>Secteur</th>
                        <th>Client</th>
                        {/* <th>Téléphone</th> */}
                        <th>Durée</th>
                        {/* <th>Semaine</th>

                        <th>Jour</th>
                        <th>Heure</th> */}
                      </tr>
                    </thead>

                    <tbody className='list form-check-all text-center'>
                      {filteredRental?.map((item) => (
                        <tr key={item?._id} className='text-center'>
                          <td
                            className={` text-light ${
                              new Date(item?.rentalDate) > new Date()
                                ? 'bg-warning'
                                : new Date(item?.rentalDate) === new Date()
                                ? 'bg-success'
                                : 'bg-danger'
                            }`}
                          >
                            {new Date(item?.rentalDate).toLocaleDateString(
                              'fr-Fr',
                              {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </td>
                          <td className='rs-td-tag'>
                            <span className='badge bg-info rounded rounded-pill text-light'>
                              {formatPrice(item?.appartement?.appartementNumber)}
                            </span>
                          </td>
                          <td>{item?.appartement?.secteur?.adresse}</td>
                          <td>
                           <p className='mb-0 '>{capitalizeWords(
                              item?.client?.firstName +
                                ' ' +
                                item?.client?.lastName
                            )}</p>

                            <p>{formatPhoneNumber(item?.client?.phoneNumber)}{' '}</p>
                          </td>
                          
                          <td className='align-middle'>
                            <DureeSejourDisplay
                              mois={item.mois}
                              semaine={item.semaine}
                              jour={item.jour}
                              heure={item.heure}
                            />
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
  );
}
