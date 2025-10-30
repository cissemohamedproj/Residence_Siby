const Paiement = require('../models/PaiementModel');
const Comission = require('../models/ComissionModel');

// Enregistrer un paiement
exports.createPaiement = async (req, res) => {
  try {


    // sinon on créer un nouveau PAIEMENT
    const paiement = await Paiement.create(
        { 
            user: req.user.id,
            ...req.body, 
         });

   
    res.status(201).json(paiement);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Mettre à jour un paiement
exports.updatePaiement = async (req, res) => {
  try {
   

    const updated = await Paiement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Historique des paiements
exports.getAllPaiements = async (req, res) => {
  try {
    const paiements = await Paiement.find()
      .populate( {path:'contrat',
      populate: [
        { path: 'client' },
        {
          path: 'appartement',
          populate: { path: 'secteur' }
        }
      ]
    })
    .populate({path:'rental',
      populate:[
        {
          path: 'appartement',
          populate: { path: 'secteur' }
        },
        {path:'client'},
      ]
    })
      .populate('user')
      .sort({ paiementDate: -1 });

    return res.status(200).json(paiements);
  } catch (err) {
    console.log(err)
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Trouver un PAIEMENT
exports.getPaiement = async (req, res) => {
  try {
    const paiements = await Paiement.findById(req.params.id)
    .populate( {path:'contrat',
      populate: [
        { path: 'client' },
        {
          path: 'appartement',
          populate: { path: 'secteur' }
        }
      ]
    })
      .populate({path:'rental',
        populate:[
          {path:'appartement'},
          {path:'client'},
        ]
      })
      .populate('user');
    

    return res.status(200).json(paiements);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};


// Supprimer un paiement
exports.deletePaiement = async (req, res) => {
  try {
    // Trouver le PAIEMENT à supprimer via son ID
   await Paiement.findById(req.params.id);

    // après on supprime le PAIEMENT
    await Paiement.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ status: 'success', message: 'Paiement supprimé avec succès' });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
