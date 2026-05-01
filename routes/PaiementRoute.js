const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');

const paiementController = require('../controller/PaiementController');

// Créer
router.post(
  '/createPaiement',
  userController.authMiddleware,
  paiementController.createPaiement
);

// Trouvez tous les paiements
router.get('/getAllPaiements', paiementController.getAllPaiements);

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): paiements filtrés par secteur
// ------------------------------------------------------------
router.get('/bySecteur/:id', paiementController.getPaiementsBySecteur);

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): paiements CONTRAT paginés + recherche
// ------------------------------------------------------------
router.get(
  '/bySecteur/:id/contrats/paged',
  paiementController.getPaiementsContratBySecteurPaged
);

// ------------------------------------------------------------
// OPTIMISATION (paiements): pagination + recherche (server-side)
// ------------------------------------------------------------
router.get('/paged', paiementController.getPaiementsPaged);

// ------------------------------------------------------------
// OPTIMISATION (paiements): résumé global (totaux)
// ------------------------------------------------------------
router.get('/summary', paiementController.getPaiementsSummary);

// Trouvez un paiements
router.get('/getOnePaiement/:id', paiementController.getPaiement);


// Mettre à jour
router.put('/updatePaiement/:id', paiementController.updatePaiement);

// Supprimer
router.delete('/deletePaiement/:id', paiementController.deletePaiement);

module.exports = router;
