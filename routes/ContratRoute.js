const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');

const contratController = require('../controller/ContratController');

// Créer un Contrat
router.post(
  '/createContrat',
  userController.authMiddleware,
  contratController.createContrat
);

// Créer un Contrat
router.post(
  '/reloadContrat',
  userController.authMiddleware,
  contratController.reloadContrat
);

router.post('/stopeContrat',contratController.stopContrat);

// Afficher toutes les Contrats
router.get('/getAllContrats',contratController.refrechContrats ,contratController.getAllContrat);

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): contrats filtrés par secteur
// ------------------------------------------------------------
router.get('/bySecteur/:id', contratController.getContratsBySecteur);

// ------------------------------------------------------------
// OPTIMISATION (dashboard): total contrats (count only)
// ------------------------------------------------------------
router.get('/count', contratController.getContratCount);

// ------------------------------------------------------------
// OPTIMISATION (dashboard): contrats en cours (statut=true)
// ------------------------------------------------------------
router.get('/active', contratController.getActiveContrats);

// Afficher un seul Contrat
router.get('/getContrat/:id', contratController.getContrat);

// Mettre à jour un Contrat
router.put('/updateContrat/:id', contratController.updateContrat);

// supprimer un Contrat
router.delete(
  '/deleteContrat/:id',
  contratController.deleteContrat
);



module.exports = router;
