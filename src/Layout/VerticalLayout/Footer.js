import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { companyName } from '../../Pages/CompanyInfo/CompanyInfo';

const Footer = () => {
  return (
    <React.Fragment>
      <footer className='footer rs-app-footer'>
        <Container fluid={true}>
          <Row>
            <Col sm={6}>
              {new Date().getFullYear()} © {companyName}.
            </Col>
            <Col sm={6}>
              <div className='text-sm-end d-none d-sm-block'>
                Crafted with <i className='mdi mdi-heart text-danger'></i> by{' '}
                <a
                  href='https://www.mohamedcisse.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='rs-footer-author-link text-decoration-underline'
                >
                  Cisse Mohamed
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  );
};

export default Footer;
