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

import { useCreateSecteur, useUpdateSecteur } from '../../Api/queriesSecteurs';

const SecteurForm = ({ secteurToEdit, tog_form_modal }) => {
  // Paiement Query pour créer la Secteur
  const { mutate: createSecteur } = useCreateSecteur();
  // Secteur Query pour Mettre à jour la Secteur
  const { mutate: updateSecteur } = useUpdateSecteur();

  // State pour gérer le chargement
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      secteur: secteurToEdit?._id || undefined,
      adresse: secteurToEdit?.adresse || undefined,
      secteurNumber: secteurToEdit?.secteurNumber || undefined,
    },
    validationSchema: Yup.object({
      adresse: Yup.string().required('Ce champ est obligatoire'),
      secteurNumber: Yup.number().required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      // Si la méthode est pour mise à jour alors
      const secteurDataLoaded = {
        ...values,
      };

      if (secteurToEdit) {
        updateSecteur(
          {
            id: secteurToEdit?._id,
            data: secteurDataLoaded,
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
        createSecteur(values, {
          onSuccess: () => {
            successMessageAlert('Secteur ajoutée avec succès');
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
            <Label htmlFor='adresse'>Adresse / Quartier</Label>

            <Input
              name='adresse'
              type='text'
              placeholder='Adresse du Secteur Ex: ( Hamdallaye, Sotuba, Missabougou....'
              className='form-control no-spinner border-1 border-dark'
              id='adresse'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.adresse || ''}
              invalid={
                validation.touched.adresse && validation.errors.adresse
                  ? true
                  : false
              }
            />
            {validation.touched.adresse && validation.errors.adresse ? (
              <FormFeedback type='invalid'>
                {validation.errors.adresse}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='secteurNumber'>Numéro d'identifiant</Label>

            <Input
              name='secteurNumber'
              type='number'
              min={0}
              placeholder="Numéro d'identifiant"
              className='form-control border-1 border-dark'
              id='secteurNumber'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.secteurNumber || undefined}
              invalid={
                validation.touched.secteurNumber &&
                validation.errors.secteurNumber
                  ? true
                  : false
              }
            />
            {validation.touched.secteurNumber &&
            validation.errors.secteurNumber ? (
              <FormFeedback type='invalid'>
                {validation.errors.secteurNumber}
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

export default SecteurForm;
