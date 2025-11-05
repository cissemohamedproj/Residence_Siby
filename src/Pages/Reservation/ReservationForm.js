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
import { useEffect, useState } from 'react';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import LoadingSpiner from '../components/LoadingSpiner';
import { useAllAppartement } from '../../Api/queriesAppartement';
import { formatPrice } from '../components/capitalizeFunction';
import { useCreateRental, useUpdateRental } from '../../Api/queriesReservation';

const ReservationForm = ({ reservationToEdit, clientId, tog_form_modal }) => {
  const { mutate: createRental } = useCreateRental();
  const { mutate: updateRental } = useUpdateRental();
  const {
    data: appartment,
    isLoading: loadingAppart,
    error: errorAppart,
  } = useAllAppartement();

  const [isLoading, setIsLoading] = useState(false);
  const [minimumTotalPaye, setMinimumTotalPaye] = useState(0);

  const storage = localStorage.getItem('selectedSecteur');
  const secteurStorage = JSON.parse(storage);
  const secteurAppartement = appartment?.filter(
    (item) => item?.secteur?._id === secteurStorage?._id
  );

  // Form validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      client: reservationToEdit?.client?._id || clientId,
      appartement: reservationToEdit?.appartement?._id || '',
      heure: reservationToEdit?.heure || 0,
      jour: reservationToEdit?.jour || 0,
      semaine: reservationToEdit?.semaine || 0,
      mois: reservationToEdit?.mois || 0,
      rentalDate: reservationToEdit?.rentalDate.substring(0, 10) || undefined,
      rentalEndDate:
        reservationToEdit?.rentalEndDate.substring(0, 10) || undefined,
      totalAmount: reservationToEdit?.totalAmount || '',
      totalPaye: reservationToEdit?.totalPaye || '',
      statut: reservationToEdit?.statut || 'en cours',
    },
    validationSchema: Yup.object({
      appartement: Yup.string().required('Ce Champ est Obligatoire'),
      heure: Yup.number(),
      jour: Yup.number(),
      semaine: Yup.number(),
      mois: Yup.number(),
      rentalDate: Yup.date().required('Ce champ est obligatoire'),
      rentalEndDate: Yup.date().required('Ce champ est obligatoire'),
      totalPaye: Yup.number()
        .required('Le montant est obligatoire')
        .min(0, 'Le montant ne peut pas être négatif'),
      totalAmount: Yup.number()
        .required('Le montant est obligatoire')
        .min(0, 'Le montant ne peut pas être négatif'),
      statut: Yup.string().required('Le statut est obligatoire'),
    }),

    onSubmit: (values, { resetForm }) => {
      setIsLoading(true);

      if (reservationToEdit) {
        updateRental(
          { id: reservationToEdit._id, data: values },
          {
            onSuccess: () => {
              successMessageAlert('Mise à jour avec succès');
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

      // Sinon on créer un nouveau
      else {
        createRental(values, {
          onSuccess: () => {
            successMessageAlert('Enregistrée avec succès');
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

  // utiliser useEffet pour sélectionner automatique la date de fin lorsqu'on choisi la date de début et la durée
  useEffect(() => {
    const selectedAppartement = validation.values.appartement;

    if (!selectedAppartement) return;
    const filterAppartement = secteurAppartement?.find(
      (value) =>
        value?._id === selectedAppartement &&
        value?.secteur?._id === secteurStorage?._id
    );

    if (!filterAppartement) return;
    const hValue = validation.values.heure || 0;
    const dayValue = validation.values.jour || 0;
    const weekValue = validation.values.semaine || 0;
    const mounthValue = validation.values.mois || 0;

    const heurePrice = Number((filterAppartement.heurePrice || 0) * hValue);
    const dayPrice = Number((filterAppartement.dayPrice || 0) * dayValue);
    const weekPrice = Number((filterAppartement.weekPrice || 0) * weekValue);
    const mounthPrice = Number(
      (filterAppartement.mounthPrice || 0) * mounthValue
    );

    const minValue =
      filterAppartement?.heurePrice > 0
        ? filterAppartement?.heurePrice
        : filterAppartement?.dayPrice;
    setMinimumTotalPaye(minValue);
    //  Nouveau total calculé
    const total = heurePrice + dayPrice + weekPrice + mounthPrice;

    validation.setFieldValue('totalAmount', total > 0 ? total : 0);

    if (validation.values.rentalDate) {
      const startDate = new Date(validation.values.rentalDate);
      let endDate = new Date(startDate);

      if (validation.values.heure) {
        endDate.setHours(
          endDate.getHours() + parseInt(validation.values.heure)
        );
      }
      if (validation.values.jour) {
        endDate.setDate(endDate.getDate() + parseInt(validation.values.jour));
      }
      if (validation.values.semaine) {
        endDate.setDate(
          endDate.getDate() + parseInt(validation.values.semaine) * 7
        );
      }
      if (validation.values.mois) {
        endDate.setMonth(endDate.getMonth() + parseInt(validation.values.mois));
      }

      // Formater la date au format YYYY-MM-DD pour l'input de type date
      const formattedEndDate = endDate.toISOString().substring(0, 10);
      validation.setFieldValue('rentalEndDate', formattedEndDate);
    }
  }, [
    validation.values.heure,
    validation.values.jour,
    validation.values.semaine,
    validation.values.mois,
    validation.values.rentalDate,
    validation.values.appartement,
  ]);

  const today = new Date();

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
        {loadingAppart && <LoadingSpiner />}
        {!loadingAppart && errorAppart && secteurAppartement?.length === 0 && (
          <h6 className='text-center text-warning'>
            Aucun Appartement dans le Secteur {secteurStorage?.secteurNumber}
          </h6>
        )}
        {!loadingAppart && !errorAppart && secteurAppartement?.length > 0 && (
          <Col md='12'>
            <FormGroup className='mb-3'>
              <Label htmlFor='appartement'>N° d'Appartement</Label>
              <Input
                name='appartement'
                placeholder='appartement...'
                type='select'
                className='form-control border-1 border-dark'
                id='appartement'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.appartement || ''}
                invalid={
                  validation.touched.appartement &&
                  validation.errors.appartement
                    ? true
                    : false
                }
              >
                <option value=''>Sélectionner un Appartement</option>

                {secteurAppartement?.map((item) => (
                  <option value={item?._id} key={item?._id}>
                    {formatPrice(item.appartementNumber)}{' '}
                  </option>
                ))}
              </Input>
              {validation.touched.appartement &&
              validation.errors.appartement ? (
                <FormFeedback type='invalid'>
                  {validation.errors.appartement}
                </FormFeedback>
              ) : null}
            </FormGroup>
          </Col>
        )}
      </Row>
      <h6 className='my-3 text-info'>Duréer de Séjour</h6>
      <Row>
        <Col md='3'>
          <FormGroup className='mb-3'>
            <Label htmlFor='heure'>Heure</Label>
            <Input
              name='heure'
              placeholder='Heure...'
              type='number'
              min={0}
              className='form-control border-1 border-dark'
              id='heure'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.heure || ''}
              invalid={
                validation.touched.heure && validation.errors.heure
                  ? true
                  : false
              }
            />
            {validation.touched.heure && validation.errors.heure ? (
              <FormFeedback type='invalid'>
                {validation.errors.heure}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='3'>
          <FormGroup className='mb-3'>
            <Label htmlFor='jour'>Jour</Label>
            <Input
              name='jour'
              placeholder='Jour...'
              type='number'
              min={0}
              className='form-control border-1 border-dark'
              id='jour'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.jour || ''}
              invalid={
                validation.touched.jour && validation.errors.jour ? true : false
              }
            />
            {validation.touched.jour && validation.errors.jour ? (
              <FormFeedback type='invalid'>
                {validation.errors.jour}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='3'>
          <FormGroup className='mb-3'>
            <Label htmlFor='semaine'> Semaine</Label>
            <Input
              name='semaine'
              placeholder='Semaine...'
              type='number'
              min={0}
              className='form-control border-1 border-dark'
              id='semaine'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.semaine || ''}
              invalid={
                validation.touched.semaine && validation.errors.semaine
                  ? true
                  : false
              }
            />
            {validation.touched.semaine && validation.errors.semaine ? (
              <FormFeedback type='invalid'>
                {validation.errors.semaine}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='3'>
          <FormGroup className='mb-3'>
            <Label htmlFor='mois'>Mois</Label>
            <Input
              name='mois'
              placeholder='Mois...'
              type='number'
              min={0}
              className='form-control border-1 border-dark'
              id='mois'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.mois || ''}
              invalid={
                validation.touched.mois && validation.errors.mois ? true : false
              }
            />
            {validation.touched.mois && validation.errors.mois ? (
              <FormFeedback type='invalid'>
                {validation.errors.mois}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='rentalDate'>Date de Reservation</Label>
            <Input
              name='rentalDate'
              placeholder="Entrez la date d'Entrée..."
              type='date'
              min={new Date(today.setDate(today.getDate() + 2))
                .toISOString()
                .substring(0, 10)}
              className='form-control border-1 border-dark'
              id='rentalDate'
              onChange={(e) => {
                validation.handleChange(e);
                if (
                  validation.values.rentalEndDate &&
                  e.target.value > validation.values.rentalEndDate
                ) {
                  validation.setFieldValue('rentalEndDate', e.target.value);
                }
              }}
              onBlur={validation.handleBlur}
              value={validation.values.rentalDate || ''}
              invalid={
                validation.touched.rentalDate && validation.errors.rentalDate
                  ? true
                  : false
              }
            />
            {validation.touched.rentalDate && validation.errors.rentalDate ? (
              <FormFeedback type='invalid'>
                {validation.errors.rentalDate}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='rentalEndDate'>Fin de Reservation</Label>
            <Input
              name='rentalEndDate'
              placeholder='Entrez la date de fin...'
              type='date'
              min={
                validation.values.rentalDate ||
                new Date().toISOString().substring(0, 10)
              }
              className='form-control border-1 border-dark'
              id='rentalEndDate'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.rentalEndDate || ''}
              invalid={
                validation.touched.rentalEndDate &&
                validation.errors.rentalEndDate
                  ? true
                  : false
              }
            />
            {validation.touched.rentalEndDate &&
            validation.errors.rentalEndDate ? (
              <FormFeedback type='invalid'>
                {validation.errors.rentalEndDate}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='totalAmount'>Montant Total</Label>
            <Input
              name='totalAmount'
              placeholder='Montant Payé...'
              type='number'
              min={0}
              className='form-control border-1 border-dark'
              id='totalAmount'
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.totalAmount || ''}
              invalid={
                validation.touched.totalAmount && validation.errors.totalAmount
                  ? true
                  : false
              }
            />
            {validation.touched.totalAmount && validation.errors.totalAmount ? (
              <FormFeedback type='invalid'>
                {validation.errors.totalAmount}
              </FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
        <Col md='6'>
          <FormGroup className='mb-3'>
            <Label htmlFor='totalPaye'>Montant Payé</Label>
            <Input
              name='totalPaye'
              placeholder='Montant Payé...'
              type='number'
              min={minimumTotalPaye}
              className='form-control border-1 border-dark'
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

export default ReservationForm;
