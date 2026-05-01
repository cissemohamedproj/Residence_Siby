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
