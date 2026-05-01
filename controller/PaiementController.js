const Paiement = require('../models/PaiementModel');
const Comission = require('../models/ComissionModel');
const Appartement = require('../models/AppartementModel');
const Contrat = require('../models/ContratModel');
const Rental = require('../models/RentalModel');

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

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): paiements filtrés par secteur
// ------------------------------------------------------------
// Objectif: éviter "getAllPaiements" + filtre côté front sur SelectedSecteur.
// NB: on garde la même forme de données (populate identiques), on filtre seulement.
exports.getPaiementsBySecteur = async (req, res) => {
  try {
    const secteurId = req.params.id;

    // 1) Appartements du secteur
    const appartements = await Appartement.find({ secteur: secteurId })
      .select('_id')
      .exec();
    const appartementIds = appartements.map((a) => a._id);

    // 2) Contrats du secteur
    const contrats = await Contrat.find({ appartement: { $in: appartementIds } })
      .select('_id')
      .exec();
    const contratIds = contrats.map((c) => c._id);

    // 3) Rentals du secteur (pour ne pas perdre les paiements de réservations)
    const rentals = await Rental.find({ appartement: { $in: appartementIds } })
      .select('_id')
      .exec();
    const rentalIds = rentals.map((r) => r._id);

    const paiements = await Paiement.find({
      $or: [{ contrat: { $in: contratIds } }, { rental: { $in: rentalIds } }],
    })
      .populate({
        path: 'contrat',
        populate: [
          { path: 'client' },
          { path: 'appartement', populate: { path: 'secteur' } },
        ],
      })
      .populate({
        path: 'rental',
        populate: [
          { path: 'appartement', populate: { path: 'secteur' } },
          { path: 'client' },
        ],
      })
      .populate('user')
      .sort({ paiementDate: -1 });

    return res.status(200).json(paiements);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (paiements): pagination + recherche (server-side)
// ------------------------------------------------------------
// Objectif: éviter getAllPaiements sur la page "Paiements" et supporter la recherche.
// Réponse:
// { items, total, page, limit, totalPages, sumTotalPaye }
exports.getPaiementsPaged = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const searchRaw = String(req.query.search || '').trim();

    const pipeline = [
      // Join contrat
      {
        $lookup: {
          from: 'contrats',
          localField: 'contrat',
          foreignField: '_id',
          as: 'contratDoc',
        },
      },
      { $unwind: { path: '$contratDoc', preserveNullAndEmptyArrays: true } },
      // Join rental
      {
        $lookup: {
          from: 'rentals',
          localField: 'rental',
          foreignField: '_id',
          as: 'rentalDoc',
        },
      },
      { $unwind: { path: '$rentalDoc', preserveNullAndEmptyArrays: true } },
      // Join client (contrat)
      {
        $lookup: {
          from: 'clients',
          localField: 'contratDoc.client',
          foreignField: '_id',
          as: 'contratClientDoc',
        },
      },
      { $unwind: { path: '$contratClientDoc', preserveNullAndEmptyArrays: true } },
      // Join client (rental)
      {
        $lookup: {
          from: 'clients',
          localField: 'rentalDoc.client',
          foreignField: '_id',
          as: 'rentalClientDoc',
        },
      },
      { $unwind: { path: '$rentalClientDoc', preserveNullAndEmptyArrays: true } },
      // Join appartement (contrat)
      {
        $lookup: {
          from: 'appartements',
          localField: 'contratDoc.appartement',
          foreignField: '_id',
          as: 'contratAppartementDoc',
        },
      },
      { $unwind: { path: '$contratAppartementDoc', preserveNullAndEmptyArrays: true } },
      // Join appartement (rental)
      {
        $lookup: {
          from: 'appartements',
          localField: 'rentalDoc.appartement',
          foreignField: '_id',
          as: 'rentalAppartementDoc',
        },
      },
      { $unwind: { path: '$rentalAppartementDoc', preserveNullAndEmptyArrays: true } },
      // Join secteur (contrat)
      {
        $lookup: {
          from: 'secteurs',
          localField: 'contratAppartementDoc.secteur',
          foreignField: '_id',
          as: 'contratSecteurDoc',
        },
      },
      { $unwind: { path: '$contratSecteurDoc', preserveNullAndEmptyArrays: true } },
      // Join secteur (rental)
      {
        $lookup: {
          from: 'secteurs',
          localField: 'rentalAppartementDoc.secteur',
          foreignField: '_id',
          as: 'rentalSecteurDoc',
        },
      },
      { $unwind: { path: '$rentalSecteurDoc', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          paiementDateStr: {
            $dateToString: { format: '%d/%m/%Y', date: '$paiementDate' },
          },
          // Client affiché (contrat prioritaire, sinon rental)
          clientForSearch: { $ifNull: ['$contratClientDoc', '$rentalClientDoc'] },
        },
      },
    ];

    if (searchRaw) {
      pipeline.push({
        $match: {
          $or: [
            { paiementDateStr: { $regex: searchRaw, $options: 'i' } },
            { 'clientForSearch.firstName': { $regex: searchRaw, $options: 'i' } },
            { 'clientForSearch.lastName': { $regex: searchRaw, $options: 'i' } },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: '$clientForSearch.phoneNumber' },
                  regex: searchRaw,
                  options: 'i',
                },
              },
            },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: '$totalPaye' },
                  regex: searchRaw,
                  options: 'i',
                },
              },
            },
            // Recherche secteur (contrat ou rental)
            { 'contratSecteurDoc.adresse': { $regex: searchRaw, $options: 'i' } },
            { 'rentalSecteurDoc.adresse': { $regex: searchRaw, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { paiementDate: -1 } },
      // Reconstruction d'une forme proche de l'ancien populate:
      // - paiement.contrat.client / paiement.contrat.appartement.secteur
      // - paiement.rental.client / paiement.rental.appartement.secteur
      {
        $addFields: {
          contrat: {
            $cond: [
              { $ne: ['$contratDoc', null] },
              {
                $mergeObjects: [
                  '$contratDoc',
                  {
                    client: '$contratClientDoc',
                    appartement: {
                      $mergeObjects: [
                        '$contratAppartementDoc',
                        { secteur: '$contratSecteurDoc' },
                      ],
                    },
                  },
                ],
              },
              null,
            ],
          },
          rental: {
            $cond: [
              { $ne: ['$rentalDoc', null] },
              {
                $mergeObjects: [
                  '$rentalDoc',
                  {
                    client: '$rentalClientDoc',
                    appartement: {
                      $mergeObjects: [
                        '$rentalAppartementDoc',
                        { secteur: '$rentalSecteurDoc' },
                      ],
                    },
                  },
                ],
              },
              null,
            ],
          },
        },
      },
      {
        $unset: [
          'contratDoc',
          'rentalDoc',
          'contratClientDoc',
          'rentalClientDoc',
          'contratAppartementDoc',
          'rentalAppartementDoc',
          'contratSecteurDoc',
          'rentalSecteurDoc',
          'paiementDateStr',
          'clientForSearch',
        ],
      },
      {
        $facet: {
          meta: [{ $count: 'total' }],
          sum: [{ $group: { _id: null, sumTotalPaye: { $sum: '$totalPaye' } } }],
          items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      }
    );

    const result = await Paiement.aggregate(pipeline);
    const total = result?.[0]?.meta?.[0]?.total || 0;
    const items = result?.[0]?.items || [];
    const sumTotalPaye = result?.[0]?.sum?.[0]?.sumTotalPaye || 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.status(200).json({ items, total, page, limit, totalPages, sumTotalPaye });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (paiements): résumé global (totaux) pour l'écran
// ------------------------------------------------------------
// Objectif: garder les mêmes totaux que la page actuelle sans charger
// tous les contrats/rentals/paiements côté front.
exports.getPaiementsSummary = async (req, res) => {
  try {
    const [contratAgg] = await Contrat.aggregate([
      { $group: { _id: null, sumTotalAmount: { $sum: '$totalAmount' } } },
    ]);
    const [rentalAgg] = await Rental.aggregate([
      { $group: { _id: null, sumTotalAmount: { $sum: '$totalAmount' } } },
    ]);
    const [paiementAgg] = await Paiement.aggregate([
      { $group: { _id: null, sumTotalPaye: { $sum: '$totalPaye' } } },
    ]);

    const sumTotalContratAmount = contratAgg?.sumTotalAmount || 0;
    const sumTotalRentalAmount = rentalAgg?.sumTotalAmount || 0;
    const sumTotalPaye = paiementAgg?.sumTotalPaye || 0;
    const sumTotalAmount = sumTotalContratAmount + sumTotalRentalAmount;
    const sumTotalReliqua = sumTotalAmount - sumTotalPaye;

    return res.status(200).json({
      sumTotalContratAmount,
      sumTotalRentalAmount,
      sumTotalAmount,
      sumTotalPaye,
      sumTotalReliqua,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ status: 'error', message: err.message });
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
