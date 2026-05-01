const mongoose = require('mongoose');
const Contrat = require('../models/ContratModel');
const Appartement = require('../models/AppartementModel');
const Paiement = require('../models/PaiementModel');
const Rental = require('../models/RentalModel');
const textValidation = require('./regexValidation');

// Ajouter un Contrat
exports.createContrat = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {

    const startDate = new Date(req.body.startDate)
    const endDate = new Date(req.body.endDate)

    const existAppartement = await Appartement.findById(req.body.appartement).session(session)

 
    if(existAppartement.isAvailable === false){
   await   session.abortTransaction()
      session.endSession()
      return res.status(400).json({message: "Cette Appartement n'est pas disponible"})
    }

     
// ----------------------------------------------
// ---------- RENTAL
// ----------------------------------------------
const existingRental = await Rental.findOne({
  appartement: existAppartement._id,
  $or:[
    {
      rentalDate: { $lte:endDate},
      rentalEndDate: {$gte: startDate},
    }
  ]
}).session(session);


if(existingRental && existingRental.statut === 'en cours'){
  await   session.abortTransaction()
  session.endSession()
  return res.status(400).json({message: `Cette Appartement est reservée du: ${new Date(existingRental.rentalDate).toLocaleDateString('fr-Fr')} au  ${new Date(existingRental.rentalEndDate).toLocaleDateString('fr-Fr')}`})
}

      const newContrat = await Contrat.create(
        [{
      
      user: req.user.id,
      ...req.body,
    }],
    {session},
  );
     // Mettre l'appartement en indisponible
     await Appartement.findByIdAndUpdate(
     existAppartement._id,
      { isAvailable: false },
      { new: true ,session}
    );
 
    await session.commitTransaction()
    session.endSession()
    return res.status(201).json(newContrat);
  } catch (e) {
    console.log(e)
   await session.abortTransaction()
    session.endSession()
    return res.status(409).json({
      status: 'Erreur',
      message: e.message,
    });
    
  }
};

// Mettre à jour un Contrat

exports.updateContrat = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const startDate = new Date(req.body.startDate)
    const endDate = new Date(req.body.endDate)
    


// ----------------------------------------------
// ---------- CONTRAT
// ----------------------------------------------
    const oldContrat = await Contrat.findById(req.params.id).session(session);
    if (!oldContrat) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Contrat non trouvé" });
    }

    
    const isDifferent =req.body.appartement.toString() !== oldContrat.appartement.toString() ;
    
if(isDifferent){
    const existAppartement = await Appartement.findById(req.body.appartement).session(session);

    if (!existAppartement) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Appartement non trouvé" });
    }

    // Vérification si changement d'appartement et que le nouvel appart est indisponible

      if (existAppartement.isAvailable === false) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Cette Appartement n'est pas disponible" });
      }
}

 
// ----------------------------------------------
// ---------- RENTAL
// ---------------------------------------------- 
 

  
const existingRental = await Rental.findOne({
  appartement: req.body.appartement,
  $or:[
    {
      rentalDate: { $lte:endDate},
      rentalEndDate: {$gte: startDate},
    }
  ]
}).session(session);


if(existingRental && existingRental.statut === 'en cours'){
  await   session.abortTransaction()
  session.endSession()
  return res.status(400).json({message: `Cette Appartement est reservée du: ${new Date(existingRental.rentalDate).toLocaleDateString('fr-Fr')} au  ${new Date(existingRental.rentalEndDate).toLocaleDateString('fr-Fr')}`})
}



    // Mise à jour du contrat
    const updatedContrat = await Contrat.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      {
        new: true,
        runValidators: true,
        context: "query",
        session,
      }
    );


    if (req.body.appartement !== oldContrat.appartement.toString()) {
      await Appartement.findByIdAndUpdate(
        oldContrat.appartement,
        { isAvailable: true },
        { session }
      );
    
      await Appartement.findByIdAndUpdate(
        updatedContrat.appartement,
        { isAvailable: false },
        { session }
      );
    } 
    
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(updatedContrat);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    return res.status(400).json({ status: "error", message: err.message });
  }
};




// Renouveller le Contrat
exports.reloadContrat = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    
    const startDate = new Date(req.body.startDate)
    const endDate = new Date(req.body.endDate)
    
    
    const oldContrat = await Contrat.findById(req.body.contrat).session(session);

    if(!oldContrat){
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({message: "Contrat introuvable"})
    }

 
    const appartement = await Appartement.findById(req.body.appartement).session(session)

  
 
    if(appartement && appartement.isAvailable === false){
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({message: "Cette Appartement n'est pas disponible"})
    }



