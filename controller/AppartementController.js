const Appartement = require('../models/AppartementModel');
const Contrat = require('../models/ContratModel');


// Enregistrer un Produit
exports.createAppartement = async (req, res) => {
  try {
    const { appartementNumber, name, description } = req.body;

    const lowerName = name.toLowerCase();
    const lowerDescription = description.toLowerCase();
    

    const selectedSecteur = req.body.secteur
 
    const existingAppartements = await Appartement.findOne({
      appartementNumber,
      secteur: selectedSecteur,
    }).exec();

    if (existingAppartements) {
      return res.status(400).json({
        status: 'error',
        message: `Appartement ${appartementNumber} existe déjà.`,
      });
    }

    // Création de la matière
    const appartement = await Appartement.create({
      name: lowerName,
      description: lowerDescription,
      user: req.user.id,
      ...req.body,
    });

    return res.status(201).json(appartement);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// Mettre à jour une Appartement
exports.updateAppartement = async (req, res) => {
  try {
    const { appartementNumber, name, description } = req.body;

    const lowerName = name.toLowerCase();
    const lowerDescription = description.toLowerCase();
    
const selectedSecteur = req.body.secteur
 
    const existingAppartements = await Appartement.findOne({
      appartementNumber,
      secteur: selectedSecteur,
      _id: { $ne: req.params.id },
    }).exec();

    if (existingAppartements) {
      return res.status(400).json({

        status: 'error',
        message: `Appartement ${appartementNumber} existe déjà.`,
      });
    }

    // Mise à jour de Appartement
    const updated = await Appartement.findByIdAndUpdate(
      req.params.id,
      {
        name: lowerName,
        description: lowerDescription,
        ...req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json(updated);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

//  Afficher les Appartement avec une stock minimum de (1)
exports.getAllAppartements = async (req, res) => {
  try {
    const appartements = await Appartement.find()
      .populate('secteur')
      .populate('user')
      .sort({ appartementNumber: 1 });

  
    return res.status(200).json(appartements);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (/home): statistiques légères par secteur
// ------------------------------------------------------------
// Objectif: éviter de charger tous les appartements côté front
// pour uniquement calculer des totaux (Total / Libres) par secteur.
//
// NB: aucun changement de schéma, on calcule via aggregation.
exports.getAppartementStatsBySecteur = async (req, res) => {
  try {
    const stats = await Appartement.aggregate([
      {
        $group: {
          _id: '$secteur',
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ['$isAvailable', true] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          secteur: '$_id',
          total: 1,
          available: 1,
        },
      },
    ]);

    return res.status(200).json(stats);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};


//  Afficher une seule Appartement
exports.getOneAppartement = async (req, res) => {
  try {
    const appartements = await Appartement.findById(req.params.id)
    .populate('secteur')
    .populate('user');
    return res.status(200).json(appartements);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer un Produit
exports.deleteAppartement = async (req, res) => {
  try {
    await Appartement.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ status: 'success', message: 'Appartement supprimée avec succès' });
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer toute les Appartement
exports.deleteAllAppartement = async (req, res) => {
  try {
    await Appartement.deleteMany({}); // Supprime tous les documents

    return res.status(200).json({
      status: 'success',
      message: 'Toute les Appartement ont été supprimés avec succès',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression de toute les Appartement',
      error: e.message,
    });
  }
};
