const mongoose = require('mongoose');
const Secteur = require('../models/SecteurModel');
const Contrat = require('../models/ContratModel');
const Appartement = require('../models/AppartementModel');
const Paiement = require('../models/PaiementModel')
const textValidation = require('./regexValidation');

// Créer un Fournisseur
exports.createSecteur = async (req, res) => {
  try {
    const {secteurNumber} = req.body;

    // Vérification des champs uniques
    const existingSecteur = await Secteur.findOne({
      secteurNumber
    }).exec();

    if ( existingSecteur) {
      
      return res.status(409).json({
        status: 'error',
        message: (`Le Secteur ${secteurNumber} existe déjà`),
      });
    }

    // Crée un nouveau 
    const newSecteur = await Secteur.create({
      
      user: req.user.id,
      ...req.body,
    });
    return res.status(201).json(newSecteur);
  } catch (e) {
    return res.status(409).json({
      message: e.message,
    });
    // }
  }
};

// Mettre à jour un Secteur
exports.updateSecteur = async (req, res) => {
  try {
    const {
     
      secteurNumber
    } = req.body;
   
    // Vérification des doublons (en excluant l'Secteur actuel)
    const existingSecteur = await Secteur.findOne({
      _id: { $ne: req.params.id }, // Exclure l'Secteur actuel
secteurNumber,    }).exec();

    if (existingSecteur) {
    

      return res.status(409).json({
        message: `Le Secteur: ${existingSecteur.secteurNumber} existe déjà`,
      });
    }

    
    //  Si il n y a pas d'erreur on met ajour
    const updated = await Secteur.findByIdAndUpdate(
      req.params.id,
      {
       
        ...req.body,
      },
      {
        new: true,
        runValidators: true,
        context: 'query',
      }
    );
    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Secteur non trouvé',
      });
    }
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Obtenir tous les Secteurs
exports.getAllSecteurs = async (req, res) => {
  try {
    const secteurs = await Secteur.find()
      .populate('user')
      .sort({ secteurNumber: 1 });

    
    return res.status(200).json(secteurs);
  } catch (e) {
    return res.status(404).json({ e });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (dashboard): total secteurs (count only)
// ------------------------------------------------------------
// Objectif: éviter de charger tous les secteurs juste pour afficher un total.
// NB: aucune modification de schéma / logique métier.
exports.getSecteurCount = async (req, res) => {
  try {
    const total = await Secteur.countDocuments({});
    return res.status(200).json({ total });
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};

// Récupérer un Secteur par ID
exports.getSecteur = async (req, res) => {
  try {
    const secteur = await Secteur.findById(req.params.id)
    .populate(
      'user'
    );
    if (!secteur)
      return res
        .status(404)
        .json({ status: 'error', message: 'Secteur non trouvé' });



    res.status(200).json(secteur);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer un Secteur
exports.deleteSecteur = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction();
  try {

    const secteurID = req.params.id
    // On met à jours la disponibilité de tous les APPARTEMENTS  lié aux CONTRAT
const apparts = await Appartement.find({secteur:secteurID }).session(session);

if(!apparts){
  session.abortTransaction();
  session.endSession()
  return res.status(400).json({message: "Aucun n'Appartement disponible dans ce Secteur"})
}


for (const app of apparts){
 
    // Avant de Supprimer le CLIENT on vérrifie si il n'y pas des CONTRATS lié à ce CLIENT
    const contrats = await Contrat.find({appartement: app._id}).session(session);

    if(contrats){    
      // SI il y'a des CONTRAT alors on Supprime tous les CONTRAT liés
    for(const cont of contrats){

      // On Vérifie dans la boucle si il n'y a pas des PAIEMENTS liés aux CONTRATS
      const paiements = await Paiement.find({contrat:cont._id}).session(session)
     
      if(paiements){
       
      // Si ce le cas alors on supprimer tous les PAIEMENTS liés
for(const paie of paiements){
  await Paiement.findByIdAndDelete(paie._id,{session})
}
}

// ensuite on supprime le CONTRAT
await Contrat.findByIdAndDelete(cont._id,{session});


  }
    }

await Appartement.findByIdAndDelete(app._id,{session})
}



    await Secteur.findByIdAndDelete(req.params.id,{session});

    
await session.commitTransaction();
session.endSession()

    return res
      .status(200)
      .json({ status: 'success', message: 'Secteur supprimé avec succès' });


  } catch (err) {
    session.abortTransaction();
    session.endSession();
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// ############### DELETE ALL STUDENTS ############################
exports.deleteAllSecteurs = async (req, res) => {
  try {
    await Secteur.deleteMany({}); // Supprime tous les documents

    return res.status(200).json({
      status: 'success',
      message: 'Tous les Secteurs ont été supprimés avec succès',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression des Secteurs',
      error: e.message,
    });
  }
};
