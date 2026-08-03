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
import React, { useEffect, useState } from 'react';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import LoadingSpiner from '../components/LoadingSpiner';
import {
  useCreateAppartement,
  useUpdateAppartement,
} from '../../Api/queriesAppartement';

const AppartementForm = ({
  tog_form_modal,
  selectedSecteur,
  appartementToEdit,
}) => {
  // Matériels Query pour créer la Medicament
  const { mutate: createAppartement } = useCreateAppartement();
  const { mutate: updateAppartement } = useUpdateAppartement();
  // State de chargement
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      name: appartementToEdit?.name || undefined,
      appartementNumber: appartementToEdit?.appartementNumber || undefined,
      heurePrice: appartementToEdit?.heurePrice || undefined,
      dayPrice: appartementToEdit?.dayPrice || undefined,
      weekPrice: appartementToEdit?.weekPrice || undefined,
      mounthPrice: appartementToEdit?.mounthPrice || undefined,
      description: appartementToEdit?.description || '',
      isAvailable: appartementToEdit?.isAvailable ?? true,
      etat: appartementToEdit?.etat ?? true,
      secteur: selectedSecteur?.id,
    },

    validationSchema: Yup.object({
      name: Yup.string().required('Ce champ est obligatoire'),
      appartementNumber: Yup.number().required('Ce champ est obligatoire'),
      heurePrice: Yup.number(),
      dayPrice: Yup.number().required('Ce champ est obligatoire'),
      weekPrice: Yup.number().required('Ce champ est obligatoire'),
      mounthPrice: Yup.number().required('Ce champ est obligatoire'),
      description: Yup.string(),
      isAvailable: Yup.boolean().required('Ce champ est obligatoire'),
      etat: Yup.boolean().required('Ce champ est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      if (appartementToEdit) {
        updateAppartement(
          { id: appartementToEdit?._id, data: values },
          {
            onSuccess: () => {
              setIsLoading(false);
              successMessageAlert('Mise à jours avec succès');
              resetForm();
              tog_form_modal();
            },
            onError: (err) => {
              console.log(err);
              const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Oh Oh ! Une erreur est survenue lors de mis à jours';
              errorMessageAlert(errorMessage);
              setIsLoading(false);
            },
          }
        );
      } else {
        createAppartement(values, {
          onSuccess: () => {
            successMessageAlert('Appartement ajouté avec succès');
            setIsLoading(false);
            resetForm();
            tog_form_modal();
          },
          onError: (err) => {
            console.log(err);
            const errorMessage =
              err?.response?.data?.message ||
              err?.message ||
              "Oh Oh ! Une erreur est survenue lors de l'enregistrement";
            errorMessageAlert(errorMessage);
            setIsLoading(false);
          },
        });
      } // Sécurité : timeout pour stopper le chargement si blocage
      setTimeout(() => {
        if (isLoading) {
          errorMessageAlert('Une erreur est survenue. Veuillez réessayer !');
          setIsLoading(false);
        }
      }, 10000);
    },
  });

  useEffect(() => {
    const hPrice = validation.values.heurePrice;
    const dPrice = validation.values.dayPrice;

    if (hPrice > 0) {
      validation.setFieldValue('dayPrice', hPrice * 24);
      validation.setFieldValue('weekPrice', hPrice * 24 * 7);
      validation.setFieldValue('mounthPrice', hPrice * 24 * 7 * 4);
    }

    if (dPrice > 0) {
      validation.setFieldValue('weekPrice', dPrice * 7);
      validation.setFieldValue('mounthPrice', dPrice * 30);
    }

    return;
  }, [validation.values.heurePrice, validation.values.dayPrice]);

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
        <Col sm='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='appartementNumber'>N° d'Appartement</Label>
            <Input
              name='appartementNumber'
              placeholder='Entrez le N° ID'
              type='number'
              className='form-control border-1 border-dark'
              id='appartementNumber'
              min={1}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.appartementNumber || ''}
              invalid={
                validation.touched.appartementNumber &&
                validation.errors.appartementNumber
                  ? true
                  : false
              }
            />
            {validation.touched.appartementNumber &&
            validation.errors.appartementNumber ? (
              <FormFeedback type='invalid'>
                {validation.errors.appartementNumber}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col sm='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='name'>Nom</Label>
            <Input
              name='name'
              placeholder='ex: Chambre Salon, Studio etc...'
              type='text'
              className='form-control border-1 border-dark'
              id='name'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.name || ''}
              invalid={
                validation.touched.name && validation.errors.name ? true : false
              }
            />
            {validation.touched.name && validation.errors.name ? (
              <FormFeedback type='invalid'>
                {validation.errors.name}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='heurePrice'>Prix / Heure</Label>
            <Input
              name='heurePrice'
              placeholder='Entrez un prix / Heure'
              type='number'
              className='form-control border-1 border-dark'
              id='heurePrice'
              min={1}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.heurePrice || ''}
              invalid={
                validation.touched.heurePrice && validation.errors.heurePrice
                  ? true
                  : false
              }
            />
            {validation.touched.heurePrice && validation.errors.heurePrice ? (
              <FormFeedback type='invalid'>
                {validation.errors.heurePrice}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='dayPrice'>Prix / Jour</Label>
            <Input
              name='dayPrice'
              placeholder='Entrez un prix / Jour'
              type='number'
              className='form-control border-1 border-dark'
              id='dayPrice'
              min={1}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.dayPrice || ''}
              invalid={
                validation.touched.dayPrice && validation.errors.dayPrice
                  ? true
                  : false
              }
            />
            {validation.touched.dayPrice && validation.errors.dayPrice ? (
              <FormFeedback type='invalid'>
                {validation.errors.dayPrice}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='weekPrice'>Prix / Semaine</Label>
            <Input
              name='weekPrice'
              placeholder='Entrez un prix / Semaine'
              type='number'
              className='form-control border-1 border-dark'
              id='weekPrice'
              min={1}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.weekPrice || ''}
              invalid={
                validation.touched.weekPrice && validation.errors.weekPrice
                  ? true
                  : false
              }
            />
            {validation.touched.weekPrice && validation.errors.weekPrice ? (
              <FormFeedback type='invalid'>
                {validation.errors.weekPrice}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='6'>
          <FormGroup>
            <Label htmlFor='mounthPrice'>Prix / Mois</Label>
            <Input
              type='number'
              min={1}
              name='mounthPrice'
              placeholder='Entrez un prix / Mois'
              className='form-control border-1 border-dark'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.mounthPrice || ''}
              invalid={
                validation.touched.mounthPrice && validation.errors.mounthPrice
                  ? true
                  : false
              }
            />

            {validation.touched.mounthPrice && validation.errors.mounthPrice ? (
              <FormFeedback type='invalid'>
                {validation.errors.mounthPrice}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='6'>
          <FormGroup>
            <Label htmlFor='etat' className='d-block'>
              Etat d'Appartement
            </Label>

            <div className='d-flex justify-content-center align-items-center'>
              <Input
                type='checkbox'
                name='etat'
                // checked={validation.values.etat}
                className={`form-control border-1 border-dark  ${
                  validation.values.etat ? 'bg-success' : 'bg-light'
                }`}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.etat && validation.errors.etat
                    ? true
                    : false
                }
              />
              {validation.touched.etat && validation.errors.etat ? (
                <FormFeedback type='invalid'>
                  {validation.errors.etat}
                </FormFeedback>
              ) : null}
              <span className='ms-2 mt-1 text-center'>
                {validation.values.etat ? 'Bon' : 'Pas Bon'}{' '}
              </span>
            </div>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm='12'>
          <FormGroup className='mb-3'>
            <Label htmlFor='description'>Description</Label>
            <Input
              name='description'
              placeholder='ex: vous pouvez decrire ici votre appartement...'
              type='text'
              className='form-control border-1 border-dark'
              id='description'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.description || ''}
              invalid={
                validation.touched.description && validation.errors.description
                  ? true
                  : false
              }
            />
            {validation.touched.description && validation.errors.description ? (
              <FormFeedback type='invalid'>
                {validation.errors.description}
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

export default AppartementForm;
