import React, { useContext, useState } from 'react';
import { Card, Container } from 'reactstrap';
import { useGetAllUsers } from '../../Api/queriesAuth';
import { useNavigate } from 'react-router-dom';
import LoadingSpiner from '../components/LoadingSpiner';
import FormModal from '../components/FormModal';
import UpdateUserProfile from './UpdateUserProfile';
import { BackButton } from '../components/NavigationButton';
import { AuthContext } from '../../Auth/AuthContext';

export default function UsersProfilesListe() {
  document.title = 'Liste des Profiles';
  const { auth } = useContext(AuthContext);
  const connectedUserRole = auth?.user?.role ?? null;
  const {
    data: userProfileData,
    isLoading: loadingProfile,
    isError,
    error,
  } = useGetAllUsers();
  const navigate = useNavigate();
  const [form_modal, setForm_modal] = useState(false);
  const [user, setUser] = useState(null);

  const tog_form_modal = () => {
    setForm_modal(!form_modal);
  };

  return (
    <React.Fragment>
      <FormModal
        form_modal={form_modal}
        tog_form_modal={tog_form_modal}
        setForm_modal={setForm_modal}
        modal_title={'Modifier un Profile'}
        size={'md'}
        bodyContent={
          <UpdateUserProfile
            selectedUser={user}
            tog_form_modal={tog_form_modal}
          />
        }
      />

      <div className='page-content'>
        <Container fluid>
          <h4>Liste des Profiles</h4>
          <BackButton />
          <Card>
            {loadingProfile && (
              <div className='mx-auto'>
                <LoadingSpiner />
              </div>
            )}
            {isError && (
              <div colSpan='5' className='text-center text-danger'>
                Erreur : {error.message}
              </div>
            )}
            {!loadingProfile && !error && userProfileData && (
              <div className='table-responsive table-card rs-table-scroll'>
                <table className='table rs-data-table table-centered table-nowrap mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th
                        scope='col'
                        className='rs-th-num'
                        style={{ width: '20px' }}
                      >
                        Boutique
                      </th>
                      <th scope='col' className='rs-th-text'>
                        Nom
                      </th>
                      <th scope='col' className='rs-th-text'>
                        Email
                      </th>
                      <th scope='col' className='rs-th-nowrap'>
                        Role
                      </th>
                      <th scope='col' className='rs-th-actions'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userProfileData?.length > 0 &&
                      userProfileData.map((user, index) => (
                        <tr key={index}>
                          <th className='rs-td-num' scope='row'>
                            {index + 1}
                          </th>
                          <td className='rs-td-text text-uppercase'>
                            {user.name}
                          </td>
                          <td className='rs-td-text'>{user.email}</td>
                          <td className='rs-td-nowrap'>
                            {user.role === 'admin'
                              ? 'Administrateur'
                              : 'Utilisateur'}
                          </td>
                          {connectedUserRole === 'admin' && (
                            <td className='rs-td-actions'>
                              <button
                                onClick={() =>
                                  navigate(`/userProfileDetails/${user._id}`)
                                }
                                className='btn btn-info btn-sm mx-1'
                              >
                                Détails
                              </button>
                              {user.email !==
                                'cissemohamedbusiness@gmail.com' && (
                                <button
                                  onClick={() => {
                                    setUser(user);
                                    tog_form_modal();
                                  }}
                                  className='btn btn-warning btn-sm mx-1'
                                >
                                  Modifier
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
}
