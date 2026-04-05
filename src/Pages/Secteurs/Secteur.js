import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from 'reactstrap';
import FormModal from '../components/FormModal';
import SecteurForm from './SecteurForm';
import { useContext, useState } from 'react';
import { AuthContext } from '../../Auth/AuthContext';
import { useAllSecteur, useDeleteSecteur } from '../../Api/queriesSecteurs';
import LoadingSpiner from '../components/LoadingSpiner';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';
import { deleteButton } from '../components/AlerteModal';
import { useNavigate } from 'react-router-dom';
import { useAllAppartement } from '../../Api/queriesAppartement';
import { connectedUserRole } from '../Authentication/userInfos';

export default function Secteur() {
  const { logout } = useContext(AuthContext);
  const [form_modal, setForm_modal] = useState(false);
  const [secteurToUpdate, setSecteurToUpdate] = useState(null);
  const [formModalTitle, setFormModalTitle] = useState('Nouveau Secteur');
  const navigate = useNavigate();
  const {
    data: secteurData,
    isLoading: loadingData,
    error: dataError,
  } = useAllSecteur();
  const { mutate: deleteSecteur } = useDeleteSecteur();

  const { data: appartementData } = useAllAppartement();

  const appartements = (secteur, disponibility) => {
    return appartementData?.filter((item) => {
      return item?.secteur?._id === secteur?._id;
    })?.length;
  };

  const availableAppartements = (secteur, disponibility) => {
    return appartementData?.filter((item) => {
      return (
        item?.secteur?._id === secteur?._id &&
        item?.isAvailable === disponibility
      );
    })?.length;
  };

  function tog_form_modal() {
    setForm_modal(!form_modal);
  }
  return (
    <>
      <div className='page-content bg-primary'>
        <Container fluid={true}>
          <FormModal
            form_modal={form_modal}
            setForm_modal={setForm_modal}
            tog_form_modal={tog_form_modal}
            modal_title={formModalTitle}
            size='md'
            bodyContent={
              <SecteurForm
                secteurToEdit={secteurToUpdate}
                tog_form_modal={tog_form_modal}
              />
            }
          />
          <header className='rs-secteur-hero'>
            <h1>Secteurs disponibles</h1>
            <p>
              Choisissez un secteur pour consulter les appartements, contrats et
              paiements associés.
            </p>
          </header>
          <div className='rs-secteur-actions'>
            <Button
              color='info'
              onClick={() => {
                setSecteurToUpdate(null);
                tog_form_modal();
              }}
            >
              <i className='ri-add-line me-1' />
              Ajouter un secteur
            </Button>

            <Button outline color='danger' onClick={() => logout()}>
              <i className='ri-logout-box-r-line me-1' />
              Déconnexion
            </Button>
          </div>

          {dataError && (
            <div className='text-danger text-center my-4'>
              <h6 className='text-danger'>
                Oh..Oh....une erreur c'est produit veuillez actualisez la page
              </h6>
            </div>
          )}
          {secteurData?.length === 0 && (
            <h5 className='text-center my-4 text-white-50'>
              Aucun secteur disponible
            </h5>
          )}

          {loadingData && <LoadingSpiner />}
          {!dataError && !loadingData && (
            <Row className='row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mt-1 justify-content-center'>
              {secteurData?.length > 0 &&
                secteurData?.map((item) => (
                  <Col key={item?._id} className='d-flex justify-content-center'>
                    <Card className='rs-secteur-card w-100'>
                      <div className='position-absolute' style={{ right: 10, top: 8 }}>
                        {connectedUserRole === 'admin' && (
                          <UncontrolledDropdown className='dropdown d-inline-block'>
                            <DropdownToggle
                              className='btn btn-soft-secondary btn-sm'
                              tag='button'
                            >
                              <i className='fas fa-ellipsis-v fs-5 text-primary'></i>
                            </DropdownToggle>
                            <DropdownMenu className='dropdown-menu-end'>
                              <DropdownItem
                                className='edit-item-btn  text-secondary'
                                onClick={() => {
                                  setFormModalTitle('Modifier les données');
                                  setSecteurToUpdate(item);
                                  tog_form_modal();
                                }}
                              >
                                <i className='ri-pencil-fill align-bottom me-2 '></i>
                                Modifier
                              </DropdownItem>

                              <DropdownItem
                                className='remove-item-btn text-danger '
                                onClick={() => {
                                  deleteButton(
                                    item?._id,
                                    item?.adresse,
                                    deleteSecteur
                                  );
                                }}
                              >
                                {' '}
                                <i className='ri-delete-bin-fill align-bottom me-2 '></i>{' '}
                                Supprimer{' '}
                              </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        )}
                      </div>
                      <h5 className='text-light mb-3'>
                        Secteur N° {item?.secteurNumber}
                      </h5>

                      <CardBody className='d-flex flex-column justify-content-center align-items-center text-light pt-0'>
                        <h5 className='text-light'>
                          {capitalizeWords(item?.adresse)}
                        </h5>
                        <span
                          className={`font-size-16 mb-2 ${
                            appartements(item) > 0
                              ? 'text-success'
                              : 'text-danger'
                          }`}
                        >
                          {formatPrice(appartements(item))} Appartements
                        </span>
                        <span
                          className={`font-size-13 badge ${
                            availableAppartements(item, true) > 0
                              ? 'bg-success'
                              : 'bg-danger'
                          }`}
                        >
                          {formatPrice(availableAppartements(item, true))} Libre
                        </span>
                      </CardBody>
                      <CardFooter className='d-flex justify-content-end align-items-center'>
                        <Button
                          className='px-3'
                          color='info'
                          onClick={() => {
                            localStorage.setItem(
                              'selectedSecteur',
                              JSON.stringify(item)
                            );
                            navigate(`/secteur/${item?._id}`);
                          }}
                        >
                          Ouvrir
                          <i className='fas fa-angle-double-right ms-2'></i>
                        </Button>
                      </CardFooter>
                    </Card>
                  </Col>
                ))}
            </Row>
          )}
        </Container>
      </div>
    </>
  );
}
