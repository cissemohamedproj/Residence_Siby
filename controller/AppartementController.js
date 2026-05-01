const Appartement = require('../models/AppartementModel');
const Contrat = require('../models/ContratModel');
const mongoose = require('mongoose');


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

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): lister uniquement les appartements du secteur
// ------------------------------------------------------------
// Objectif: éviter "getAllAppartements" + filtre côté front sur SelectedSecteur.
// NB: aucun changement de schéma, on ne change pas la logique métier: on renvoie
// simplement le même type de documents, mais filtrés par secteur.
exports.getAppartementsBySecteur = async (req, res) => {
  try {
    const secteurId = req.params.id;

    const appartements = await Appartement.find({ secteur: secteurId })
      .populate('secteur')
      .populate('user')
      .sort({ appartementNumber: 1 });

    return res.status(200).json(appartements);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (secteur/:id): appartements paginés + recherche (server-side)
// ------------------------------------------------------------
// Objectif: pagination + recherche sur le tableau "Appartements" de secteur/:id
// sans charger toute la liste.
// Réponse: { items, total, page, limit, totalPages }
exports.getAppartementsBySecteurPaged = async (req, res) => {
  try {
    const secteurId = req.params.id;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 200);
    const searchRaw = String(req.query.search || '').trim();

    // IMPORTANT: `secteur` est un ObjectId en base, donc on match avec ObjectId
    const match = { secteur: new mongoose.Types.ObjectId(secteurId) };

    // Recherche proche de l'UI (nom/numéro). L'adresse secteur est identique dans ce contexte.
    const pipeline = [{ $match: match }];

    if (searchRaw) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: searchRaw, $options: 'i' } },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: '$appartementNumber' },
                  regex: searchRaw,
                  options: 'i',
                },
              },
            },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { appartementNumber: 1 } },
      // Pour conserver la logique d'affichage, on renvoie `secteur` peuplé.
      {
        $lookup: {
          from: 'secteurs',
          localField: 'secteur',
          foreignField: '_id',
          as: 'secteurDoc',
        },
      },
      { $unwind: { path: '$secteurDoc', preserveNullAndEmptyArrays: true } },
      { $addFields: { secteur: '$secteurDoc' } },
      { $unset: 'secteurDoc' },
      {
        $facet: {
          meta: [{ $count: 'total' }],
          items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      }
    );

    const result = await Appartement.aggregate(pipeline);
    const total = result?.[0]?.meta?.[0]?.total || 0;
    const items = result?.[0]?.items || [];
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.status(200).json({ items, total, page, limit, totalPages });
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (dashboard): total appartements (count only)
// ------------------------------------------------------------
// Objectif: éviter de charger tous les appartements juste pour afficher un total.
exports.getAppartementCount = async (req, res) => {
  try {
    const total = await Appartement.countDocuments({});
    return res.status(200).json({ total });
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (appartements liste): pagination + recherche (server-side)
// ------------------------------------------------------------
// Objectif: éviter getAllAppartements sur la page "Appartements".
// Recherche: nom / numéro / adresse secteur (comme le front).
exports.getAppartementsPaged = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 200);
    const searchRaw = String(req.query.search || '').trim();

    // On utilise aggregation car la recherche inclut secteur.adresse (référence).
    const pipeline = [
      {
        $lookup: {
          from: 'secteurs',
          localField: 'secteur',
          foreignField: '_id',
          as: 'secteurDoc',
        },
      },
      { $unwind: { path: '$secteurDoc', preserveNullAndEmptyArrays: true } },
    ];

    if (searchRaw) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: searchRaw, $options: 'i' } },
            // numéro: on compare aussi en string
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: '$appartementNumber' },
                  regex: searchRaw,
                  options: 'i',
                },
              },
            },
            { 'secteurDoc.adresse': { $regex: searchRaw, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { appartementNumber: 1 } },
      // OPTIMISATION: on reconstruit une forme proche de populate('secteur')
      // IMPORTANT: éviter $project mixant inclusion/exclusion (MongoDB le refuse).
      { $addFields: { secteur: '$secteurDoc' } },
      { $unset: 'secteurDoc' },
      {
        $facet: {
          meta: [{ $count: 'total' }],
          items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      }
    );

    const result = await Appartement.aggregate(pipeline);
    const total = result?.[0]?.meta?.[0]?.total || 0;
    const items = result?.[0]?.items || [];
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.status(200).json({ items, total, page, limit, totalPages });
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
