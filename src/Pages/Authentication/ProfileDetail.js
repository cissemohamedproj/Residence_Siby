import React from 'react';
import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  Row,
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { companyName } from '../CompanyInfo/CompanyInfo';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpiner from '../components/LoadingSpiner';
import { BackButton } from '../components/NavigationButton';
import { useGetOneUser } from '../../Api/queriesAuth';
import { formatPrice } from '../components/capitalizeFunction';
import { useAllContrat } from '../../Api/queriesContrat';
import { useAllClient } from '../../Api/queriesClient';
import { useAllAppartement } from '../../Api/queriesAppartement';
import { useAllSecteur } from '../../Api/queriesSecteurs';
import { useAllPaiements } from '../../Api/queriesPaiement';

export default function ProfileDetail() {
  document.title = `Details du Profile | ${companyName} `;
  const selectedUser = useParams();
  const navigate = useNavigate();

  const { data: selectedUserInfos } = useGetOneUser(selectedUser.id);

  const {
    data: contratData,
    isLoading: loadingContrat,
    error: contratError,
  } = useAllContrat();

  const {
    data: clients,
    isLoading: loadingClients,
    isError: clientError,
  } = useAllClient();

  const {
    data: appartementData,
    isLoading: loadingAppartement,
    isError: appartementError,
  } = useAllAppartement();

  const {
    data: secteurData,
    isLoading: loadingSecteur,
    isError: secteurError,
  } = useAllSecteur();

  const {
    data: paiementsData,
    isLoading: loadingPaiement,
    isError: paiementError,
  } = useAllPaiements();

  function getUserContrat() {
    const userContrat = contratData?.filter(
      (item) => item.user._id === selectedUser.id
    );

    const contratNotFinish = userContrat?.filter((item) => item.statut);

    const contratFinish = userContrat?.filter((item) => !item.statut);

    return {
      contratNotFinish,
      contratFinish,
    };
  }
  const selectedUserData = getUserContrat();

  const selectedUserSecteur = secteurData?.filter(
    (item) => item.user._id === selectedUser.id
  );

  const selectedUserAppartement = appartementData?.filter(
    (item) => item.user._id === selectedUser.id
  );
  const selectedUserClients = clients?.filter(
    (item) => item.user._id === selectedUser.id
  );

  const selectedUserPaiements = paiementsData?.filter(
    (item) => item.user._id === selectedUser.id
  );

  const totalAmount = selectedUserPaiements?.reduce(
    (total, paiement) => total + paiement?.contrat?.totalAmount,
    0
  );

  const totalPaye = selectedUserPaiements?.reduce(
    (total, paiement) => total + paiement.totalPaye,
    0
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid={true}>
          <Breadcrumbs title='Profile' breadcrumbItem='Details du Profile' />
          <BackButton />

          <Card className='text-center py-3'>
            <CardTitle className='mb-4'>Détails du Profile</CardTitle>

            <CardText>
              Nom d'Utilisateur :{' '}
              <strong className='text-info font-size-19 text-uppercase'>
                {selectedUserInfos?.name}
              </strong>
            </CardText>
          </Card>
          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Row>
              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/home')}
                style={{ cursor: 'pointer' }}
              >
                {loadingSecteur && <LoadingSpiner />}
                {!secteurError && !loadingSecteur && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #03045e',
                    }}
                  >
                    <CardBody
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <i
                        className='fas fa-bezier-curve text-light mb-3'
                        style={{ fontSize: '40px' }}
                      ></i>
                      <CardTitle className='text-center'>
                        <span className='badge bg-light font-size-18'>
                          {selectedUserSecteur?.length}
                        </span>
                        <p className='text-light'>Secteurs Créé</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>

              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/appartements')}
                style={{ cursor: 'pointer' }}
              >
                {loadingAppartement && <LoadingSpiner />}
                {!appartementError && !loadingAppartement && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #390099',
                    }}
                  >
                    <CardBody
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <i
                        className='fas fa-home text-light mb-3'
                        style={{ fontSize: '40px' }}
                      ></i>
                      <CardTitle className='text-center'>
                        <span className=' badge bg-warning fs-5'>
                          {selectedUserAppartement?.length}
                        </span>
                        <p className='text-light'>Appartements </p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>

              {/* Clients */}

              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/clients')}
                style={{ cursor: 'pointer' }}
              >
                {loadingClients && <LoadingSpiner />}
                {!clientError && !loadingClients && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #4361ee',
                    }}
                  >
                    <CardBody
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <i
                        className='fas fa-users text-light mb-3'
                        style={{ fontSize: '40px' }}
                      ></i>
                      <CardTitle className='text-center'>
                        <span className='badge bg-light fs-5'>
                          {selectedUserClients?.length}
                        </span>
                        <p className='text-light'>Clients Enregistrés</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>

              {/* Contrats */}
              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/contrats')}
                style={{ cursor: 'pointer' }}
              >
                {loadingContrat && <LoadingSpiner />}
                {!contratError && !loadingContrat && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #03045e',
                    }}
                  >
                    <CardBody className='d-flex flex-column justify-content-center align-items-center gap-3'>
                      <i
                        className='fas fa-receipt text-success mx-auto mb-3'
                        style={{ fontSize: '40px' }}
                      ></i>
                      <CardTitle className='text-center'>
                        <span className='badge bg-success fs-5'>
                          {selectedUserData?.contratNotFinish?.length}
                        </span>
                        <p className='text-light'>Contrats en cours</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>
              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/contrats')}
                style={{ cursor: 'pointer' }}
              >
                {loadingContrat && <LoadingSpiner />}
                {!contratError && !loadingContrat && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #264653',
                    }}
                  >
                    <CardBody className='d-flex flex-column justify-content-center align-items-center gap-3'>
                      <i
                        className='fas fa-check text-primary mx-auto mb-3'
                        style={{ fontSize: '35px' }}
                      ></i>
                      <CardTitle className='text-center'>
                        <span className='badge bg-danger fs-5'>
                          {selectedUserData?.contratFinish?.length}
                        </span>
                        <p className='text-light'>Contrats Terminés</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>

              {/* Paiements */}
              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/paiements')}
                style={{ cursor: 'pointer' }}
              >
                {loadingPaiement && <LoadingSpiner />}
                {!paiementError && !loadingPaiement && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #0077b6',
                    }}
                  >
                    <CardBody className='d-flex flex-column justify-content-center align-items-center gap-3'>
                      <i
                        className='fas fa-dollar-sign text-success mx-auto'
                        style={{ fontSize: '35px' }}
                      ></i>
                      <CardTitle className='text-center '>
                        <span className='badge bg-success font-size-18'>
                          {formatPrice(totalPaye)} F
                        </span>
                        <p className='text-light'>Encaissé</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>
              <Col
                lg='4'
                md='6'
                onClick={() => navigate('/paiements')}
                style={{ cursor: 'pointer' }}
              >
                {loadingPaiement && <LoadingSpiner />}
                {!paiementError && !loadingPaiement && (
                  <Card
                    style={{
                      height: '180px',
                      boxShadow: '1px 0px 10px rgba(1, 186, 186, 0.57)',
                      background: ' #3c096c',
                    }}
                  >
                    <CardBody className='d-flex flex-column justify-content-center align-items-center gap-3'>
                      <i
                        className='fas fa-euro-sign text-danger mx-auto mb-3'
                        style={{ fontSize: '40px' }}
                      ></i>
                      <CardTitle className='text-center '>
                        <span className='badge bg-danger font-size-18'>
                          {formatPrice(totalAmount - totalPaye)} F
                        </span>
                        <p className='text-light'>Non Encaissé</p>
                      </CardTitle>
                    </CardBody>
                  </Card>
                )}
              </Col>
            </Row>
          </motion.div>
        </Container>
      </div>
    </React.Fragment>
  );
}
