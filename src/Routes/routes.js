import React from 'react';
import { Navigate } from 'react-router-dom';

//Dashboard
import Dashboard from '../Pages/Dashboard';

// Import Authentication pages
import Login from '../Pages/Authentication/Login';
import Register from '../Pages/Authentication/Register';
import UserProfile from '../Pages/Authentication/user-profile';

// Importing other pages
import PaiementsListe from '../Pages/Paiements/PaiementsListe.js';
import DepenseListe from '../Pages/Depenses/DepenseListe.js';
import UpdatePassword from '../Pages/Authentication/UpdatePassword.js';

import UsersProfilesListe from '../Pages/Authentication/UsersProfilesListe.js';
import ProfileDetail from '../Pages/Authentication/ProfileDetail.js';
import Secteur from '../Pages/Secteurs/Secteur.js';
import ClientListe from '../Pages/Client/ClientsListe.js';
import ContratListe from '../Pages/Contrat/ContratListe.js';
import ClientContratListe from '../Pages/Client/ClientContratListe.js';
import PaiementsContrat from '../Pages/Contrat/PaiementsContrat.js';
import ContractDocument from '../Pages/Contrat/ContratDocument.js';
import SelectedSecteur from '../Pages/Secteurs/SelectedSecteur.js';
import AllAppartements from '../Pages/Appartements/AllAppartements.js';
import InitialPage from '../Pages/InitialPage/InitialPage.js';
import ReservationListe from '../Pages/Reservation/ReservationListe.js';
import Bilans from '../Pages/Bilans/Bilans.js';
import RapportsStatistiques from '../Pages/Rapports/RapportsStatistiques.js';
import ComissionListe from '../Pages/Comission/ComissionListe.js';

// Routes pour les ADMINS
const authProtectedRoutes = [
  //dashboard
  { path: '/dashboard', component: <Dashboard /> },

  {
    path: '/',
    exact: true,
    component: <Navigate to='/home' />,
  },

  // Profile
  { path: '/userprofile', component: <UserProfile /> },

  // Details du Profile
  { path: '/userProfileDetails/:id', component: <ProfileDetail /> },

  // Modifier un Profile
  { path: '/updateUser/:id', component: <UserProfile /> },

  // Changer le mot de passe
  { path: '/updatePassword', component: <UpdatePassword /> },

  // Liste des Utilisateurs
  { path: '/usersProfileListe', component: <UsersProfilesListe /> },

  { path: '/comissionListe', component: <ComissionListe /> },

  // Raports & Bilans
  { path: '/bilans', component: <Bilans /> },
  { path: '/rapports', component: <RapportsStatistiques /> },

  // --------------------------------------------------------
];

// Routes pour les Médecins
// const usersRoutes = [
//   {
//     path: '/',
//     exact: true,
//     component: <Navigate to='/dashboard-user' />,
//   },
//dashboard
//   { path: '/dashboard-user', component: <Dashboard /> },
// Profile
//   { path: '/userprofile', component: <UserProfile /> },
// ];

const noSideBarRoutes = [
  { path: '/home', component: <Secteur /> },
  { path: '/secteur/:id', component: <SelectedSecteur /> },
  { path: '/appartements', component: <AllAppartements /> },

  { path: '/clients', component: <ClientListe /> },

  { path: '/client/:id', component: <ClientContratListe /> },

  { path: '/contrats', component: <ContratListe /> },

  { path: '/reservations', component: <ReservationListe /> },

  { path: '/contrat/:id', component: <PaiementsContrat /> },

  { path: '/contrat/document/:id', component: <ContractDocument /> },

  { path: '/paiements', component: <PaiementsListe /> },

  { path: '/depenses', component: <DepenseListe /> },

  { path: '/register', component: <Register /> },
  { path: '/initial_page', component: <InitialPage /> },
];

const publicRoutes = [
  // { path: '/unauthorized', component: <Unauthorized /> },

  // Authentication Page
  // { path: '/register', component: <Register /> },
  { path: '/login', component: <Login /> },
];

export { authProtectedRoutes, noSideBarRoutes, publicRoutes };
