import React, { useState } from 'react';
import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import DureeSejourDisplay from '../components/DureeSejourDisplay';
import { useRentalsPaged } from '../../Api/queriesReservation';
import PaginationControls from '../components/PaginationControls';
export default function AllReservationListe() {
  // ------------------------------------------------------------
  // OPTIMISATION (dashboard): pagination + recherche (server-side)
  // ------------------------------------------------------------
  const [page, setPage] = useState(1);
  const limit = 20;

  // State de Rechercher
  const [searchTerm, setSearchTerm] = useState('');

  const { data: paged, isLoading, error } = useRentalsPaged({
    page,
    limit,
    search: searchTerm,
  });

  // On garde `filteredRental` pour ne pas changer la logique d'affichage.
  const filteredRental = paged?.items || [];

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
                      {paged?.total ?? filteredRental?.length ?? 0}{' '}
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
                          onChange={(e) => {
                            // OPTIMISATION UX: recherche => retour page 1 (sans reload)
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

              <div
                className='table-responsive table-card rs-table-scroll mt-3'
                style={{ minHeight: 350 }}
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
                        <th>Statut</th>
                        <th>Date de Reservation</th>
                        <th>Date de Changement</th>
                        <th>Fin</th>
                        <th>N° d'Appartement</th>
                        <th>Secteur</th>
                        <th>Client</th>
                        <th>Téléphone</th>
                        <th>Montant </th>
                        <th> Payé</th>
                        <th>Reliquat</th>
                        <th>Durée</th>
                      </tr>
                    </thead>

                    <tbody className='list form-check-all text-center'>
                      {filteredRental?.map((item) => (
                        <tr key={item?._id} className='text-center'>
                          <td
                            className={`${
                              item.statut === 'validéé'
                                ? 'text-success'
                                : item.statut === 'annulée'
                                ? 'text-danger'
                                : 'text-warning'
                            }`}
                          >
                            {capitalizeWords(item?.statut)}
                          </td>

                          <td>
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
                          <td>
                            {item?.rentalChangeDate
                              ? new Date(
                                  item?.rentalChangeDate
                                ).toLocaleDateString('fr-Fr', {
                                  weekday: 'short',
                                  day: '2-digit',
                                  month: 'numeric',
                                  year: 'numeric',
                                })
                              : '-------'}
                          </td>
                          <td
                            className={` text-light ${
                              new Date(item?.rentalEndDate) > new Date()
                                ? 'bg-warning'
                                : new Date(item?.rentalEndDate) === new Date()
                                ? 'bg-success'
                                : 'bg-danger'
                            }`}
                          >
                            {new Date(item?.rentalEndDate).toLocaleDateString(
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
                            {capitalizeWords(
                              item?.client?.firstName +
                                ' ' +
                                item?.client?.lastName
                            )}{' '}
                          </td>
                          <td>
                            {formatPhoneNumber(item?.client?.phoneNumber)}{' '}
                          </td>

                          <td>{formatPrice(item.totalAmount || 0)} F </td>
                          <td>{formatPrice(item.totalPaye || 0)} F </td>
                          <td>
                            {formatPrice(
                              item.totalAmount - item.totalPaye || 0
                            )}{' '}
                            F{' '}
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
