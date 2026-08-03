import { Col, Container, Row } from 'reactstrap';
import AppartementListe from '../Appartements/AppartementListe';
import SecteurContrat from './SecteurContrat';
import React from 'react';
import ContratPaiements from './ContratPaiements';
import {
  BackButton,
  DashboardButton,
  HomeButton,
} from '../components/NavigationButton';
import SecteurReservationListe from './SecteurReservationListe';

export default function SelectedSecteur() {
  return (
    <React.Fragment>
      <div className='page-content bg-light rs-selected-layout'>
        <Container fluid={true}>
          <div className='rs-nav-cluster'>
            <BackButton />
            <DashboardButton />
            <HomeButton />
          </div>

          <Row className='g-4'>
            <Col xs={12}>
              {/* OPTIMISATION UX: suppression des hauteurs forcées
                  pour éviter l'overflow/scroll imbriqué. La section
                  s'adapte désormais à la taille réelle du contenu. */}
              <section className='rs-section-panel rs-section-panel--scroll'>
                <AppartementListe />
              </section>
            </Col>

            <Col xs={12}>
              <section className='rs-section-panel rs-section-panel--scroll'>
                <SecteurContrat />
              </section>
            </Col>

            <Col xs={12}>
              <section className='rs-section-panel rs-section-panel--scroll'>
                <SecteurReservationListe />
              </section>
            </Col>

            <Col xs={12}>
              <section className='rs-section-panel rs-section-panel--short'>
                <ContratPaiements />
              </section>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}
