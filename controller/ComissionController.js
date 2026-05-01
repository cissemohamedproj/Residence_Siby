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

// ------------------------------------------------------------
// OPTIMISATION (commissions): pagination + recherche (server-side)
// ------------------------------------------------------------
// Objectif:
// - éviter getAllComissions (RAM) sur la page "Commission"
// - supporter recherche + pagination sans rechargement
//
// Réponse:
// { items, total, page, limit, totalPages, sumTotalAmount }
exports.getComissionsPaged = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 200);
    const searchRaw = String(req.query.search || '').trim();

    const pipeline = [
      // Join secteur
      {
        $lookup: {
          from: 'secteurs',
          localField: 'secteur',
          foreignField: '_id',
          as: 'secteurDoc',
        },
      },
      { $unwind: { path: '$secteurDoc', preserveNullAndEmptyArrays: true } },
      // Join client
      {
        $lookup: {
          from: 'clients',
          localField: 'client',
          foreignField: '_id',
          as: 'clientDoc',
        },
      },
      { $unwind: { path: '$clientDoc', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          paiementDateStr: {
            $dateToString: { format: '%d/%m/%Y', date: '$paiementDate' },
          },
        },
      },
    ];

    if (searchRaw) {
      pipeline.push({
        $match: {
          $or: [
            { 'secteurDoc.adresse': { $regex: searchRaw, $options: 'i' } },
            { 'clientDoc.firstName': { $regex: searchRaw, $options: 'i' } },
            { 'clientDoc.lastName': { $regex: searchRaw, $options: 'i' } },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: '$clientDoc.phoneNumber' },
                  regex: searchRaw,
                  options: 'i',
                },
              },
            },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: '$amount' },
                  regex: searchRaw,
                  options: 'i',
                },
              },
            },
            { beneficiaire: { $regex: searchRaw, $options: 'i' } },
            { details: { $regex: searchRaw, $options: 'i' } },
            { paiementDateStr: { $regex: searchRaw, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { paiementDate: -1 } },
      // IMPORTANT: éviter $project mixant inclusion/exclusion (MongoDB le refuse).
      { $addFields: { secteur: '$secteurDoc', client: '$clientDoc' } },
      { $unset: ['secteurDoc', 'clientDoc', 'paiementDateStr'] },
      {
        $facet: {
          meta: [{ $count: 'total' }],
          sum: [{ $group: { _id: null, sumTotalAmount: { $sum: '$amount' } } }],
          items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      }
    );

    const result = await Comission.aggregate(pipeline);
    const total = result?.[0]?.meta?.[0]?.total || 0;
    const items = result?.[0]?.items || [];
    const sumTotalAmount = result?.[0]?.sum?.[0]?.sumTotalAmount || 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.status(200).json({ items, total, page, limit, totalPages, sumTotalAmount });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ status: 'error', message: err.message });
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
