import React, { useMemo, useState } from 'react';
import { Button, ButtonGroup, Container } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import DepenseBilans from './DepenseBilans';
import PaiementBilans from './PaiementBilans';

export default function Bilans() {
  const [bodyContent, setBodyContent] = useState('paiement');

  const body = useMemo(() => {
    if (bodyContent === 'paiement') {
      return <PaiementBilans />;
    }
    if (bodyContent === 'depense') {
      return <DepenseBilans />;
    }
    return null;
  }, [bodyContent]);

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Rapports' breadcrumbItem='Bilans' />

          <div className='rs-bilan-tabs d-flex justify-content-center mb-4'>
            <ButtonGroup className='shadow-sm'>
              <Button
                color={bodyContent === 'paiement' ? 'success' : 'light'}
                className={`px-4 py-2 ${
                  bodyContent === 'paiement'
                    ? 'fw-semibold'
                    : 'text-secondary border'
                }`}
                onClick={() => setBodyContent('paiement')}
                type='button'
              >
                <i className='fas fa-arrow-up me-2' aria-hidden />
                Paiements
              </Button>
              <Button
                color={bodyContent === 'depense' ? 'danger' : 'light'}
                className={`px-4 py-2 ${
                  bodyContent === 'depense'
                    ? 'fw-semibold'
                    : 'text-secondary border'
                }`}
                onClick={() => setBodyContent('depense')}
                type='button'
              >
                <i className='fas fa-arrow-down me-2' aria-hidden />
                Dépenses
              </Button>
            </ButtonGroup>
          </div>

          {body}
        </Container>
      </div>
    </React.Fragment>
  );
}
