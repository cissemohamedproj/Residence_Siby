const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');
const contratController = require('../controller/ContratController');
const secteurController = require('../controller/SecteurController');

// Créer un Produit
router.post(
  '/addSecteur',
  userController.authMiddleware,
  secteurController.createSecteur
);

// Afficher une toutes les Secteur
router.get('/getAllSecteurs', contratController.refrechContrats,secteurController.getAllSecteurs);

// ------------------------------------------------------------
// OPTIMISATION (dashboard): total secteurs (count only)
// ------------------------------------------------------------
router.get('/count', secteurController.getSecteurCount);



// Afficher une seule Secteur
router.get('/getSecteur/:id', secteurController.getSecteur);

// Mettre à jour une Secteur
router.put('/updateSecteur/:id', secteurController.updateSecteur);

// supprimer un Secteur
router.delete('/deleteSecteur/:id', secteurController.deleteSecteur);

// Supprimer toutes les Secteur
router.delete('/deleteAllSecteur', secteurController.deleteAllSecteurs);

module.exports = router;