// ----------------------------------------------
// ---------- RENTAL
// ---------------------------------------------- 
 

  
const existingRental = await Rental.findOne({
  appartement: req.body.appartement,
  $or:[
    {
      rentalDate: { $lte:endDate},
      rentalEndDate: {$gte: startDate},
    }
  ]
}).session(session);


if(existingRental && existingRental.statut === 'en cours'){
  await   session.abortTransaction()
  session.endSession()
  return res.status(400).json({message: `Cette Appartement est reservée du: ${new Date(existingRental.rentalDate).toLocaleDateString('fr-Fr')} au  ${new Date(existingRental.rentalEndDate).toLocaleDateString('fr-Fr')}`})
}


  
      const newContrat = await Contrat.create(
        [
          {
      statut: true,
      user: req.user.id,
      ...req.body,
    }
  ],
    {session},
  );
     // Mettre l'appartement en indisponible
    await Appartement.findByIdAndUpdate(
      req.body.appartement,
      { isAvailable: false },
      { new: true,session }
    );
 
    await session.commitTransaction()
    session.endSession()
    return res.status(201).json(newContrat);
  } catch (e) {
    console.log(e)
    await session.abortTransaction()
    session.endSession()
    return res.status(409).json({
      status: 'Erreur',
      message: e.message,
    });
    
  }
};



// Stoper Le Contrat
exports.stopContrat = async (req, res)=>{
  const session = await mongoose.startSession()
  session.startTransaction()
  try{
    if (!req.body._id) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: "ID du contrat manquant" });
    }
    const selectedContrat = await Contrat.findById(req.body._id).session(session)

    if(!selectedContrat){
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({message: "Contrat Introuvable"})
    }

    const apparts = await Appartement.findOne({_id:selectedContrat?.appartement}).session(session)

    
    if(!apparts){
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({message: "Appartement Introuvable"})
    }

    await Appartement.findByIdAndUpdate(apparts?._id,{isAvailable: true},{session})


    await Contrat.findByIdAndUpdate(selectedContrat?._id,{endDate: new Date(), statut: false},{session});

    await session.commitTransaction()
    session.endSession()

    return res.status(200).json({ message: "Contrat stoppé avec succès" });

  }catch(error){
    console.log(error)
    await session.abortTransaction()
    session.endSession()
    return res.status(500).json({message: error})
  }
}


