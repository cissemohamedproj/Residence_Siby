const mongoose = require('mongoose');
const Rental = require('../models/RentalModel')
const Contrat = require('../models/ContratModel');
const Appartement = require('../models/AppartementModel');
const Paiement = require('../models/PaiementModel');
const Depense = require('../models/DepenseModel')
const textValidation = require('./regexValidation');

// Ajouter un Rental
exports.createRental = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {

const reservationDate =new Date(req.body.rentalDate);
const reservationEndDate =new Date(req.body.rentalEndDate);


    const existingContrat = await Contrat.findOne({
      appartement: req.body.appartement,
   $or:[
    {
      startDate: { $lte: reservationEndDate},
    endDate: {$gte: reservationDate},
  }
   ]
    }).session(session)
 
    
    if(existingContrat){
      await   session.abortTransaction()
      session.endSession()
      return res.status(400).json({message: `Un Contrat serai en cours du: ${new Date(existingContrat.startDate).toLocaleDateString('fr-Fr')} au ${new Date(existingContrat.endDate).toLocaleDateString('fr-Fr')}`})
    }

    const existingRental = await Rental.findOne({
      appartement: req.body.appartement,
      $or:[
        {
          rentalDate: { $lte:reservationEndDate},
          rentalEndDate: {$gte: reservationDate},
        }
      ]
    }).session(session);


    if(existingRental && existingRental.statut === 'en cours'){
      await   session.abortTransaction()
      session.endSession()
      return res.status(400).json({message: `Cette Appartement est reservée du: ${new Date(existingRental.rentalDate).toLocaleDateString('fr-Fr')} au  ${new Date(existingRental.rentalEndDate).toLocaleDateString('fr-Fr')}`})
    }

   

      const newRental = await Rental.create(
        [{
      
      user: req.user.id,
      ...req.body,
    }],
    {session},
  );
     
  if(req.body.totalPaye >0 ){
    await Paiement.create(
      [
        {
          totalPaye: req.body.totalPaye,
          paiementDate: new Date(),
          rental: newRental[0]._id,
          contrat: null,
          user: req.user.id
        }
      ],
      {session},
    )
        }


    await session.commitTransaction()
    session.endSession()
    return res.status(201).json(newRental);
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

// Mettre à jour un Rental

exports.updateRental = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
   
const reservationDate =new Date(req.body.rentalDate);
const reservationEndDate =new Date(req.body.rentalEndDate);


// ----------------------------------------------
// ---------- CONTRAT
// ----------------------------------------------

    const existingContrat = await Contrat.findOne({
      appartement: req.body.appartement,
   $or:[
    {
      startDate: { $lte: reservationEndDate},
    endDate: {$gte: reservationDate},
  }
   ]
    }).session(session)
 
    
    if(existingContrat){
      await   session.abortTransaction()
      session.endSession()
      return res.status(400).json({message: `Un Contrat serai en cours du: ${new Date(existingContrat.startDate).toLocaleDateString('fr-Fr')} au ${new Date(existingContrat.endDate).toLocaleDateString('fr-Fr')}`})
    }


    
// ----------------------------------------------
// ---------- RENTAL
// ----------------------------------------------
    const existingRental = await Rental.findOne({
      _id: {$ne: req.params.id},
      appartement: req.body.appartement,
      $or:[
        {
          rentalDate: { $lte:reservationEndDate},
          rentalEndDate: {$gte: reservationDate},
        }
      ]
    }).session(session);


    if(existingRental && existingRental.statut === 'en cours'){
      await   session.abortTransaction()
      session.endSession()
      return res.status(400).json({message: `Cette Appartement est reservée du: ${new Date(existingRental.rentalDate).toLocaleDateString('fr-Fr')} au  ${new Date(existingRental.rentalEndDate).toLocaleDateString('fr-Fr')}`})
    }



    // // Mise à jour LA RESERVATION
    const result = await Rental.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      {
        new: true,
        runValidators: true,
        context: "query",
        session,
      }
    );

    const oldPaiement = await Paiement.findOne({rental: req.params.id}).session(session);

      await Paiement.findByIdAndUpdate(
        oldPaiement._id,
          {
            totalPaye: req.body.totalPaye,
            paiementDate: reservationDate,
           
          },
          {session}
        
      )
          


    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(result);
  } catch (err) {
    await session.abortTransactin();
    session.endSession();
    console.log(err);
    return res.status(400).json({ status: "error", message: err.message });
  }
};


