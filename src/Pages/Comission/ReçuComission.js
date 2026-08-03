import { Button, Card, CardBody, CardFooter, Modal } from 'reactstrap';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import html2pdf from 'html2pdf.js';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { companyName } from '../CompanyInfo/CompanyInfo';
import RecuHeader from '../Paiements/ReçueHeader';

const ReçuComission = ({ show_modal, tog_show_modal, selectedComission }) => {
  const contentRef = useRef();
  const reactToPrintFn = useReactToPrint({ contentRef });

  // ------------------------------------------
  // ------------------------------------------
  // Export En PDF
  // ------------------------------------------
  // ------------------------------------------
  const exportPaiementToPDF = () => {
    const element = document.getElementById('reçu_de_comission');
    const opt = {
      filename: 'reçu_de_comission.pdf',
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
        <div
          className='mx-5 py-3 d-flex justify-content-center rs-recu-root'
          id='reçu_de_paiement'
        >
          <Card className='rs-recu-card'>
            <RecuHeader />
            <CardBody className='mt-2'>
              <h5 className='mb-4 text-center'>Reçue de Comission</h5>

              <div className='d-flex justify-content-around align-items-center px-2 rs-recu-two-col'>
                <div>
                  <p>
                    {capitalizeWords(
                      selectedComission?.client?.firstName +
                        ' ' +
                        selectedComission?.client?.lastName
                    )}
                  </p>
                  <p>
                    {formatPhoneNumber(selectedComission?.client?.phoneNumber)}
                  </p>
                </div>
                <div className='rs-recu-divider' aria-hidden />

                <div className='my-3'>
                  <p>
                    <strong> Montant Total: </strong>
                    {formatPrice(selectedComission?.amount || 0)} F
                  </p>
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
      </div>
    </Modal>
  );
};

export default ReçuComission;
