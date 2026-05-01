import { Card } from 'reactstrap';
import LoadingSpiner from '../components/LoadingSpiner';

import { useNavigate } from 'react-router-dom';
import { useSecteurCount } from '../../Api/queriesSecteurs';
import { useAppartementCount } from '../../Api/queriesAppartement';
import { useClientCount } from '../../Api/queriesClient';
import { useContratCount } from '../../Api/queriesContrat';

const TotalSecteur = () => {
  const {
    data: secteursCount,
    isLoading: loadingSecteur,
    error: errorSecteur,
  } = useSecteurCount();

  const navigate = useNavigate();

  const handleNavigate = () => {
    return navigate('/home');
  };

  return (
    <div onClick={() => handleNavigate()} style={{ cursor: 'pointer' }}>
      {loadingSecteur && <LoadingSpiner />}
      {!errorSecteur && !loadingSecteur && (
        <Card className='rs-stat-card d-flex gap-3 flex-column justify-content-center align-items-center'>
          <i className='fas fa-bezier-curve text-info rs-stat-icon'></i>

          {/* OPTIMISATION (dashboard): on affiche un count, sans charger toute la liste */}
          <h3 className='text-info'>{secteursCount?.total ?? 0}</h3>
          <h5>Secteurs</h5>
        </Card>
      )}
    </div>
  );
};

const TotalAppartement = () => {
  // OPTIMISATION (dashboard): count only (évite getAllAppartements)
  const { data: appartementCount, isLoading: loading, error } = useAppartementCount();
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/appartements')}
      style={{ cursor: 'pointer' }}
    >
      {loading && <LoadingSpiner />}
      {!error && !loading && (
        <Card className='rs-stat-card d-flex gap-3 flex-column justify-content-center align-items-center'>
          <i className='fas fa-home text-info rs-stat-icon'></i>

          <h3 className='text-info'>{appartementCount?.total ?? 0}</h3>
          <h5>Appartements</h5>
        </Card>
      )}
    </div>
  );
};

const TotalClient = () => {
  // OPTIMISATION (dashboard): count only (évite getAllClients)
  const { data: clientsCount, isLoading: loading, error } = useClientCount();
  const navigate = useNavigate();

  return (
    <div style={{ cursor: 'pointer' }} onClick={() => navigate('/clients')}>
      {loading && <LoadingSpiner />}
      {!error && !loading && (
        <Card className='rs-stat-card d-flex gap-3 flex-column justify-content-center align-items-center'>
          <i className='fas fa-users text-info rs-stat-icon'></i>

          <h3 className='text-info'>{clientsCount?.total ?? 0}</h3>
          <h5>Clients</h5>
        </Card>
      )}
    </div>
  );
};

const TotalContrat = () => {
  // OPTIMISATION (dashboard): count only (évite getAllContrats)
  const { data: contratCount, isLoading: loading, error } = useContratCount();
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate('/contrats')} style={{ cursor: 'pointer' }}>
      {loading && <LoadingSpiner />}
      {!error && !loading && (
        <Card className='rs-stat-card d-flex gap-3 flex-column justify-content-center align-items-center'>
          <i className='fas fa-receipt text-info rs-stat-icon'></i>

          <h3 className='text-info'>{contratCount?.total ?? 0}</h3>
          <h5>Contrats</h5>
        </Card>
      )}
    </div>
  );
};

export { TotalSecteur, TotalAppartement, TotalClient, TotalContrat };
