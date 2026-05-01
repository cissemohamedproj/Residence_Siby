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

// Trouvez un paiements
router.get('/getOnePaiement/:id', paiementController.getPaiement);


// Mettre à jour
router.put('/updatePaiement/:id', paiementController.updatePaiement);

// Supprimer
router.delete('/deletePaiement/:id', paiementController.deletePaiement);

module.exports = router;
