const SidebarData = [
  {
    label: 'Menu',
    isMainMenu: true,
  },
  {
    label: 'Accueil',
    icon: 'fas fa-home',
    isHasArrow: true,
    url: '/home',
  },
  {
    label: 'Tableau De Bord',
    icon: 'mdi mdi-home-variant-outline',
    isHasArrow: true,
    url: '/dashboard',
  },
  {
    label: 'Clients',
    icon: 'fas fa-users',
    isHasArrow: true,
    url: '/clients',
  },
  {
    label: 'Contrats',
    icon: 'fas fa-receipt',
    isHasArrow: true,
    url: '/contrats',
  },
  {
    label: 'Appartements',
    icon: 'mdi mdi-home-circle',
    isHasArrow: true,
    url: '/appartements',
  },

  // --------------------------------------

  // Transactions / Comptabilité
  {
    label: 'Caisse & Comptabilité',
    isMainMenu: true,
  },
  {
    label: 'Comission',
    icon: 'fas fa-dollar-sign',
    isHasArrow: true,
    url: '/comissionListe',
  },
  {
    label: 'Paiements',
    icon: 'fas fa-dollar-sign',
    isHasArrow: true,
    url: '/paiements',
  },
  {
    label: 'Depenses',
    icon: ' ri-exchange-dollar-line',
    isHasArrow: true,
    url: '/depenses',
  },

  {
    label: 'Rapports & Bilans',
    isMainMenu: true,
  },
  {
    label: 'Bilans',
    icon: 'fas fa-balance-scale',
    isHasArrow: true,
    url: '/bilans',
  },
  {
    label: 'Rapports et Suivie',
    icon: 'fas fa-chart-bar',
    isHasArrow: true,
    url: '/rapports',
  },

  // --------------------------------------
];
export default SidebarData;
