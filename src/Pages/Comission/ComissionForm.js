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
import { useParams } from 'react-router-dom';
import {
  useCreateComission,
  useUpdateComission,
} from '../../Api/queriesComission';

const ComissionForm = ({ comissionToEdit, tog_form_modal }) => {
  const client = useParams();
  // Paiement Query pour créer la Paiement
  const { mutate: createComission } = useCreateComission();
  // Paiement Query pour Mettre à jour la Paiement
  const { mutate: updateComission } = useUpdateComission();

  // State pour gérer le chargement
  const [isLoading, setIsLoading] = useState(false);

  const selectedSecteur = localStorage.getItem('selectedSecteur');
  const secteur = JSON.parse(selectedSecteur);

  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      secteur: comissionToEdit?.secteur?._id || secteur?._id,
      client: comissionToEdit?.client?._id || client?.id,
      beneficiaire: comissionToEdit?.beneficiaire || '',
      details: comissionToEdit?.details || '',
      paiementDate:
        comissionToEdit?.paiementDate.substring(0, 10) ||
        new Date()?.toISOString()?.substring(0, 10),
      amount: comissionToEdit?.amount || undefined,
    },
    validationSchema: Yup.object({
      paiementDate: Yup.date().required('Ce champ est obligatoire'),
      beneficiaire: Yup.string().required('Ce Champ est obligatoire'),
      details: Yup.string().required('Ce Champ est obligatoire'),
      client: Yup.string().required('Ce Champ est obligatoire'),
      amount: Yup.number()
        .positive('Vous devez entrez une valeur positive')
        .required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      if (comissionToEdit) {
        updateComission(
          {
            id: comissionToEdit?._id,
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
        createComission(values, {
          onSuccess: () => {
            successMessageAlert('Comission ajoutée avec succès');
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
      <Row>
        <Col md='12'>
          <FormGroup className='mb-3'>
            <Label htmlFor='amount'>Montant de Comission</Label>

            <Input
              name='amount'
              type='number'
              min={0}
              placeholder='Montant de comission'
              className='form-control no-spinner border-1 border-dark'
              id='amount'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.amount || ''}
              invalid={
                validation.touched.amount && validation.errors.amount
                  ? true
                  : false
              }
            />
            {validation.touched.amount && validation.errors.amount ? (
              <FormFeedback type='invalid'>
                {validation.errors.amount}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='beneficiaire'>Bénéficiaire</Label>

            <Input
              name='beneficiaire'
              type='text'
              placeholder='Entre le Nom de bénéficiaire'
              className='form-control no-spinner border-1 border-dark'
              id='beneficiaire'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.beneficiaire || ''}
              invalid={
                validation.touched.beneficiaire &&
                validation.errors.beneficiaire
                  ? true
                  : false
              }
            />
            {validation.touched.beneficiaire &&
            validation.errors.beneficiaire ? (
              <FormFeedback type='invalid'>
                {validation.errors.beneficiaire}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='details'>Détails</Label>

            <Input
              name='details'
              type='text'
              placeholder='Entre les détails'
              className='form-control no-spinner border-1 border-dark'
              id='details'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.details || ''}
              invalid={
                validation.touched.details && validation.errors.details
                  ? true
                  : false
              }
            />
            {validation.touched.details && validation.errors.details ? (
              <FormFeedback type='invalid'>
                {validation.errors.details}
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

export default ComissionForm;
