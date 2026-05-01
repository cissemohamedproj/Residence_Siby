import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardText,
  Modal,
} from 'reactstrap';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import html2pdf from 'html2pdf.js';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useAllPaiements } from '../../Api/queriesPaiement';
import { companyName } from '../CompanyInfo/CompanyInfo';
import RecuHeader from '../Paiements/ReçueHeader';

const ReçuReservation = ({ show_modal, tog_show_modal, selectedRental }) => {
  const { data: paiements, error, isLoading } = useAllPaiements();

  const filterPaiement = paiements?.find((item) => {
    return item.rental?._id === selectedRental?._id;
  });

  const contentRef = useRef();
  const reactToPrintFn = useReactToPrint({ contentRef });

  // ------------------------------------------
  // ------------------------------------------
  // Export En PDF
  // ------------------------------------------
  // ------------------------------------------
  const exportPaiementToPDF = () => {
    const element = document.getElementById('reçu_de_paiement_reservation');
    const opt = {
      filename: 'reçu_de_paiement_reservation.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .catch((err) => console.error('Error generating PDF:', err));
  };

  const client = selectedRental?.client;
  const appartement = selectedRental?.appartement;

  const start = new Date(selectedRental?.rentalDate);
  const end = new Date(selectedRental?.rentalEndDate);

  // // Différence en millisecondes
  // const diffInMs = end - start;

  // // Conversion en jours
  // const countDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return (
    <Modal
      isOpen={show_modal}
      toggle={() => {
        tog_show_modal();
      }}
      size={'lg'}
      scrollable={true}
      centered={true}
    >
      {/* ---- Modal Header */}
      <div className='modal-header'>
        <div className='d-flex gap-1 justify-content-around align-items-center w-100'>
          <Button
            color='info'
            className='add-btn'
            id='create-btn'
            onClick={reactToPrintFn}
          >
            <i className='fas fa-print align-center me-1'></i> Imprimer
          </Button>

          <Button color='danger' onClick={exportPaiementToPDF}>
            <i className='fas fa-paper-plane  me-1 '></i>
            Télécharger en PDF
          </Button>
        </div>

        <button
          type='button'
          onClick={() => tog_show_modal()}
          className='close'
          data-dismiss='modal'
          aria-label='Close'
        >
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>

      {/* Modal Body */}
      <div className='modal-body rs-recu-modal-body' ref={contentRef}>
        {!error && !isLoading && (
          <div
            className='mx-5 py-3 d-flex justify-content-center rs-recu-root'
            id='reçu_de_paiement_reservation'
          >
            <Card className='rs-recu-card'>
              <RecuHeader />
              <CardBody className='mt-2'>
                <div className='d-flex justify-content-center align-items-center flex-column'>
                  <h5 className='mb-4'>Reçue de Reservation</h5>
                  <p>
                    {capitalizeWords(
                      client?.firstName + ' ' + client?.lastName
                    )}
                  </p>
                  <p>{formatPhoneNumber(client?.phoneNumber)}</p>
                  <p>
                    <strong>Appartement:</strong>
                    <span>
                      ( N° {formatPhoneNumber(appartement?.appartementNumber)} )
                    </span>
                    <span> {capitalizeWords(appartement?.name)} </span>
                    <strong>{' | Adresse: '}</strong>
                    <span>
                      {capitalizeWords(appartement?.secteur?.adresse)}{' '}
                    </span>
                  </p>
                </div>

                <div className='d-flex justify-content-around align-items-center px-2 rs-recu-two-col'>
                  <div>
                    <CardText>
                      <strong> Date de Reservation:</strong>{' '}
                      {start?.toLocaleDateString('fr-Fr', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'numeric',
                        year: 'numeric',
                      })}
                    </CardText>
                    <CardText>
                      <strong> Date de Fin:</strong>{' '}
                      {end?.toLocaleDateString('fr-Fr', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'numeric',
                        year: 'numeric',
                      })}
                    </CardText>
                    {/* <h6>
                      Durée: {countDays}
                      {countDays > 1 ? ' jours' : ' jour'}
                    </h6> */}
                  </div>
                  <div className='rs-recu-divider' aria-hidden />

                  <div className='my-3'>
                    <CardText>
                      <strong> Montant Total: </strong>
                      {formatPrice(selectedRental?.totalAmount || 0)} F
                    </CardText>
                    <CardText>
                      <strong>Net Payé: </strong>
                      {formatPrice(filterPaiement?.totalPaye)} F
                    </CardText>
                    <CardText>
                      <strong> Reliquat: </strong>
                      {formatPrice(
                        selectedRental?.totalAmount - filterPaiement?.totalPaye
                      )}{' '}
                      F
                    </CardText>
                    <CardText>
                      <strong> Date de paiement:</strong>{' '}
                      {new Date(
                        filterPaiement?.paiementDate
                      ).toLocaleDateString('fr-Fr', {
                        weekday: 'long',
                        year: 'numeric',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </CardText>
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                {' '}
                <p className='font-size-10 text-center'>
                  Merci pour votre confiance et service chez {companyName}. Nous
                  espérons vous revoir bientôt!
                </p>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReçuReservation;
