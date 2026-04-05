import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import FormModal from '../components/FormModal';
import LoadingSpiner from '../components/LoadingSpiner';
import { formatPrice } from '../components/capitalizeFunction';
import DureeSejourDisplay from '../components/DureeSejourDisplay';
import {
  deleteButton,
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import {
  useAllContrat,
  useDeleteContrat,
  useStopeContrat,
} from '../../Api/queriesContrat';
import ContratForm from '../Contrat/ContratForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useOneClient } from '../../Api/queriesClient';
import {
  BackButton,
  DashboardButton,
  HomeButton,
} from '../components/NavigationButton';
import ReservationListe from '../Reservation/ReservationListe';
import ActiveSecteur from '../Secteurs/ActiveSecteur';
import Swal from 'sweetalert2';
import { connectedUserRole } from '../Authentication/userInfos';
import ClientComissionListe from '../Comission/ClientComissionListe';
export default function ClientContratListe() {
  const client = useParams();
  const { data: contratData, isLoading, error } = useAllContrat();
  const { mutate: deleteContrat } = useDeleteContrat();
  const { mutate: stopeContrat } = useStopeContrat();
  const { data: clientInfo } = useOneClient(client.id);
  const [form_modal, setForm_modal] = useState(false);
  const [contratToUpdate, setContratToUpdate] = useState(null);
  const [contratToReload, setContratToReload] = useState(null);
  const [formModalTitle, setFormModalTitle] = useState('Nouveau Contrat');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  // State de Rechercher
  const [searchTerm, setSearchTerm] = useState('');

  // Fonction pour filtrer les clients en fonction du terme de recherche
  const filteredContrat = contratData?.filter((contrat) => {
    return contrat?.client?._id === clientInfo?._id;
  });

  function tog_form_modal() {
    setForm_modal(!form_modal);
  }

  const today = new Date().toISOString().substring(0, 10);

  const handleStopeContrat = async (contrat) => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ms-2',
        cancelButton: 'btn btn-danger me-2',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: `Êtes-vous sûr de vouloir mettre fin au Contrat de ?:`,
        text: contrat?.client?.firstName + ' ' + contrat.client.lastName,
        icon: 'question',
        iconColor: 'red',
        showCancelButton: true,
        confirmButtonText: 'Oui',
        cancelButtonText: 'Non',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          setIsSubmitting(true);

          try {
            stopeContrat(contrat, {
              onSuccess: () => {
                successMessageAlert('Contrat Arrêté avec succès');
                setIsSubmitting(false);
              },
              onError: (err) => {
                const errorMessage =
                  err?.response?.data?.message ||
                  err?.message ||
                  "Oh Oh ! une erreur est survenu lors de l'enregistrement";
                errorMessageAlert(errorMessage);
                setIsSubmitting(false);
              },
            });
          } catch (e) {
            const errorMessage =
              e?.response?.data?.message ||
              e?.message ||
              "Oh Oh ! une erreur est survenu lors de l'enregistrement";
            errorMessageAlert(errorMessage);
            setIsSubmitting(false);
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire({
            title: 'Exécution Annulée',
            icon: 'error',
          });
          setIsSubmitting(false);
        }
      });
    setIsSubmitting(false);
  };

  return (
    <React.Fragment>
      <ActiveSecteur />
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Client' breadcrumbItem='List des Contrat' />
          <div className='d-flex flex-wrap justify-content-center align-items-center gap-4'>
            <BackButton />
            <DashboardButton />
            <HomeButton />
          </div>{' '}
          {/* -------------------------- */}
          <FormModal
            form_modal={form_modal}
            setForm_modal={setForm_modal}
            tog_form_modal={tog_form_modal}
            modal_title={formModalTitle}
            size='md'
            bodyContent={
              <ContratForm
                contratToEdit={contratToUpdate}
                clientId={clientInfo?._id}
                contratToReload={contratToReload}
                tog_form_modal={tog_form_modal}
              />
            }
          />
          {/* -------------------- */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='clientsList'>
                    <Row className='g-4 mb-3 '>
                      {connectedUserRole === 'admin' && (
                        <Col md={6} className='col-sm-auto'>
                          <div className='d-flex gap-1'>
                            <Button
                              color='info'
                              className='add-btn'
                              id='create-btn'
                              onClick={() => {
                                setContratToUpdate(null);
                                setContratToReload(null);
                                tog_form_modal();
                              }}
                            >
                              <i className='fas fa-plus align-center me-1'></i>{' '}
                              Nouveau Contrat
                            </Button>
                          </div>
                        </Col>
                      )}

                      <Col md={6} className='col-sm'>
                        <div className='d-flex justify-content-sm-end gap-2'>
                          {searchTerm !== '' && (
                            <Button
                              color='danger'
                              onClick={() => setSearchTerm('')}
                            >
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
                      style={{ minHeight: 350 }}
                    >
                      {!filteredContrat?.length && !isLoading && !error && (
                        <div className='text-center text-mutate'>
                          Aucun Contrat pour ce Clients !
                        </div>
                      )}
                      {!error && filteredContrat?.length > 0 && !isLoading && (
                        <table
                          className='table rs-data-table align-middle table-nowrap table-hover '
                          id='fournisseurTable'
                        >
                          <thead className='table-light'>
                            <tr className='text-center'>
                              <th>Statut</th>
                              <th>N° d'Appartement</th>
                              <th>Secteur</th>
                              <th>Date D'Entrée</th>
                              <th>Date de Sortie</th>
                              <th>Durée</th>
                              <th>Montant</th>
                              <th>Remise</th>
                              <th>Après Remise</th>
                              <th>Comission</th>

                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody className='list  text-center'>
                            {filteredContrat?.map((contrat) => (
                              <tr key={contrat?._id} className='text-center'>
                                <td
                                  className={` text-light ${
                                    contrat?.statut ? 'bg-success' : 'bg-danger'
                                  }`}
                                >
                                  {contrat?.statut ? 'En cours' : 'Terminé'}
                                </td>
                                <td className='rs-td-tag'>
                                  <span className='badge bg-info rounded rounded-pill text-light'>
                                    {formatPrice(
                                      contrat?.appartement?.appartementNumber
                                    )}
                                  </span>
                                </td>
                                <td>
                                  {contrat?.appartement?.secteur?.adresse}
                                </td>
                                <td>
                                  {new Date(
                                    contrat.startDate
                                  ).toLocaleDateString('fr-Fr', {
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: 'numeric',
                                    year: 'numeric',
                                  })}{' '}
                                </td>
                                <td
                                  className={`${
                                    new Date(contrat.endDate)
                                      .toISOString()
                                      .substring(0, 10) > today
                                      ? 'text-success'
                                      : new Date(contrat.endDate)
                                          .toISOString()
                                          .substring(0, 10) < today
                                      ? 'text-danger'
                                      : new Date(contrat.endDate)
                                          .toISOString()
                                          .substring(0, 10) === today
                                      ? 'text-warning'
                                      : ''
                                  }`}
                                >
                                  {new Date(contrat.endDate).toLocaleDateString(
                                    'fr-Fr',
                                    {
                                      weekday: 'short',
                                      day: '2-digit',
                                      month: 'numeric',
                                      year: 'numeric',
                                    }
                                  )}{' '}
                                </td>
                                <td className='align-middle'>
                                  <DureeSejourDisplay
                                    mois={contrat.mois}
                                    semaine={contrat.semaine}
                                    jour={contrat.jour}
                                    heure={contrat.heure}
                                  />
                                </td>
                                <td>{formatPrice(contrat.amount || 0)} F</td>
                                <td>{formatPrice(contrat.reduction || 0)} F</td>
                                <td>
                                  {formatPrice(contrat.totalAmount || 0)} F
                                </td>
                                <td>{formatPrice(contrat.comission || 0)} F</td>

                                {connectedUserRole === 'admin' && (
                                  <td className='text-center'>
                                    {isSubmitting && <LoadingSpiner />}
                                    {!isSubmitting && (
                                      <UncontrolledDropdown className='dropdown d-inline-block'>
                                        <DropdownToggle
                                          className='btn btn-info text-light btn-sm'
                                          tag='button'
                                        >
                                          <i className='fas fa-ellipsis-v fs-5 text-primary'></i>
                                        </DropdownToggle>
                                        <DropdownMenu className='dropdown-menu-end'>
                                          <DropdownItem
                                            className='edit-item-btn  text-info'
                                            onClick={() => {
                                              navigate(
                                                `/contrat/document/${contrat._id}`
                                              );
                                            }}
                                          >
                                            <i className='fas fa-book-open align-center me-2 '></i>
                                            Contrat
                                          </DropdownItem>
                                          <DropdownItem
                                            className='edit-item-btn  text-warning'
                                            onClick={() => {
                                              navigate(
                                                `/contrat/${contrat?._id}`
                                              );
                                            }}
                                          >
                                            <i className='fas fa-dollar-sign align-center me-2 '></i>
                                            Paiement
                                          </DropdownItem>
                                          <DropdownItem
                                            className='edit-item-btn  text-secondary'
                                            onClick={() => {
                                              setFormModalTitle(
                                                'Modifier les données'
                                              );
                                              setContratToUpdate(contrat);
                                              setContratToReload(null);
                                              tog_form_modal();
                                            }}
                                          >
                                            <i className='ri-pencil-fill align-bottom me-2 '></i>
                                            Modifier
                                          </DropdownItem>
                                          {!contrat?.statut && (
                                            <DropdownItem
                                              className='edit-item-btn  text-info'
                                              onClick={() => {
                                                setFormModalTitle(
                                                  'Renouveler le Contrat'
                                                );
                                                setContratToUpdate(null);
                                                setContratToReload(contrat);
                                                tog_form_modal();
                                              }}
                                            >
                                              <i className='fas fa-sync align-center me-2 '></i>
                                              Renouveller
                                            </DropdownItem>
                                          )}

                                          {contrat.statut && (
                                            <DropdownItem
                                              className='remove-item-btn text-danger '
                                              tag={'button'}
                                              onClick={() => {
                                                handleStopeContrat(contrat);
                                              }}
                                            >
                                              {' '}
                                              <i className='fas fa-ban align-center me-2 '></i>{' '}
                                              Stoper{' '}
                                            </DropdownItem>
                                          )}
                                          <DropdownItem
                                            className='remove-item-btn text-danger '
                                            onClick={() => {
                                              setIsSubmitting(true);
                                              deleteButton(
                                                contrat._id,
                                                contrat.client.firstName +
                                                  ' ' +
                                                  contrat.client.lastName,
                                                deleteContrat
                                              );
                                              setIsSubmitting(false);
                                            }}
                                          >
                                            {' '}
                                            <i className='ri-delete-bin-fill align-bottom me-2 '></i>{' '}
                                            Supprimer{' '}
                                          </DropdownItem>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    )}
                                  </td>
                                )}
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
        </Container>

        {/* Reservation */}
        <ReservationListe />

        {/* Comission Liste */}
        <ClientComissionListe />
      </div>
    </React.Fragment>
  );
}
