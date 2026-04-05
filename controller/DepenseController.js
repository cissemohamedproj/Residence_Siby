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
