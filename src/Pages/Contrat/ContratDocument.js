import { Button, Card, CardBody, Container } from 'reactstrap';
import html2pdf from 'html2pdf.js';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ToWords } from 'to-words';
import {
  companyAdresse,
  companyName,
  companyOwnerName,
  companyTel,
} from '../CompanyInfo/CompanyInfo';
import { useParams } from 'react-router-dom';
import { useOneContrat } from '../../Api/queriesContrat';
import {
  capitalizeWords,
  formatPhoneNumber,
  formatPrice,
} from '../components/capitalizeFunction';
import LoadingSpiner from '../components/LoadingSpiner';
import RecuHeader from '../Paiements/ReçueHeader';
import { BackButton } from '../components/NavigationButton';

export default function ContractDocument() {
  const param = useParams();

  const {
    data: selectedContrat,
    isLoading: loadingContrat,
    error: errorContrat,
  } = useOneContrat(param.id);

  const contentRef = useRef();
  const reactToPrintFn = useReactToPrint({ contentRef });

  // ------------------------------------------
  // ------------------------------------------
  // Export En PDF
  // ------------------------------------------
  // ------------------------------------------
  const exportPaiementToPDF = () => {
    const element = document.getElementById('contrat');
    const opt = {
      filename: 'contrat_de_location.pdf',
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
  const start = new Date(selectedContrat?.startDate);
  const end = new Date(selectedContrat?.endDate);

  // Différence en millisecondes
  const diffInMs = end - start;

  // Conversion en jours
  const countDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  const toWords = new ToWords({
    localeCode: 'fr-FR',
    converterOptions: {
      currency: false,
      ignoreDecimal: false,
    },
  });

  return (
    <div className='page-content'>
      <Container fluid>
        <BackButton />

        <div className='modal-header rs-doc-toolbar'>
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
        </div>

        {errorContrat && (
          <h3>Erreur de chargement Veuillez actualiser la page</h3>
        )}

        {loadingContrat && <LoadingSpiner />}

        <div id='contrat' ref={contentRef} className='rs-contrat-doc-page'>
          {!loadingContrat && !errorContrat && (
            <Card className='p-4 rs-contrat-doc-card'>
              <h1 className='text-center text-info rs-contrat-doc-title'>
                CONTRAT DE LOCATION
              </h1>
              <div className='rs-contrat-doc-header-block'>
                <RecuHeader />
              </div>
              <div className='d-flex justify-content-around align-items-start rs-contrat-doc-columns'>
                <div>
                  <p>
                    {' '}
                    <strong> Entre les soussignés : </strong> {companyName}
                  </p>
                  <p>
                    {' '}
                    <strong> Représenter par : </strong> {companyOwnerName}{' '}
                  </p>
                  <p>
                    <strong>Adresse: </strong>
                    {companyAdresse}{' '}
                  </p>
                  <p>
                    {' '}
                    <strong>Contact:</strong> {companyTel}{' '}
                  </p>
                </div>

                <h5 className='my-2'>ET</h5>

                <div>
                  <p>
                    <strong> Mr/Mme :</strong>{' '}
                    {capitalizeWords(
                      selectedContrat?.client?.firstName +
                        ' ' +
                        selectedContrat?.client?.lastName
                    )}
                  </p>
                  <p>
                    <strong> Contact: </strong>
                    {formatPhoneNumber(
                      selectedContrat?.client?.phoneNumber
                    )}{' '}
                  </p>
                  <p>
                    <strong> N° de Pièce: </strong>
                    {formatPhoneNumber(selectedContrat?.client?.pieceNumber) ||
                      '--------'}
                  </p>
                </div>
              </div>

              <CardBody className='rs-contrat-doc-body'>
                <h6 className='text-center'>
                  {' '}
                  IL A ÉTÉ CONVENU ET ARRETE CE QUI SUIT{' '}
                </h6>
                <p>
                  {' '}
                  Le Bailleur donne en location les locaux et équipements
                  ci-après désignés au locataire qui accepte :
                </p>
                <p>
                  <ul>
                    <li>Les locaux et équipements privatifs suivants :</li>
                  </ul>
                </p>
                <p>
                  <strong> Appartement N° : </strong>
                  {formatPhoneNumber(
                    selectedContrat?.appartement?.appartementNumber
                  )}{' '}
                </p>
                <p>
                  <strong>Nom: </strong>
                  {capitalizeWords(selectedContrat?.appartement?.name)}{' '}
                </p>
                <p>
                  {' '}
                  <strong>Situé à l'Adresse de : </strong>{' '}
                  {capitalizeWords(
                    selectedContrat?.appartement?.secteur?.adresse
                  )}{' '}
                </p>
                <p>
                  ainsi que, le cas échéant, les équipements désignés sur une
                  liste annexée aux présentes.{' '}
                </p>

                <ol>
                  <strong>
                    <li>Durée du contrat</li>
                  </strong>
                  <p>
                    Le présent contrat est conclu pour une durée de:{' '}
                    <strong>
                      {countDays}
                      {countDays > 1 ? ' jours' : ' jour'}
                    </strong>
                  </p>
                  <p>
                    Il prendra effet à compter du :{' '}
                    <strong>
                      {new Date(selectedContrat?.startDate).toLocaleDateString(
                        'fr-FR',
                        {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'numeric',
                          year: 'numeric',
                        }
                      )}{' '}
                    </strong>{' '}
                  </p>
                  <p>
                    et prendra fin :{' '}
                    <strong>
                      {new Date(selectedContrat?.endDate).toLocaleDateString(
                        'fr-FR',
                        {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'numeric',
                          year: 'numeric',
                        }
                      )}{' '}
                    </strong>{' '}
                  </p>
                  <li>
                    <strong>Résiliation</strong>

                    <p>
                      {' '}
                      Il pourra etre résilié par une lettre recommandée avec
                      avis de réception ou par acte d'huissier :
                    </p>

                    <ul type='disc'>
                      <li>
                        {' '}
                        Par Le Locataire, à tout moment, sous réserve de
                        prévenir le Bailleur trois jours en avance.
                      </li>
                      <li>
                        Par le bailleur, au terme du contrat, en cas de motif
                        sérieux et légitime résultant notamment de l'inexécution
                        par Le Locataire de l'une des obligations lui incombant.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Destination des lieux</strong>
                  </li>
                  <p>
                    Les lieux loués, objet du présent contrat, sont destinés à
                    l'usage exclusif d'habitation. Le Locataire peut, en
                    conséquence, ne peut y exercer une quelconque profession
                    qu'elle soit artisanale, commerciale ou libérale, sans
                    solliciter et à obtenir l'autorisation expresse et écrite du
                    Bailleur
                  </p>

                  <li>
                    <strong>Montant de la location</strong>
                  </li>

                  <p>
                    {' '}
                    La présente location est consentie et acceptée moyennant
                    paiement d'un loyer journalier librement fixé entre les
                    parties.
                  </p>
                  <p>
                    {' '}
                    Le montant de la présente location s'établit comme suit :
                  </p>

                  <p>
                    {' '}
                    <strong>
                      Somme en Lettres:{' '}
                      <mark>
                        {formatPrice(toWords.convert(selectedContrat?.amount))}{' '}
                        F CFA
                      </mark>{' '}
                    </strong>{' '}
                  </p>
                  <p>
                    {' '}
                    <strong>
                      Ce qui fait un Total de:{' '}
                      <mark>{formatPrice(selectedContrat?.amount)} F</mark>{' '}
                    </strong>{' '}
                  </p>

                  <p>
                    {' '}
                    <strong>
                      Avec une Remise de :{' '}
                      <mark>
                        {formatPrice(selectedContrat?.reduction || 0)} F
                      </mark>{' '}
                    </strong>{' '}
                  </p>
                  {selectedContrat?.totalAmount > 0 && (
                    <p>
                      {' '}
                      <strong>
                        Montant après Remise :{' '}
                        <mark>
                          {formatPrice(selectedContrat?.totalAmount)} F
                        </mark>{' '}
                      </strong>{' '}
                    </p>
                  )}

                  <p>
                    {' '}
                    Le présent loyer pourra etre révisé à la demande de l'une ou
                    l'autre des parties.
                  </p>
                  <p>
                    Dans le cas ou le présent loyer sera réglementé par des
                    textes legislatifs, les variations prévues par textes seront
                    applicables de plein droit
                  </p>

                  <li>
                    {' '}
                    <strong>Obligations du Bailleur</strong>
                    <p>
                      {' '}
                      Le Bailleur est tenu des obligations principales suivantes
                      :
                    </p>
                    <ol type='a'>
                      <li>
                        Délivrer au Locataire les lieux loués en bon état
                        d'usage et de réparations, ainsi que les équipements
                        existants en bon état de fonctionnement.{' '}
                      </li>
                      <li>
                        Assurer au Locataire la jouissance paisble des lieux
                        loués et de le garantir des vices ou défauts de nature à
                        y faire obstacle.
                      </li>
                      <li>
                        Entretenir les locaux en état de servir à l'usage prévu
                        par le présent contrat et y faire toutes les
                        réparations, autres que locatives, nécessaireau maintien
                        en état et à l'entretien normal des lieux loués.{' '}
                      </li>
                    </ol>
                  </li>

                  <li className='my-4'>
                    {' '}
                    <strong>Obligations du locataire </strong>
                    <p>
                      {' '}
                      Le Locataire est tenu des obligations principales
                      suivantes :
                    </p>
                    <ol type='a'>
                      <li>
                        {' '}
                        Payer le loyer et toute autre somme due aux termes
                        convenus.
                      </li>
                      <li>
                        {' '}
                        User paisiblement des lieux loués suivant la destination
                        qui leur a été donnée par le présent contrat .{' '}
                      </li>
                      <li>
                        Répondre des dégradations et pertes qui surviendraient
                        pendant la durée du contrat dans des lieux loués dont il
                        a la jouissance exclusive.
                      </li>
                      <li>
                        ne pas transformer les lieux loués sans l'accord écrit
                        du bailleur ; à défaut d'accord, Le Bailleur pourra
                        exiger du locataire, lors de son départ, la remise en
                        état des lieux loués ou conserver à son bénéfice les
                        transformations effectuées sans que le locataire puisse
                        réclamer une quelconque indemnité
                      </li>
                      <li>
                        Le Bailleur pourra toutefois exiger la remise immédiate
                        des lieux à l'état, aux frais du Locataire, lorsque les
                        transformations effectuées mettront en péril le bon
                        fonctionnement des equipements ou la sécurité des lieux
                        loués.
                      </li>
                      <li>
                        {' '}
                        Ne pas consentir des sous-locations totales ou
                        partielles.
                      </li>
                      <li>
                        {' '}
                        Il est egalement interdit de céder tout ou partie de ses
                        droits locatifs.
                      </li>
                    </ol>
                  </li>


<li >
  <strong>
  Règlements Intérieurs
    </strong> 
  </li>
<p>

Chez 
<strong> GROUPE SIBY</strong>
, l’appartement meublé  est strictement donné  en location 
à  des personnes souhaitant passer un séjour paisible et respectueux. 

</p>

<p>

L’endroit est fait uniquement pour que le locataire puisse passer son séjour 
dans la paix et la tranquillité . 
Nous n’acceptons pas que les lieux soient utilisés à  des fins d’amusement 
abusif, comme transformer l’appartement en bar ou organiser des fêtes 
bruyantes. Toute activité  immorale, telle que l’exploitation d’hommes ou de 
femmes dans le but d’obtenir de l’argent, est également interdite. Même sans 
échange d’argent, ce type de comportement est strictement interdit 
chez <strong> 
  GROUPE SIBY, sauf s’il s’agit de votre conjoint ou conjointe.    
  </strong> 
 </p>
 
 <p>
  
Il est formellement interdit de louer un appartement puis de le relouer à  
une autre personne, sans l’autorisation expresse de <strong>  GROUPE SIBY.  </strong> 

  </p>
  <p className='font-weight-bold'>
    
Toute activité interdite par les lois du pays est également strictement 
prohibée dans les lieux. Tout ce qui est interdit par l’État est 
formellement interdit dans notre Résidence.  
 
 </p>

 <p>
  
<strong>
  GROUPE SIBY 
</strong> 
souhaite travailler dans la transparence et vous remercie de 
votre confiance.

</p>
                  <li>
                    <strong> Election de domicile</strong>
                  </li>

                  <p>
                    Les parties signataires font élection de domicile : Le
                    Bailleur en son domicile et Le Locataire dans les lieux
                    louées.
                  </p>
                </ol>

                <p>
                  {' '}
                  En deux exemplaires, dont un est remis à chacune des parties
                  qui le reconnaissent.
                </p>

                <h6 className='text-end my-4 '>
                  Fait à Bamako,{' '}
                  {new Date(selectedContrat?.startDate).toLocaleDateString(
                    'fr-Fr',
                    {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }
                  )}{' '}
                </h6>
                <div className='d-flex justify-content-between align-items-center rs-contrat-doc-signatures'>
                  <h4> LE BAILLEUR</h4>
                  <h4> LE LOCATAIRE</h4>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
}
