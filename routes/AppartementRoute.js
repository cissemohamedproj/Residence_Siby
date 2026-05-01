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

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): appartements filtrés par secteur
// ------------------------------------------------------------
router.get('/bySecteur/:id', appartement.getAppartementsBySecteur);

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): appartements paginés + recherche
// ------------------------------------------------------------
router.get('/bySecteur/:id/paged', appartement.getAppartementsBySecteurPaged);

// ------------------------------------------------------------
// OPTIMISATION (/home): stats légères (totaux) par secteur
// ------------------------------------------------------------
// Objectif: permettre au front d'afficher des compteurs sans
// télécharger toute la collection Appartements.
router.get('/statsBySecteur', appartement.getAppartementStatsBySecteur);

// ------------------------------------------------------------
// OPTIMISATION (dashboard): total appartements (count only)
// ------------------------------------------------------------
router.get('/count', appartement.getAppartementCount);

// ------------------------------------------------------------
// OPTIMISATION (appartements liste): pagination + recherche (server-side)
// ------------------------------------------------------------
router.get('/paged', appartement.getAppartementsPaged);



// Afficher une seule Appartement
router.get('/getAppartement/:id', appartement.getOneAppartement);

// Mettre à jour une Appartement
router.put('/updateAppartement/:id', appartement.updateAppartement);

// supprimer un Appartement
router.delete('/deleteAppartement/:id', appartement.deleteAppartement);

// Supprimer toutes les Appartement
router.delete('/deleteAllAppartement', appartement.deleteAllAppartement);

module.exports = router;       