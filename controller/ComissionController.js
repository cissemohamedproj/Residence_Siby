const Comission = require('../models/ComissionModel');

// Enregistrer un paiement
exports.createComission = async (req, res) => {
  try {

    // sinon on créer un nouveau PAIEMENT
    const result = await Comission.create(
        { 
            user: req.user.id,
            ...req.body, 
         });

   
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Mettre à jour un paiement
exports.updateComission = async (req, res) => {
  try {
   

    const updated = await Comission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Historique des paiements
exports.getAllComission = async (req, res) => {
  try {
    const result = await Comission.find()
      
      .populate('secteur')
      .populate('client')
      .populate('user')
      .sort({ paiementDate: -1 });

    return res.status(200).json(result);
  } catch (err) {
    console.log(err)
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Trouver un Comission
exports.getComission = async (req, res) => {
  try {
    const results = await Comission.findById(req.params.id)
    
         .populate('secteur')
         .populate('client')
         .populate('user');
    

    return res.status(200).json(results);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};


// Supprimer un paiement
exports.deleteComission = async (req, res) => {
  try {
 
    // après on supprime le PAIEMENT
    await Comission.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ status: 'success', message: 'Comission supprimé avec succès' });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
