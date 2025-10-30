const mongoose = require('mongoose');

const comissionSchema = new mongoose.Schema(
  {

    beneficiaire:{
      type: String,
      required: true,
      trim: true,
    },
   
    amount: {
      type: Number,
      required: true,
      trim: true,
    },
   

    paiementDate: {
      type: Date,
      required: true,
    },
    
    
    details: {
      type: String,
      required: true,
      trim: true,
    },
  
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    secteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Secteur',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Comission = mongoose.model('Comission', comissionSchema);
module.exports = Comission;
