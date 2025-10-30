const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');

const comissionController = require('../controller/ComissionController');

// Créer
router.post(
  '/createComission',
  userController.authMiddleware,
  comissionController.createComission
);

// Trouvez tous les Comissions
router.get('/getAllComissions', comissionController.getAllComission);

// Trouvez un Comissions
router.get('/getOneComission/:id', comissionController.getComission);


// Mettre à jour
router.put('/updateComission/:id', comissionController.updateComission);

// Supprimer
router.delete('/deleteComission/:id', comissionController.deleteComission);

module.exports = router;
