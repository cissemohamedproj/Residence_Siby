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
import { useCreateClient, useUpdateClient } from '../../Api/queriesClient';

const ClientForm = ({ clientToEdit, tog_form_modal }) => {
  const { mutate: createClient } = useCreateClient();

  const { mutate: updateClient } = useUpdateClient();
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      firstName: clientToEdit?.firstName || '',
      lastName: clientToEdit?.lastName || '',
      pieceNumber: clientToEdit?.pieceNumber || '',
      phoneNumber: clientToEdit?.phoneNumber || undefined,
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Veillez Entrez une valeur correct !')
        .required('Ce champ est obligatoire'),

      lastName: Yup.string()
        .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Veillez Entrez une valeur correct !')
        .required('Ce champ Prénom est obligatoire'),
      pieceNumber: Yup.string().required('Ce champ Prénom est obligatoire'),
      phoneNumber: Yup.number().required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      if (clientToEdit) {
        updateClient(
          { id: clientToEdit._id, data: values },
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
        createClient(values, {
          onSuccess: () => {
            successMessageAlert('Client ajoutée avec succès');
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
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='firstName'>Nom</Label>
            <Input
              name='firstName'
              placeholder='Entrez un nom...'
              type='text'
              className='form-control border-1 border-dark'
              id='firstName'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.firstName || ''}
              invalid={
                validation.touched.firstName && validation.errors.firstName
                  ? true
                  : false
              }
            />
            {validation.touched.firstName && validation.errors.firstName ? (
              <FormFeedback type='invalid'>
                {validation.errors.firstName}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='lastName'>Prénom</Label>
            <Input
              name='lastName'
              placeholder='Entrez un prénom...'
              type='text'
              className='form-control border-1 border-dark'
              id='lastName'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.lastName || ''}
              invalid={
                validation.touched.lastName && validation.errors.lastName
                  ? true
                  : false
              }
            />
            {validation.touched.lastName && validation.errors.lastName ? (
              <FormFeedback type='invalid'>
                {validation.errors.lastName}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='pieceNumber'>Numéro du Pièce d'identité</Label>
            <Input
              name='pieceNumber'
              placeholder="Entrez le numéro du pièce d'identité..."
              type='tel'
              className='form-control border-1 border-dark'
              id='pieceNumber'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.pieceNumber || ''}
              invalid={
                validation.touched.pieceNumber && validation.errors.pieceNumber
                  ? true
                  : false
              }
            />
            {validation.touched.pieceNumber && validation.errors.pieceNumber ? (
              <FormFeedback type='invalid'>
                {validation.errors.pieceNumber}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='phoneNumber'>Téléphone</Label>
            <Input
              name='phoneNumber'
              placeholder='70 00 00 00'
              type='tel'
              className='form-control border-1 border-dark'
              id='phoneNumber'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.phoneNumber || ''}
              invalid={
                validation.touched.phoneNumber && validation.errors.phoneNumber
                  ? true
                  : false
              }
            />
            {validation.touched.phoneNumber && validation.errors.phoneNumber ? (
              <FormFeedback type='invalid'>
                {validation.errors.phoneNumber}
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

export default ClientForm;
