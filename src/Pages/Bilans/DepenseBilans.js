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
import { useAllDepenses } from '../../Api/queriesDepense';
import { useAllSecteur } from '../../Api/queriesSecteurs';

export default function DepenseBilans() {
  const tableRef = useRef(null);
  const { data: depenseData, isLoading, error } = useAllDepenses();
  const {
    data: secteursData,
    isLoading: isLoadingSecteurs,
    error: errorSecteurs,
  } = useAllSecteur();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSecteur, setSelectedSecteur] = useState(null);

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

  const filterDepense = useMemo(
    () =>
      depenseData
        ?.filter((item) => isBetweenDates(item?.dateOfDepense))
        ?.filter((item) => {
          if (!selectedSecteur) return true;
          return item?.secteur?._id === selectedSecteur;
        }),
    [depenseData, isBetweenDates, selectedSecteur]
  );

  const sumTotalDepense = useMemo(
    () =>
      filterDepense?.reduce(
        (curr, item) => curr + (Number(item?.totalAmount) || 0),
        0
      ) ?? 0,
    [filterDepense]
  );

  const excelFilename = useMemo(() => {
    if (startDate && endDate) {
      return `bilans_depenses_${startDate}_au_${endDate}`;
    }
    return `bilans_depenses_${new Date().toISOString().slice(0, 10)}`;
  }, [startDate, endDate]);

  const nbDepenses = filterDepense?.length ?? 0;

  return (
    <Row>
      <Col lg={12}>
        <Card className='border-0 shadow-sm'>
          <CardBody className='p-4'>
            <div id='bilanssList'>
              <div className='d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4'>
                <div>
                  <h4 className='mb-1'>Bilan des dépenses</h4>
                  <p className='text-muted small mb-0'>
                    Liste et total des dépenses selon filtres.
                  </p>
                </div>
                <DownloadTableExcel
                  filename={excelFilename}
                  sheet='Bilan dépenses'
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
                        onChange={(e) => setStartDate(e.target.value || null)}
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
                <Col sm={6} md={4}>
                  <div className='rs-bilan-stat h-100'>
                    <span className='rs-bilan-stat__label'>
                      Nombre de dépenses
                    </span>
                    <span className='rs-bilan-stat__value text-info'>
                      {nbDepenses}
                    </span>
                  </div>
                </Col>
                <Col sm={6} md={4}>
                  <div className='rs-bilan-stat h-100 rs-bilan-stat--highlight'>
                    <span className='rs-bilan-stat__label'>Total dépenses</span>
                    <span className='rs-bilan-stat__value rs-bilan-stat__value--num text-danger'>
                      {formatPrice(sumTotalDepense)} F
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
                {(filterDepense?.length ?? 0) === 0 && (
                  <div className='text-center text-muted py-4'>
                    Aucune dépense trouvée.
                  </div>
                )}
                {!error && !isLoading && (filterDepense?.length ?? 0) > 0 && (
                  <table
                    className='table rs-data-table align-middle table-nowrap mb-0'
                    id='depenseTable'
                    ref={tableRef}
                  >
                    <thead className='table-light'>
                      <tr>
                        <th scope='col' className='rs-th-nowrap'>
                          Date de dépense
                        </th>
                        <th scope='col' className='rs-th-tag'>
                          Appartement N°
                        </th>
                        <th scope='col' className='rs-th-text'>
                          Secteur
                        </th>
                        <th scope='col' className='rs-th-text'>
                          Motif de dépense
                        </th>
                        <th scope='col' className='rs-th-num'>
                          Montant dépensé
                        </th>
                      </tr>
                    </thead>
                    <tbody className='list form-check-all'>
                      {filterDepense?.map((depense) => {
                        const aptNum =
                          depense?.rental?.appartement?.appartementNumber;
                        return (
                        <tr key={depense._id}>
                          <td className='rs-td-nowrap'>
                            {new Date(
                              depense.dateOfDepense
                            ).toLocaleDateString('fr-FR')}
                          </td>
                          <td className='rs-td-tag'>
                            <span className='badge bg-info text-light'>
                              {aptNum != null && aptNum !== ''
                                ? formatPrice(aptNum)
                                : '—'}
                            </span>
                          </td>
                          <td className='rs-td-text'>
                            {capitalizeWords(depense?.secteur?.adresse)}
                          </td>
                          <td className='rs-td-text text-wrap'>
                            {capitalizeWords(depense.motifDepense)}
                          </td>
                          <td className='rs-td-num text-danger'>
                            {formatPrice(depense.totalAmount)} F
                          </td>
                        </tr>
                        )
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
