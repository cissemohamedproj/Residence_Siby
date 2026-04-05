import React, { useContext, useState } from 'react';

import {
  Row,
  Col,
  CardBody,
  Card,
  Container,
  Form,
  Input,
  FormFeedback,
  Label,
} from 'reactstrap';

import { Link, useNavigate } from 'react-router-dom';

// Formik validation
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useLogin } from '../../Api/queriesAuth';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  companyLogo,
  companyName,
  companyOwnerName,
  companyServices2,
} from '../CompanyInfo/CompanyInfo';
import { AuthContext } from '../../Auth/AuthContext';

const Login = () => {
  document.title = `Connexion | ${companyName} `;

  // Query de Login
  const { mutate: loginUser } = useLogin();
  // State de chargement des données
  const [isLoading, setIsLoading] = useState(false);

  // State de Navigation
  const navigate = useNavigate();
  const { login: setAuthUser } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);

  // handle show password toggle
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Veuillez entrer votre Email'),
      password: Yup.string().required('Veuillez entrer votre mot de passe'),
    }),
    onSubmit: (values, { resetForm }) => {
      // Désactiver le bouton de soumission pour éviter les doubles clics
      setIsLoading(true);
      // Appel de la mutation pour se connecter
      loginUser(values, {
        onSuccess: () => {
          setIsLoading(false);

          resetForm();
          // Afficher un message de succès ou une alerte
          successMessageAlert('Conneté avec succès !');
          // Redirection vers le tableau de bord
          // navigate('/initial_page');

          setTimeout(() => {
            try {
              const raw = localStorage.getItem('authUser');
              const dataParse = raw ? JSON.parse(raw) : null;
              const role = dataParse?.user?.role;

              if (!role) {
                return errorMessageAlert('Rôle utilisateur introuvable.');
              }

              // Synchroniser le contexte (sinon PrivateRoute voit encore auth=null)
              setAuthUser(dataParse);
              navigate('/initial_page', { replace: true });
            } catch (err) {
              errorMessageAlert('Erreur de redirection.');
            }
          }, 2000);
        },
        onError: (error) => {
          setIsLoading(false);
          const errorMessage =
            error?.response?.data?.message ||
            'Une erreur est survenue lors de la connexion.' ||
            error;
          errorMessageAlert(errorMessage);
        },
      });
    },
  });

  return (
    <React.Fragment>
      <div className='bg-login rs-auth-page'>
        <div className='bg-overlay' />
        <div className='account-pages pt-5'>
          <Container>
            <Row className='justify-content-center'>
              <Col lg={6} md={8} xl={5}>
                <Card className='rs-auth-card'>
                  <CardBody className='px-4'>
                    <div>
                      <div className='text-center'>
                        <img
                          src={companyLogo}
                          alt=''
                          height='120px'
                          width='100px'
                          style={{ objectFit: 'cover' }}
                          className='auth-logo logo-dark mx-auto'
                        />
                        <h2 className='mt-2 text-center rs-auth-brand-title'>
                          {companyName}
                        </h2>
                        <h6 className='rs-auth-tagline'>{companyServices2}</h6>
                        <p className='my-3 text-center text-muted small'>
                          Entrez vos coordonnées pour vous connecter à votre
                          compte.
                        </p>
                      </div>
                      <Form
                        className='form-horizontal'
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                        }}
                      >
                        <Row>
                          <Col md={12}>
                            <div className='mb-4'>
                              <Label className='form-label '>Email</Label>
                              <Input
                                name='email'
                                className='form-control border-1 border-dark'
                                placeholder='Enter email'
                                type='email'
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.email || ''}
                                invalid={
                                  validation.touched.email &&
                                  validation.errors.email
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.email &&
                              validation.errors.email ? (
                                <FormFeedback type='invalid'>
                                  <div>{validation.errors.email}</div>
                                </FormFeedback>
                              ) : null}
                            </div>
                            <div className='mb-3'>
                              <Label className='form-label'>Mot de passe</Label>
                              <div className='d-flex gap-2 justify-content-center flex-nowrap  pb-3'>
                                <div className=' w-100'>
                                  <Input
                                    name='password'
                                    value={validation.values.password || ''}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Enter Password'
                                    className='form-control border-1 border-dark'
                                    onChange={validation.handleChange}
                                    onBlur={validation.handleBlur}
                                    invalid={
                                      validation.touched.password &&
                                      validation.errors.password
                                        ? true
                                        : false
                                    }
                                  />
                                  {validation.touched.password &&
                                  validation.errors.password ? (
                                    <FormFeedback type='invalid'>
                                      <div> {validation.errors.password} </div>
                                    </FormFeedback>
                                  ) : null}
                                </div>

                                {/* Password visible */}
                                <div className='show-details '>
                                  <button
                                    className='btn btn-sm btn-secondary show-item-btn'
                                    type='button'
                                    onClick={handleShowPassword}
                                  >
                                    {showPassword ? (
                                      <i className='ri-eye-off-fill'></i>
                                    ) : (
                                      <i className='ri-eye-fill'></i>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className='text-md-center my-1 '>
                              <Link
                                to='/forgotPassword'
                                className='text-warning'
                              >
                                <i className='mdi mdi-lock'></i> Mot de passe
                                oubliée !
                              </Link>
                            </div>

                            <div className='d-grid mt-4'>
                              {isLoading ? (
                                <LoadingSpiner />
                              ) : (
                                <button
                                  className='btn btn-success waves-effect waves-light'
                                  type='submit'
                                >
                                  Se Connecter
                                </button>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  </CardBody>
                </Card>
                <div className='mt-5 text-center'>
                  <p className='rs-auth-credit rs-auth-credit--dark mb-0'>
                    © {new Date().getFullYear()} {companyName}{' '}
                    {companyOwnerName} |{' '}
                    <i className='mdi mdi-heart text-danger'></i> Créé par{' '}
                    <a
                      href='https://www.mohamedcisse.com'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='rs-auth-credit__link'
                    >
                      Cisse Mohamed
                    </a>
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Login;
