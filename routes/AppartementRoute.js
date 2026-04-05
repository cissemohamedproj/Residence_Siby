const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');
const contratController = require('../controller/ContratController');
const appartement = require('../controller/AppartementController');

// Créer un Produit
router.post(
  '/addAppartement',
  userController.authMiddleware,
  appartement.createAppartement
);

// Afficher une toutes les Appartement
router.get('/getAllAppartements',contratController.refrechContrats ,appartement.getAllAppartements);



// Afficher une seule Appartement
router.get('/getAppartement/:id', appartement.getOneAppartement);

// Mettre à jour une Appartement
router.put('/updateAppartement/:id', appartement.updateAppartement);

// supprimer un Appartement
router.delete('/deleteAppartement/:id', appartement.deleteAppartement);

// Supprimer toutes les Appartement
router.delete('/deleteAllAppartement', appartement.deleteAllAppartement);

module.exports = router;       