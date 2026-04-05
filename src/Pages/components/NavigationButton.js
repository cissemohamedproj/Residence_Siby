import { useNavigate } from 'react-router-dom';
import { Button } from 'reactstrap';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      color='warning'
      className='rs-nav-btn'
      outline
      onClick={() => navigate(-1)}
    >
      <i className='bx bx-arrow-back me-1' />
      Retour
    </Button>
  );
};

const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      color='info'
      className='rs-nav-btn text-white'
      onClick={() => {
        navigate('/home');
        localStorage.removeItem('selectedSecteur');
      }}
    >
      <i className='bx bx-home me-1' />
      Accueil
    </Button>
  );
};

const DashboardButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      color='dark'
      className='rs-nav-btn text-white'
      onClick={() => navigate('/dashboard')}
    >
      <i className='fas fa-server me-1' />
      Tableau de Bord
    </Button>
  );
};

export { BackButton, HomeButton, DashboardButton };
