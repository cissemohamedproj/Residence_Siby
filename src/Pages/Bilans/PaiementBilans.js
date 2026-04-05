import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Col,
  Input,
  Label,
  Row,
} from 'reactstrap';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import LoadingSpiner from '../components/LoadingSpiner';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useAllContrat } from '../../Api/queriesContrat';
import { useAllDepenses } from '../../Api/queriesDepense';
import { useAllSecteur } from '../../Api/queriesSecteurs';
import { useAllRental } from '../../Api/queriesReservation';
import { useAllComissions } from '../../Api/queriesComission';
export default function PaiementBilans() {
  const {
    data: secteursData,
    isLoading: isLoadingSecteurs,
    error: errorSecteurs,
  } = useAllSecteur();
  const { data: paiementsData, isLoading, error } = useAllPaiements();
  const { data: contrats } = useAllContrat();
  const { data: rentals } = useAllRental();
  const { data: comissions } = useAllComissions();
  const { data: depenses } = useAllDepenses();
  const tableRef = useRef(null);
  const [selectedSecteur, setSelectedSecteur] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const isBetweenDates = useCallback(
    (dateStr) => {
      if (!startDate || !endDate) return true;
      if (dateStr == null || dateStr === '') return false;
      const date = new Date(dateStr).getTime();
      if (Number.isNaN(date)) return false;
      const start = new Date(startDate).getTime();
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end.getTime();
    },
    [startDate, endDate]
  );

  const filterContrat = useMemo(
    () =>
      contrats
        ?.filter((item) => isBetweenDates(item?.startDate))
        ?.filter((item) => {
          if (!selectedSecteur) return true;
          return item?.appartement?.secteur?._id === selectedSecteur;
        }),
    [contrats, isBetweenDates, selectedSecteur]
  );

  const filterRentals = useMemo(
    () =>
      rentals
        ?.filter((item) =>
          isBetweenDates(item?.rentalDate ?? item?.startDate)
        )
        ?.filter((item) => {
          if (!selectedSecteur) return true;
          return item?.appartement?.secteur?._id === selectedSecteur;
        }),
    [rentals, isBetweenDates, selectedSecteur]
  );

  const filterPaiement = useMemo(
    () =>
      paiementsData
        ?.filter((item) => isBetweenDates(item.paiementDate))
        ?.filter((item) => {
          if (!selectedSecteur) return true;
          return (
            item?.contrat?.appartement?.secteur?._id === selectedSecteur ||
            item?.rental?.appartement?.secteur?._id === selectedSecteur
          );
        }),
    [paiementsData, isBetweenDates, selectedSecteur]
  );

  const filterComission = useMemo(
    () =>
      comissions
        ?.filter((item) => isBetweenDates(item.paiementDate))
        ?.filter((item) => {
          if (!selectedSecteur) return true;
          return item?.secteur?._id === selectedSecteur;
        }),
    [comissions, isBetweenDates, selectedSecteur]
  );

  const filterDepense = useMemo(
    () =>
      depenses
        ?.filter((item) => isBetweenDates(item.dateOfDepense))
        ?.filter((item) => {
          if (!selectedSecteur) return true;
          return item?.secteur?._id === selectedSecteur;
        }),
    [depenses, isBetweenDates, selectedSecteur]
  );

  const sumTotalRentalsAmount = useMemo(
    () =>
      filterRentals?.reduce(
        (curr, item) => curr + (Number(item?.totalAmount) || 0),
        0
      ) ?? 0,
    [filterRentals]
  );

  const sumTotalContratAmount = useMemo(
    () =>
      filterContrat?.reduce(
        (curr, item) => curr + (Number(item?.totalAmount) || 0),
        0
      ) ?? 0,
    [filterContrat]
  );

  const sumTotalComission = useMemo(
    () =>
      filterComission?.reduce(
        (curr, item) => curr + (Number(item?.amount) || 0),
        0
      ) ?? 0,
    [filterComission]
  );

  const sumTotalPaye = useMemo(
    () =>
      filterPaiement?.reduce(
        (curr, item) => curr + (Number(item?.totalPaye) || 0),
        0
      ) ?? 0,
    [filterPaiement]
  );

  const sumTotalDepense = useMemo(
    () =>
      filterDepense?.reduce(
        (curr, item) => curr + (Number(item?.totalAmount) || 0),
        0
      ) ?? 0,
    [filterDepense]
  );

  const sumTotalAmount = sumTotalContratAmount + sumTotalRentalsAmount;
  const revenueAmount = sumTotalPaye - sumTotalComission - sumTotalDepense;
  const reliquat = sumTotalAmount - sumTotalPaye;

  const excelFilename = useMemo(() => {
    if (startDate && endDate) {
      return `bilans_paiements_${startDate}_au_${endDate}`;
    }
    return `bilans_paiements_${new Date().toISOString().slice(0, 10)}`;
  }, [startDate, endDate]);

  const nbContrats = filterContrat?.length ?? 0;
  const nbReservations = filterRentals?.length ?? 0;

  const formatRowDate = (value) => {
    if (value == null || value === '') return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR');
  };

  return (
    <Row>
      <Col lg={12}>
        <Card className='border-0 shadow-sm'>
          <CardBody className='p-4'>
            <div id='bilanssList'>
              <div className='d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4'>
                <div>
                  <h4 className='mb-1'>Bilan des paiements</h4>
                  <p className='text-muted small mb-0'>
                    Synthèse et détail des encaissements selon filtres.
                  </p>
                </div>
                <DownloadTableExcel
                  filename={excelFilename}
                  sheet='Bilan paiements'
                  currentTableRef={tableRef.current}
                >
                  <Button color='success' outline className='text-nowrap'>
                    <i className='fas fa-file-excel me-2' />
                    Télécharger Excel
                  </Button>
                </DownloadTableExcel>
              </div>

              <Card className='border rs-bilan-filters mb-4'>
                <CardBody className='py-3'>
                  <Row className='g-3 align-items-end'>
                    <Col md={4} sm={6}>
                      <Label className='form-label small text-muted mb-1'>
                        Secteur
                      </Label>
                      {isLoadingSecteurs && <LoadingSpiner />}
                      {errorSecteurs && (
                        <div className='text-danger small'>
                          Erreur secteurs
                        </div>
                      )}
                      {!isLoadingSecteurs &&
                        !errorSecteurs &&
                        secteursData?.length > 0 && (
                          <Input
                            type='select'
                            value={selectedSecteur ?? ''}
                            onChange={(e) =>
                              setSelectedSecteur(
                                e.target.value === '' ? null : e.target.value
                              )
                            }
                          >
                            <option value=''>Tous les secteurs</option>
                            {secteursData?.map((secteur) => (
                              <option key={secteur._id} value={secteur._id}>
                                {capitalizeWords(secteur.adresse)}
                              </option>
                            ))}
                          </Input>
                        )}
                    </Col>
                    <Col md={3} sm={6}>
                      <Label className='form-label small text-muted mb-1'>
                        Date début
                      </Label>
                      <Input
                        name='startDate'
                        type='date'
                        value={startDate ?? ''}
                        onChange={(e) =>
                          setStartDate(e.target.value || null)
                        }
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </Col>
                    <Col md={3} sm={6}>
                      <Label className='form-label small text-muted mb-1'>
                        Date fin
                      </Label>
                      <Input
                        name='endDate'
                        type='date'
                        value={endDate ?? ''}
                        onChange={(e) => setEndDate(e.target.value || null)}
                        min={startDate ?? undefined}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </Col>
                    <Col md={2} sm={12}>
                      <Button
                        color='outline-secondary'
                        className='w-100'
                        type='button'
                        onClick={() => {
                          setStartDate(null);
                          setEndDate(null);
                          setSelectedSecteur(null);
                        }}
                      >
                        Réinitialiser
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              <Row className='g-3 mb-4'>
                <Col sm={6} md={4} lg={3}>
                  <div className='rs-bilan-stat h-100'>
                    <span className='rs-bilan-stat__label'>Contrats</span>
                    <span className='rs-bilan-stat__value text-info'>
                      {nbContrats}
                    </span>
                  </div>
                </Col>
                <Col sm={6} md={4} lg={3}>
                  <div className='rs-bilan-stat h-100'>
                    <span className='rs-bilan-stat__label'>Réservations</span>
                    <span className='rs-bilan-stat__value text-info'>
                      {nbReservations}
                    </span>
                  </div>
                </Col>
                <Col sm={6} md={4} lg={3}>
                  <div className='rs-bilan-stat h-100'>
                    <span className='rs-bilan-stat__label'>Total payé</span>
                    <span className='rs-bilan-stat__value rs-bilan-stat__value--num text-success'>
                      {formatPrice(sumTotalPaye)} F
                    </span>
                  </div>
                </Col>
                <Col sm={6} md={4} lg={3}>
                  <div className='rs-bilan-stat h-100'>
                    <span className='rs-bilan-stat__label'>
                      Volume (contrats + réservations.)
                    </span>
                    <span className='rs-bilan-stat__value rs-bilan-stat__value--num'>
                      {formatPrice(sumTotalAmount)} F
                    </span>
                    <span className='rs-bilan-stat__hint'>
                      Montant total des Bien sur la période
                    </span>
                  </div>
                </Col>
                <Col sm={6} md={4} lg={3}>
                  <div className='rs-bilan-stat h-100'>
                    <span className='rs-bilan-stat__label'>Commissions</span>
                    <span className='rs-bilan-stat__value rs-bilan-stat__value--num text-danger'>
                      {formatPrice(sumTotalComission)} F
                    </span>
                  </div>
                </Col>
                <Col sm={6} md={4} lg={3}>
                  <div className='rs-bilan-stat h-100'>
                    <span className='rs-bilan-stat__label'>Reliquat</span>
                    <span className='rs-bilan-stat__value rs-bilan-stat__value--num text-danger'>
                      {formatPrice(reliquat)} F
                    </span>
                  </div>
                </Col>
                <Col sm={6} md={4} lg={3}>
                  <div className='rs-bilan-stat h-100'>
                    <span className='rs-bilan-stat__label'>Dépenses</span>
                    <span className='rs-bilan-stat__value rs-bilan-stat__value--num text-danger'>
                      {formatPrice(sumTotalDepense)} F
                    </span>
                  </div>
                </Col>
                <Col sm={6} md={4} lg={3}>
                  <div className='rs-bilan-stat h-100 rs-bilan-stat--highlight'>
                    <span className='rs-bilan-stat__label'>Revenu net</span>
                    <span
                      className={`rs-bilan-stat__value rs-bilan-stat__value--num ${
                        revenueAmount >= 0 ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {formatPrice(revenueAmount)} F
                    </span>
                    <span className='rs-bilan-stat__hint'>
                      Payé − commissions − dépenses
                    </span>
                  </div>
                </Col>
              </Row>

              {error && (
                <div className='text-danger text-center mb-3'>
                  Erreur de chargement des données
                </div>
              )}
              {isLoading && <LoadingSpiner />}

              <div className='table-responsive table-card rs-table-scroll mt-2 mb-1'>
                {!isLoading &&
                  !error &&
                  (filterPaiement?.length ?? 0) === 0 && (
                    <div className='text-center text-muted py-4'>
                      Aucun paiement trouvé.
                    </div>
                  )}
                {!error &&
                  !isLoading &&
                  (filterPaiement?.length ?? 0) > 0 && (
                    <table
                      className='table rs-data-table align-middle table-nowrap mb-0 table-hover'
                      id='paiementTable'
                      ref={tableRef}
                    >
                      <thead className='table-light'>
                        <tr>
                          <th scope='col' className='rs-th-nowrap text-center'>
                            Date de paiement
                          </th>
                          <th scope='col' className='rs-th-tag text-center'>
                            Appartement N°
                          </th>
                          <th scope='col' className='rs-th-text text-center'>
                            Secteur
                          </th>
                          <th scope='col' className='rs-th-text text-center'>
                            Client
                          </th>
                          <th scope='col' className='rs-th-text text-center'>
                            Pièce d&apos;identité
                          </th>
                          <th scope='col' className='rs-th-num text-center'>
                            Montant payé
                          </th>
                        </tr>
                      </thead>
                      <tbody className='list form-check-all'>
                        {filterPaiement?.map((paiement) => {
                          const client =
                            paiement?.contrat?.client ||
                            paiement?.rental?.client;
                          const appartement =
                            paiement?.contrat?.appartement ||
                            paiement?.rental?.appartement;
                          const secteur = appartement?.secteur;
                          const clientName = [client?.firstName, client?.lastName]
                            .filter(Boolean)
                            .join(' ');
                          return (
                            <tr key={paiement?._id}>
                              <td className='rs-td-nowrap text-center'>
                                {formatRowDate(paiement?.paiementDate)}
                              </td>
                              <td className='rs-td-tag text-center'>
                                <span className='badge bg-info text-light'>
                                  {formatPrice(
                                    appartement?.appartementNumber || 0
                                  )}
                                </span>
                              </td>
                              <td className='rs-td-text text-center'>
                                {capitalizeWords(secteur?.adresse)}
                              </td>
                              <td className='rs-td-text text-center'>
                                {clientName
                                  ? capitalizeWords(clientName)
                                  : '—'}
                              </td>
                              <td className='rs-td-text text-center'>
                                {client?.pieceNumber ?? '—'}
                              </td>
                              <td className='rs-td-num text-center text-success'>
                                {formatPrice(
                                  Number(paiement?.totalPaye) || 0
                                )}{' '}
                                F
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
  );
}