// Obtenir tous les Contrat
exports.getAllContrat = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const contrat = await Contrat.find()
    .populate('client')
      .populate('appartement')
      .populate({path:'appartement', populate:'secteur'})
      .populate('user')
      .sort({ startDate: -1, statut:-1 })
      .session(session);

      await session.commitTransaction()
      session.endSession()
    return res.status(200).json(contrat);
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    return res.status(404).json({ message: error });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): contrats filtrés par secteur
// ------------------------------------------------------------
// Objectif: éviter "getAllContrats" + filtre côté front sur SelectedSecteur.
// Stratégie (sans modifier les schémas):
// - trouver les appartements du secteur
// - récupérer les contrats liés à ces appartements
exports.getContratsBySecteur = async (req, res) => {
  try {
    const secteurId = req.params.id;

    const appartements = await Appartement.find({ secteur: secteurId })
      .select('_id')
      .exec();
    const appartementIds = appartements.map((a) => a._id);

    const contrats = await Contrat.find({ appartement: { $in: appartementIds } })
      .populate('client')
      .populate('appartement')
      .populate({ path: 'appartement', populate: 'secteur' })
      .populate('user')
      .sort({ startDate: -1, statut: -1 });

    return res.status(200).json(contrats);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (dashboard): total contrats (count only)
// ------------------------------------------------------------
// Objectif: éviter de charger tous les contrats juste pour afficher un total.
exports.getContratCount = async (req, res) => {
  try {
    const total = await Contrat.countDocuments({});
    return res.status(200).json({ total });
  } catch (error) {
    return res.status(404).json({ message: error });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (dashboard): contrats actifs (statut=true)
// ------------------------------------------------------------
// Objectif: le dashboard affiche "Contrats en cours".
// On évite de charger tous les contrats puis filtrer côté front.
// NB: on conserve les mêmes populate (mêmes champs utilisés par le tableau).
exports.getActiveContrats = async (req, res) => {
  try {
    const contrats = await Contrat.find({ statut: true })
      .populate('client')
      .populate('appartement')
      .populate({ path: 'appartement', populate: 'secteur' })
      .populate('user')
      .sort({ startDate: -1 });

    return res.status(200).json(contrats);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (contrats liste): pagination + recherche (server-side)
// ------------------------------------------------------------
// Objectif: éviter getAllContrats sur la page "Contrats".
// Recherche: client (nom/prénom/téléphone), montants, secteur.adresse, dates.
// NB: on garde une forme de données compatible avec l'affichage existant.
exports.getContratsPaged = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const searchRaw = String(req.query.search || '').trim();

    const pipeline = [
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
      // Join appartement
      {
        $lookup: {
          from: 'appartements',
          localField: 'appartement',
          foreignField: '_id',
          as: 'appartementDoc',
        },
      },
      { $unwind: { path: '$appartementDoc', preserveNullAndEmptyArrays: true } },
      // Join secteur
      {
        $lookup: {
          from: 'secteurs',
          localField: 'appartementDoc.secteur',
          foreignField: '_id',
          as: 'secteurDoc',
        },
      },
      { $unwind: { path: '$secteurDoc', preserveNullAndEmptyArrays: true } },
      // Champs dates formatés pour recherche texte (proche du front)
      {
        $addFields: {
          startDateStr: {
            $dateToString: { format: '%d/%m/%Y', date: '$startDate' },
          },
          endDateStr: {
            $dateToString: { format: '%d/%m/%Y', date: '$endDate' },
          },
        },
      },
    ];

    if (searchRaw) {
      pipeline.push({
        $match: {
          $or: [
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
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: '$totalAmount' },
                  regex: searchRaw,
                  options: 'i',
                },
              },
            },
            { 'secteurDoc.adresse': { $regex: searchRaw, $options: 'i' } },
            { startDateStr: { $regex: searchRaw, $options: 'i' } },
            { endDateStr: { $regex: searchRaw, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { startDate: -1, statut: -1 } },
      // Forme compatible front: { client, appartement:{secteur}, ... }
      // IMPORTANT: éviter $project mixant inclusion/exclusion (MongoDB le refuse).
      {
        $addFields: {
          client: '$clientDoc',
          appartement: {
            $mergeObjects: ['$appartementDoc', { secteur: '$secteurDoc' }],
          },
        },
      },
      { $unset: ['clientDoc', 'appartementDoc', 'secteurDoc', 'startDateStr', 'endDateStr'] },
      {
        $facet: {
          meta: [{ $count: 'total' }],
          items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      }
    );

    const result = await Contrat.aggregate(pipeline);
    const total = result?.[0]?.meta?.[0]?.total || 0;
    const items = result?.[0]?.items || [];
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.status(200).json({ items, total, page, limit, totalPages });
  } catch (error) {
    return res.status(404).json({ message: error?.message || error });
  }
};

// Récupérer un Contrat
exports.getContrat = async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.id)
    .populate('client')
    .populate('appartement')
      .populate({path:'appartement', populate:'secteur'})
    .populate('user');


    if (!contrat)
      return res
        .status(404)
        .json({ status: 'error', message: 'contrat non trouvé' });


    res.status(200).json(contrat);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer un Contrat
exports.deleteContrat = async (req, res) => {
  try {
    const session = await mongoose.startSession()
    session.startTransaction();
  const contrat=  await Contrat.findByIdAndDelete(req.params.id,{session});

    await Appartement.findByIdAndUpdate(
     contrat.appartement._id,
      { isAvailable: true },
      { new: true ,session}
    );
const paiements = await Paiement.find({contrat: contrat._id}).session(session);

if(paiements){
    for(const pai of paiements){
      await Paiement.findByIdAndDelete(pai._id,{session});
    }
    }

await session.commitTransaction();
session.endSession();
    return res
      .status(200)
      .json({ status: 'success', message: 'Contrat supprimé avec succès' });
  } catch (err) {
    session.abortTransaction();
    session.endSession();
    return res.status(400).json({ status: 'error', message: err.message });
  }
};



exports.refrechContrats = async (req, res, next) => {
  try {
    const contrats = await Contrat.find()
    .populate('client')
      .populate('appartement')
      .populate({path:'appartement', populate:'secteur'})
      .populate('user');
    // On verifie pour chaque CONTRAT si endDate est Inférieure à la date actuelle
    // Alors on met isAvailable à true pour l'appartement concerné
    for (const contrat of contrats) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // ignore l'heure pour comparer juste les jours
    
      const endDate = new Date(contrat.endDate);
      endDate.setHours(0, 0, 0, 0);
    
      if (contrat.statut && endDate <= today) {

        // Mettre le Statut de Contrat à FIN "false"
        await Contrat.findByIdAndUpdate(contrat._id,{statut: false});

       // Mettre l'appartement Disponible
 await Appartement.findByIdAndUpdate(
  contrat.appartement._id,
  { isAvailable: true },
  { new: true }
);
      }
    }
   next()
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      message: "Erreur lors de la l'actualisation des Clients",
      error: e.message,
    });
  }
};
