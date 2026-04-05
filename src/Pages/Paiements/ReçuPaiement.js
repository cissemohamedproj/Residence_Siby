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
import { useOnePaiement } from '../../Api/queriesPaiement';
import { companyName } from '../CompanyInfo/CompanyInfo';
import RecuHeader from './ReçueHeader';

const formatRecuDate = (raw, options) => {
  if (raw == null || raw === '') return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', options);
};

const ReçuPaiement = ({
  show_modal,
  tog_show_modal,
  selectedPaiementID,
  totalPaye,
  totalReliqua,
  contrat,
}) => {
  const {
    data: selectedPaiement,
    error,
    isLoading,
  } = useOnePaiement(selectedPaiementID);

  const contentRef = useRef();
  const reactToPrintFn = useReactToPrint({ contentRef });

  // ------------------------------------------
  // ------------------------------------------
  // Export En PDF
  // ------------------------------------------
  // ------------------------------------------
  const exportPaiementToPDF = () => {
    const element = document.getElementById('reçu_de_paiement');
    const opt = {
      filename: 'reçu_de_paiement.pdf',
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

  const client =
    selectedPaiement?.contrat?.client || selectedPaiement?.rental?.client;
  const appartement =
    selectedPaiement?.contrat?.appartement ||
    selectedPaiement?.rental?.appartement;

  /** Contrat / location : la prop `contrat` n'est pas toujours passée (ex. liste des paiements) */
  const contratSource =
    contrat ?? selectedPaiement?.contrat ?? selectedPaiement?.rental ?? null;

  const startRaw =
    contratSource?.startDate ?? contratSource?.rentalDate ?? null;
  const endRaw = contratSource?.endDate ?? contratSource?.rentalEndDate ?? null;

  const startD = startRaw != null ? new Date(startRaw) : null;
  const endD = endRaw != null ? new Date(endRaw) : null;

  const diffInMs =
    startD &&
    endD &&
    !Number.isNaN(startD.getTime()) &&
    !Number.isNaN(endD.getTime())
      ? endD - startD
      : NaN;

  const countDays = Number.isNaN(diffInMs)
    ? null
    : Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  const totalMontant =
    contratSource?.totalAmount ?? contratSource?.amount ?? 0;
  const netPayeLine = totalPaye ?? selectedPaiement?.totalPaye ?? 0;
  const reliquaLine =
    totalReliqua !== undefined && totalReliqua !== null
      ? totalReliqua
      : totalMontant - netPayeLine;

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
            id='reçu_de_paiement'
          >
            <Card className='rs-recu-card'>
              <RecuHeader />
              <CardBody className='mt-2'>
                <div className='d-flex justify-content-center align-items-center flex-column'>
                  <h5 className='mb-4'>Reçue de Paiement</h5>
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
                      <strong> Date d'Entrée:</strong>{' '}
                      {formatRecuDate(startRaw, {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'numeric',
                        year: 'numeric',
                      })}
                    </CardText>
                    <CardText>
                      <strong> Date de Sortie:</strong>{' '}
                      {formatRecuDate(endRaw, {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'numeric',
                        year: 'numeric',
                      })}
                    </CardText>
                    <h6>
                      Durée:{' '}
                      {countDays == null
                        ? '—'
                        : `${countDays}${countDays > 1 ? ' jours' : ' jour'}`}
                    </h6>
                  </div>
                  <div className='rs-recu-divider' aria-hidden />

                  <div className='my-3'>
                    <CardText>
                      <strong> Montant Total: </strong>
                      {formatPrice(totalMontant)} F
                    </CardText>
                    <CardText>
                      <strong>Net Payé: </strong>
                      {formatPrice(netPayeLine)} F
                    </CardText>
                    <CardText>
                      <strong> Reliquat: </strong>
                      {formatPrice(reliquaLine)} F
                    </CardText>
                    <CardText>
                      <strong> Date de paiement:</strong>{' '}
                      {formatRecuDate(selectedPaiement?.paiementDate, {
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

export default ReçuPaiement;
