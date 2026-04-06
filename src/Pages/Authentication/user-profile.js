import React, { useContext, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
} from 'reactstrap';

import withRouter from '../../components/Common/withRouter';

import Breadcrumb from '../../components/Common/Breadcrumb';

import { AuthContext } from '../../Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { companyName } from '../CompanyInfo/CompanyInfo';

function profileInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const UserProfile = () => {
  document.title = `Mon profil | ${companyName}`;

  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);

  // Source unique de vérité en prod: AuthContext (réhydraté depuis localStorage)
  const user = auth?.user ?? null;
  const connectedUserName = user?.name ?? '';
  const connectedUserEmail = user?.email ?? '';
  const connectedUserRole = user?.role ?? null;

  const initials = useMemo(
    () => profileInitials(connectedUserName),
    [connectedUserName]
  );

  const roleLabel =
    connectedUserRole === 'admin' ? 'Administrateur' : 'Utilisateur';

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumb title='Mon espace' breadcrumbItem='Profil' />

          <Row className='justify-content-center'>
            <Col xs={12} lg={10} xl={7}>
              <Card className='border-0 shadow-sm overflow-hidden rs-profile-card'>
                <div className='rs-profile-header' aria-hidden />
                <CardBody className='position-relative px-4 px-md-5 pb-4 pt-0'>
                  <div className='rs-profile-avatar' aria-hidden>
                    <span className='rs-profile-avatar__initials'>
                      {initials}
                    </span>
                  </div>

                  <div className='rs-profile-body text-center'>
                    <h2 className='rs-profile-name mb-1'>
                      {connectedUserName || 'Utilisateur'}
                    </h2>
                    <p className='rs-profile-brand text-muted small mb-3'>
                      {companyName}
                    </p>

                    <div className='rs-profile-meta d-inline-flex flex-column flex-sm-row align-items-center justify-content-center gap-2 gap-sm-3 mb-4'>
                      <span className='rs-profile-meta__item'>
                        <i
                          className='fas fa-envelope text-primary me-2'
                          aria-hidden
                        />
                        <a
                          href={
                            connectedUserEmail
                              ? `mailto:${connectedUserEmail}`
                              : undefined
                          }
                          className='rs-profile-email'
                        >
                          {connectedUserEmail || '—'}
                        </a>
                      </span>
                      <span
                        className='rs-profile-meta__divider d-none d-sm-inline'
                        aria-hidden
                      />
                      <span className='rs-profile-meta__item'>
                        <i
                          className='fas fa-user-shield text-primary me-2'
                          aria-hidden
                        />
                        <Badge
                          pill
                          className={`rs-profile-role-badge ${
                            connectedUserRole === 'admin'
                              ? 'rs-profile-role-badge--admin'
                              : 'rs-profile-role-badge--user'
                          }`}
                        >
                          {roleLabel}
                        </Badge>
                      </span>
                    </div>

                    <div className='rs-profile-actions'>
                      {connectedUserRole === 'admin' && (
                        <Button
                          color='primary'
                          outline
                          className='rs-profile-btn'
                          onClick={() => navigate('/register')}
                        >
                          <i className='fas fa-user-plus me-2' aria-hidden />
                          Créer un compte
                        </Button>
                      )}
                      <Button
                        color='primary'
                        outline
                        className='rs-profile-btn'
                        onClick={() => navigate('/usersProfileListe')}
                      >
                        <i className='fas fa-users me-2' aria-hidden />
                        Liste des utilisateurs
                      </Button>
                      <Button
                        color='primary'
                        outline
                        className='rs-profile-btn'
                        onClick={() => navigate('/updatePassword')}
                      >
                        <i className='fas fa-key me-2' aria-hidden />
                        Changer le mot de passe
                      </Button>
                      <Button
                        color='danger'
                        outline
                        className='rs-profile-btn rs-profile-btn--logout'
                        onClick={() => logout()}
                      >
                        <i
                          className='fas fa-sign-out-alt me-2'
                          aria-hidden
                        />
                        Se déconnecter
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(UserProfile);
