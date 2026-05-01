const Depense = require('../models/DepenseModel');
const textValidation = require('./regexValidation');

// Create a new expense
exports.createDepense = async (req, res) => {
  try {
    const {  motifDepense } = req.body;

    const formattedMotifDepense = motifDepense.toLowerCase();
  

    const depense = await Depense.create({
      motifDepense: formattedMotifDepense,
      user: req.user.id,
      ...req.body,
    });

    return res.status(201).json(depense);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update an expense
exports.updateDepense = async (req, res) => {
  try {
    const { id } = req.params;
    const { motifDepense } = req.body;
    // Format and validate the input
    const formattedMotifDepense = motifDepense.toLowerCase();


    // Find the expense by ID and update it
    const depense = await Depense.findByIdAndUpdate(
      id,
      {
        motifDepense: formattedMotifDepense,
        ...req.body,
      },
      { new: true }
    );

    if (!depense) {
      return res.status(404).json({ message: 'Dépense non trouvée.' });
    }

    return res.status(200).json(depense);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all expenses
exports.getAllDepenses = async (req, res) => {
  try {
    const depenses = await Depense.find()
      .populate('secteur')
      .populate('user')
      .populate({
        path: 'rental',
        populate: { path: 'appartement' },
      })
      .sort({ dateOfDepense: -1 });
    return res.status(200).json(depenses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (depenses): pagination + recherche (server-side)
// ------------------------------------------------------------
// Objectif:
// - éviter getAllDepense (RAM) sur la page "Dépense"
// - supporter recherche + pagination sans rechargement
// - supporter filtre "Depense d'Aujourd'hui" (today=1)
//
// Réponse:
// { items, total, page, limit, totalPages, sumTotalAmount }
exports.getDepensesPaged = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 200);
    const searchRaw = String(req.query.search || '').trim();
    const today = String(req.query.today || '0') === '1';

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
      {
        $addFields: {
          dateStr: {
            $dateToString: { format: '%d/%m/%Y', date: '$dateOfDepense' },
          },
        },
      },
    ];

    if (today) {
      pipeline.push({
        $match: {
          $expr: {
            $eq: [
              { $dateToString: { format: '%Y-%m-%d', date: '$dateOfDepense' } },
              { $dateToString: { format: '%Y-%m-%d', date: new Date() } },
            ],
          },
        },
      });
    }

    if (searchRaw) {
      pipeline.push({
        $match: {
          $or: [
            { motifDepense: { $regex: searchRaw, $options: 'i' } },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: '$totalAmount' },
                  regex: searchRaw,
                  options: 'i',
                },
              },
            },
            { dateStr: { $regex: searchRaw, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { dateOfDepense: -1 } },
      { $addFields: { secteur: '$secteurDoc' } },
      { $unset: ['secteurDoc', 'dateStr'] },
      {
        $facet: {
          meta: [{ $count: 'total' }],
          sum: [{ $group: { _id: null, sumTotalAmount: { $sum: '$totalAmount' } } }],
          items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      }
    );

    const result = await Depense.aggregate(pipeline);
    const total = result?.[0]?.meta?.[0]?.total || 0;
    const items = result?.[0]?.items || [];
    const sumTotalAmount = result?.[0]?.sum?.[0]?.sumTotalAmount || 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.status(200).json({ items, total, page, limit, totalPages, sumTotalAmount });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get a single expense by ID
exports.getDepenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const depense = await Depense.findById(id)
      .populate('secteur')
      .populate('user')
      .populate({
        path: 'rental',
        populate: { path: 'appartement' },
      });

    if (!depense) {
      return res.status(404).json({ message: 'Dépense non trouvée.' });
    }

    return res.status(200).json(depense);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete an expense
exports.deleteDepense = async (req, res) => {
  try {
    const { id } = req.params;
    const depense = await Depense.findByIdAndDelete(id);

    if (!depense) {
      return res.status(404).json({ message: 'Dépense non trouvée.' });
    }

    return res.status(200).json({ message: 'Dépense supprimée avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
