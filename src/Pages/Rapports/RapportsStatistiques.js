import React, { useCallback, useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
} from 'reactstrap';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpiner from '../components/LoadingSpiner';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { useAllContrat } from '../../Api/queriesContrat';
import { useAllDepenses } from '../../Api/queriesDepense';
import { useAllSecteur } from '../../Api/queriesSecteurs';
import { useAllRental } from '../../Api/queriesReservation';
import { useAllComissions } from '../../Api/queriesComission';
import { useAllClient } from '../../Api/queriesClient';
import { useAllAppartement } from '../../Api/queriesAppartement';
import { companyName } from '../CompanyInfo/CompanyInfo';

const CHART_COLORS = ['#0d9488', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

export default function RapportsStatistiques() {
  document.title = `Rapports & statistiques | ${companyName}`;

  const { data: secteursData, isLoading: loadSecteurs } = useAllSecteur();
  const { data: paiementsData, isLoading: loadPaiements } = useAllPaiements();
  const { data: contrats, isLoading: loadContrats } = useAllContrat();
  const { data: rentals, isLoading: loadRentals } = useAllRental();
  const { data: comissions, isLoading: loadComissions } = useAllComissions();
  const { data: depenses, isLoading: loadDepenses } = useAllDepenses();
  const { data: clients, isLoading: loadClients } = useAllClient();
  const { data: appartements, isLoading: loadApparts } = useAllAppartement();

  const [selectedSecteur, setSelectedSecteur] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const isBetweenDates = useCallback(
    (dateStr) => {
      if (!startDate || !endDate) return true;
      const t = new Date(dateStr).getTime();
      if (Number.isNaN(t)) return false;
      const start = new Date(startDate).getTime();
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return t >= start && t <= end.getTime();
    },
    [startDate, endDate]
  );

  const filterContrat = useMemo(() => {
    return contrats
      ?.filter((item) => isBetweenDates(item?.startDate))
      ?.filter((item) => {
        if (!selectedSecteur) return true;
        return item?.appartement?.secteur?._id === selectedSecteur;
      });
  }, [contrats, isBetweenDates, selectedSecteur]);

  const filterRentals = useMemo(() => {
    return rentals
      ?.filter((item) =>
        isBetweenDates(item?.rentalDate ?? item?.startDate)
      )
      ?.filter((item) => {
        if (!selectedSecteur) return true;
        return item?.appartement?.secteur?._id === selectedSecteur;
      });
  }, [rentals, isBetweenDates, selectedSecteur]);

  const filterPaiement = useMemo(() => {
    return paiementsData
      ?.filter((item) => isBetweenDates(item?.paiementDate))
      ?.filter((item) => {
        if (!selectedSecteur) return true;
        return (
          item?.contrat?.appartement?.secteur?._id === selectedSecteur ||
          item?.rental?.appartement?.secteur?._id === selectedSecteur
        );
      });
  }, [paiementsData, isBetweenDates, selectedSecteur]);

  const filterComission = useMemo(() => {
    return comissions
      ?.filter((item) => isBetweenDates(item?.paiementDate))
      ?.filter((item) => {
        if (!selectedSecteur) return true;
        return item?.secteur?._id === selectedSecteur;
      });
  }, [comissions, isBetweenDates, selectedSecteur]);

  const filterDepense = useMemo(() => {
    return depenses
      ?.filter((item) => isBetweenDates(item?.dateOfDepense))
      ?.filter((item) => {
        if (!selectedSecteur) return true;
        return item?.secteur?._id === selectedSecteur;
      });
  }, [depenses, isBetweenDates, selectedSecteur]);

  const sumTotalContratAmount = useMemo(
    () =>
      filterContrat?.reduce((a, item) => a + (Number(item?.totalAmount) || 0), 0) ||
      0,
    [filterContrat]
  );

  const sumTotalRentalAmount = useMemo(
    () =>
      filterRentals?.reduce((a, item) => a + (Number(item?.totalAmount) || 0), 0) ||
      0,
    [filterRentals]
  );

  const sumTotalPaye = useMemo(
    () =>
      filterPaiement?.reduce((a, item) => a + (Number(item?.totalPaye) || 0), 0) ||
      0,
    [filterPaiement]
  );

  const sumTotalDepense = useMemo(
    () =>
      filterDepense?.reduce((a, item) => a + (Number(item?.totalAmount) || 0), 0) ||
      0,
    [filterDepense]
  );

  const sumTotalComission = useMemo(
    () =>
      filterComission?.reduce((a, item) => a + (Number(item?.amount) || 0), 0) ||
      0,
    [filterComission]
  );

  const contratsActifs = useMemo(
    () => filterContrat?.filter((c) => c?.statut)?.length ?? 0,
    [filterContrat]
  );

  const appartLibres = useMemo(
    () => appartements?.filter((a) => a?.isAvailable)?.length ?? 0,
    [appartements]
  );

  const monthlyEncaissements = useMemo(() => {
    const map = {};
    filterPaiement?.forEach((p) => {
      const d = new Date(p?.paiementDate);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + (Number(p?.totalPaye) || 0);
    });
    return Object.keys(map)
      .sort()
      .map((k) => ({
        mois: new Date(`${k}-01T12:00:00`).toLocaleDateString('fr-FR', {
          month: 'short',
          year: 'numeric',
        }),
        montant: map[k],
      }));
  }, [filterPaiement]);

  const encaissementsParSecteur = useMemo(() => {
    const m = {};
    filterPaiement?.forEach((p) => {
      const addr =
        p?.contrat?.appartement?.secteur?.adresse ||
        p?.rental?.appartement?.secteur?.adresse ||
        'Non renseigné';
      const label = capitalizeWords(String(addr));
      m[label] = (m[label] || 0) + (Number(p?.totalPaye) || 0);
    });
    return Object.entries(m)
      .map(([name, montant]) => ({ name, montant }))
      .sort((a, b) => b.montant - a.montant)
      .slice(0, 10);
  }, [filterPaiement]);

  const pieFlux = useMemo(
    () => [
      { name: 'Encaissements', value: Math.round(sumTotalPaye) },
      { name: 'Dépenses', value: Math.round(sumTotalDepense) },
      { name: 'Commissions', value: Math.round(sumTotalComission) },
    ],
    [sumTotalPaye, sumTotalDepense, sumTotalComission]
  );

  const loading =
    loadSecteurs ||
    loadPaiements ||
    loadContrats ||
    loadRentals ||
    loadComissions ||
    loadDepenses ||
    loadClients ||
    loadApparts;

  const solde = sumTotalPaye - sumTotalDepense;

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs
            title='Rapports'
            breadcrumbItem='Statistiques'
          />

          <Card className='rs-report-filters mb-4 border-0 shadow-sm'>
            <CardBody className='py-3'>
              <Row className='align-items-end g-3'>
                <Col md={3} sm={6}>
                  <Label className='form-label small text-muted mb-1'>
                    Date début
                  </Label>
                  <Input
                    type='date'
                    name='startDate'
                    value={startDate ?? ''}
                    onChange={(e) =>
                      setStartDate(e.target.value || null)
                    }
                  />
                </Col>
                <Col md={3} sm={6}>
                  <Label className='form-label small text-muted mb-1'>
                    Date fin
                  </Label>
                  <Input
                    type='date'
                    name='endDate'
                    value={endDate ?? ''}
                    min={startDate ?? undefined}
                    onChange={(e) => setEndDate(e.target.value || null)}
                  />
                </Col>
                <Col md={4} sm={12}>
                  <Label className='form-label small text-muted mb-1'>
                    Secteur
                  </Label>
                  <Input
                    type='select'
                    value={selectedSecteur || ''}
                    onChange={(e) =>
                      setSelectedSecteur(e.target.value || null)
                    }
                  >
                    <option value=''>Tous les secteurs</option>
                    {secteursData?.map((s) => (
                      <option key={s._id} value={s._id}>
                        {capitalizeWords(s.adresse)}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md={2} sm={12}>
                  <button
                    type='button'
                    className='btn btn-outline-secondary w-100'
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                      setSelectedSecteur(null);
                    }}
                  >
                    Réinitialiser
                  </button>
                </Col>
              </Row>
              <p className='small text-muted mb-0 mt-2'>
                Sans dates : toutes les périodes. Les filtres s’appliquent aux
                indicateurs et graphiques ci-dessous.
              </p>
            </CardBody>
          </Card>

          {loading && (
            <div className='py-5'>
              <LoadingSpiner />
            </div>
          )}

          {!loading && (
            <>
              <Row className='g-3 mb-4'>
                <Col xl={3} md={6}>
                  <Card className='border-0 shadow-sm h-100 rs-report-kpi'>
                    <CardBody>
                      <p className='text-muted small mb-1'>Encaissements</p>
                      <h4 className='text-info mb-0'>
                        {formatPrice(sumTotalPaye)} F
                      </h4>
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={3} md={6}>
                  <Card className='border-0 shadow-sm h-100 rs-report-kpi'>
                    <CardBody>
                      <p className='text-muted small mb-1'>Dépenses</p>
                      <h4 className='text-danger mb-0'>
                        {formatPrice(sumTotalDepense)} F
                      </h4>
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={3} md={6}>
                  <Card className='border-0 shadow-sm h-100 rs-report-kpi'>
                    <CardBody>
                      <p className='text-muted small mb-1'>Solde (enc. − dép.)</p>
                      <h4
                        className={`mb-0 ${
                          solde >= 0 ? 'text-success' : 'text-warning'
                        }`}
                      >
                        {formatPrice(solde)} F
                      </h4>
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={3} md={6}>
                  <Card className='border-0 shadow-sm h-100 rs-report-kpi'>
                    <CardBody>
                      <p className='text-muted small mb-1'>Commissions</p>
                      <h4 className='text-info mb-0'>
                        {formatPrice(sumTotalComission)} F
                      </h4>
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={3} md={6}>
                  <Card className='border-0 shadow-sm h-100 rs-report-kpi'>
                    <CardBody>
                      <p className='text-muted small mb-1'>
                        Volume contrats & réserv. (montants)
                      </p>
                      <h4 className='mb-0'>
                        {formatPrice(sumTotalContratAmount + sumTotalRentalAmount)}{' '}
                        F
                      </h4>
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={3} md={6}>
                  <Card className='border-0 shadow-sm h-100 rs-report-kpi'>
                    <CardBody>
                      <p className='text-muted small mb-1'>Contrats actifs</p>
                      <h4 className='mb-0'>{contratsActifs}</h4>
                      <span className='small text-muted'>
                        sur {filterContrat?.length ?? 0} (période)
                      </span>
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={3} md={6}>
                  <Card className='border-0 shadow-sm h-100 rs-report-kpi'>
                    <CardBody>
                      <p className='text-muted small mb-1'>Clients</p>
                      <h4 className='mb-0'>{clients?.length ?? 0}</h4>
                      <span className='small text-muted'>base complète</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={3} md={6}>
                  <Card className='border-0 shadow-sm h-100 rs-report-kpi'>
                    <CardBody>
                      <p className='text-muted small mb-1'>Appartements libres</p>
                      <h4 className='mb-0'>
                        {appartLibres} / {appartements?.length ?? 0}
                      </h4>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <Row className='g-4 mb-4'>
                <Col lg={8}>
                  <Card className='border-0 shadow-sm'>
                    <CardBody>
                      <h5 className='mb-3'>Encaissements par mois (période filtrée)</h5>
                      {monthlyEncaissements.length === 0 ? (
                        <p className='text-muted mb-0'>Aucune donnée.</p>
                      ) : (
                        <div className='rs-report-chart-wrap'>
                          <ResponsiveContainer width='100%' height={320}>
                            <LineChart data={monthlyEncaissements}>
                              <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                              <XAxis dataKey='mois' tick={{ fontSize: 12 }} />
                              <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(v) => formatPrice(v)}
                              />
                              <Tooltip
                                formatter={(v) => [`${formatPrice(v)} F`, 'Montant']}
                              />
                              <Legend />
                              <Line
                                type='monotone'
                                dataKey='montant'
                                name='Encaissements'
                                stroke='#0d9488'
                                strokeWidth={2}
                                dot={{ r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={4}>
                  <Card className='border-0 shadow-sm h-100'>
                    <CardBody>
                      <h5 className='mb-3'>Flux financiers</h5>
                      {pieFlux.every((x) => x.value === 0) ? (
                        <p className='text-muted'>Aucune donnée.</p>
                      ) : (
                        <div className='rs-report-chart-wrap'>
                          <ResponsiveContainer width='100%' height={320}>
                            <PieChart>
                              <Pie
                                data={pieFlux}
                                dataKey='value'
                                nameKey='name'
                                cx='50%'
                                cy='50%'
                                outerRadius={100}
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                              >
                                {pieFlux.map((_, i) => (
                                  <Cell
                                    key={i}
                                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(v) => `${formatPrice(v)} F`}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <Card className='border-0 shadow-sm'>
                    <CardBody>
                      <h5 className='mb-3'>
                        Encaissements par secteur (top 10)
                      </h5>
                      {encaissementsParSecteur.length === 0 ? (
                        <p className='text-muted mb-0'>Aucun encaissement.</p>
                      ) : (
                        <div className='rs-report-chart-wrap rs-report-chart-wrap--tall'>
                          <ResponsiveContainer width='100%' height={380}>
                            <BarChart
                              data={encaissementsParSecteur}
                              layout='vertical'
                              margin={{ left: 16, right: 16 }}
                            >
                              <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                              <XAxis
                                type='number'
                                tickFormatter={(v) => formatPrice(v)}
                              />
                              <YAxis
                                type='category'
                                dataKey='name'
                                width={140}
                                tick={{ fontSize: 11 }}
                              />
                              <Tooltip
                                formatter={(v) => `${formatPrice(v)} F`}
                              />
                              <Bar dataKey='montant' fill='#0d9488' radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
}
