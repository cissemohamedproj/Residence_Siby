import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from 'reactstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState } from 'react';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  useCreatePaiement,
  useUpdatePaiement,
} from '../../Api/queriesPaiement';
import { useParams } from 'react-router-dom';
import { formatPrice } from '../components/capitalizeFunction';

const PaiementForm = ({
  paiementToEdit,
  tog_form_modal,
  totalContratAmount,
  totalReliqua,
}) => {
  const contrat = useParams();
  // Paiement Query pour créer la Paiement
  const { mutate: createPaiement } = useCreatePaiement();
  // Paiement Query pour Mettre à jour la Paiement
  const { mutate: updatePaiement } = useUpdatePaiement();

  // State pour gérer le chargement
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      contrat: paiementToEdit?.contrat?._id || contrat?.id,
      paiementDate: paiementToEdit?.paiementDate.substring(0, 10) || '',
      totalPaye: paiementToEdit?.totalPaye || undefined,
    },
    validationSchema: Yup.object({
      paiementDate: Yup.date().required('Ce champ est obligatoire'),
      totalPaye: Yup.number()
        .positive('Vous devez entrez une valeur positive')
        .required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      if (paiementToEdit) {
        updatePaiement(
          {
            id: paiementToEdit?._id,
            data: values,
          },
          {
            onSuccess: () => {
              successMessageAlert('Données mise à jour avec succès');
              setIsLoading(false);
              tog_form_modal();
            },
            onError: (err) => {
              errorMessageAlert(
                err?.response?.data?.message ||
                  err?.message ||
                  'Erreur lors de la mise à jour'
              );
              setIsLoading(false);
            },
          }
        );
      }

      // Sinon on créer un nouveau étudiant
      else {
        createPaiement(values, {
          onSuccess: () => {
            successMessageAlert('Paiement ajoutée avec succès');
            setIsLoading(false);
            resetForm();
            tog_form_modal();
          },
          onError: (err) => {
            const errorMessage =
              err?.response?.data?.message ||
              err?.message ||
              "Oh Oh ! une erreur est survenu lors de l'enregistrement";
            errorMessageAlert(errorMessage);
            setIsLoading(false);
          },
        });
      }
      setTimeout(() => {
        if (isLoading) {
          errorMessageAlert('Une erreur est survenue. Veuillez réessayer !');
          setIsLoading(false);
        }
      }, 10000);
    },
  });

  return (
    <Form
      className='needs-validation'
      onSubmit={(e) => {
        e.preventDefault();
        validation.handleSubmit();
        return false;
      }}
    >
      {!paiementToEdit && (
        <div>
          <h6 className='text-end'>
            Total Contrat{': '}
            <span className='text-info'>
              {formatPrice(totalContratAmount)}
              {' F'}
            </span>{' '}
          </h6>
          <h6 className='text-end'>
            Reliquat{': '}
            <span className='text-danger'>
              {formatPrice(totalReliqua)}{' '}
            </span>{' '}
          </h6>
        </div>
      )}
      <Row>
        <Col md='12'>
          <FormGroup className='mb-3'>
            <Label htmlFor='totalPaye'>Somme Payé</Label>

            <Input
              name='totalPaye'
              type='number'
              min={0}
              max={totalReliqua}
              placeholder='Somme Payé'
              className='form-control no-spinner border-1 border-dark'
              id='totalPaye'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.totalPaye || ''}
              invalid={
                validation.touched.totalPaye && validation.errors.totalPaye
                  ? true
                  : false
              }
            />
            {validation.touched.totalPaye && validation.errors.totalPaye ? (
              <FormFeedback type='invalid'>
                {validation.errors.totalPaye}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='12'>
          <FormGroup className='mb-3'>
            <Label htmlFor='paiementDate'>Date de Paiement</Label>

            <Input
              name='paiementDate'
              type='date'
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              className='form-control border-1 border-dark'
              id='paiementDate'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.paiementDate || ''}
              invalid={
                validation.touched.paiementDate &&
                validation.errors.paiementDate
                  ? true
                  : false
              }
            />
            {validation.touched.paiementDate &&
            validation.errors.paiementDate ? (
              <FormFeedback type='invalid'>
                {validation.errors.paiementDate}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>

      <div className='d-grid text-center mt-4'>
        {isLoading && <LoadingSpiner />}
        {!isLoading && (
          <Button color='success' type='submit'>
            Enregisrer
          </Button>
        )}
      </div>
    </Form>
  );
};

export default PaiementForm;