exports.updateRentalStatut = async(req,res)=>{
const session = await mongoose.startSession()
session.startTransaction()
  try{

    const rentalId = req.body.rentalId;

    const rentalUpdate = await Rental.findById(rentalId)
    .populate({path:'appartement', populate:{path: 'secteur'}})
    .populate('client').session(session)



if(req.body.statut === 'annulée'){
  const paie = await Paiement.findOne({rental: rentalId})
  .populate({path: 'rental', 
    populate:[
      {path:'client'}, {path:'appartement'}

    ]}).session(session);


  const client = rentalUpdate.client;
const secteur = rentalUpdate.appartement.secteur
const paieAmount = paie.totalPaye
const appartementDayPrice = paie.rental.appartement.dayPrice

// On trasforme la valeur en Positif avec Math.abs()
const returningAmount = Math.abs(paieAmount - appartementDayPrice)


const dep = await Depense.create(
      [
        {
          motifDepense: `Rembourssement de reservation pour: ${client.firstName + ' - ' + client.lastName}`,
          dateOfDepence: new Date(),
          totalAmount: returningAmount,
secteur: secteur._id,
rental: rentalUpdate._id,
user: req.user.id,
        }
      ],
      {session}
    )
    if(!dep){
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({message: "Erreur de mis à jours Statut"})
    }


}



await Rental.findByIdAndUpdate(rentalUpdate._id,
  {
    statut: req.body.statut,
     rentalChangeDate: new Date(),
  },
  {session}
);

await session.commitTransaction()
session.endSession()


    return res.status(201).json(rentalUpdate);
  }catch(err){
    await session.abortTransaction()
    session.endSession()
console.log(err)
    return res.status(500).json({message: "Erreur de mis à jour de statut"});
  }
}





// Obtenir tous les Rental
exports.getAllRental = async (req, res) => {
 
  try {
    const result = await Rental.find()
    .populate('client')
      .populate({path:'appartement', populate:{path: 'secteur'}})
      .populate('user')
      .sort({ rentalDate: -1 })
  
    return res.status(200).json(result);
  } catch (error) {
   console.log(error)
    return res.status(404).json({ message: error });
  }
};

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): reservations filtrées par secteur
// ------------------------------------------------------------
// Objectif: éviter "getAllRentals" + filtre côté front sur SelectedSecteur.
exports.getRentalsBySecteur = async (req, res) => {
  try {
    const secteurId = req.params.id;

    const appartements = await Appartement.find({ secteur: secteurId })
      .select('_id')
      .exec();
    const appartementIds = appartements.map((a) => a._id);

    const result = await Rental.find({ appartement: { $in: appartementIds } })
      .populate('client')
      .populate({ path: 'appartement', populate: { path: 'secteur' } })
      .populate('user')
      .sort({ rentalDate: -1 });

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: error });
  }
};

// Récupérer un Rental
exports.getRental = async (req, res) => {
  try {
    const result = await Rental.findById(req.params.id)
    .populate('client')
    .populate({path:'appartement', populate:{path: 'secteur'}})
    .populate('user');
    res.status(200).json(result); 

  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer un Rental
exports.deleteRental = async (req, res) => {
  const session = await mongoose.startSession()
session.startTransaction()

  try {
    
    const rentalId = req.params.id

    const rentalUpdate = await Rental.findById(rentalId)
    .populate({path:'appartement', populate:{path: 'secteur'}})
    .populate('client').session(session)


    const paie = await Paiement.findOne({rental: rentalId})
    .populate({path: 'rental', 
      populate:[
        {path:'client'}, {path:'appartement'}
  
      ]}).session(session);


    if(paie){

await Paiement.findByIdAndDelete(paie._id,{session});

      }    

      const dep = await Depense.findOne({rental: rentalId}).session(session)
      if(dep){

        await Depense.findByIdAndDelete(dep._id,{session});
        
              }   


  await Rental.findByIdAndDelete(rentalId,{session});

  await session.commitTransaction()
  session.endSession()
    return res
      .status(200)
      .json({ status: 'success', message: 'Reservation supprimé avec succès' });


  } catch (err) {
    await session.abortTransaction()
    session.endSession();
  console.log(err)
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

