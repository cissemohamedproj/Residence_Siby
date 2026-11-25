const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      require: true,
    },
    heure: {
      type: Number,
      default: 0,
      trim: true,
    },
    jour: {
      type: Number,
      default: 0,
      trim: true,
    },
    semaine: {
      type: Number,
      default: 0,
      trim: true,
    },
    mois: {
      type: Number,
      default: 0,
      trim: true,
    },
    rentalDate: {
      type: Date,
      required: true,
      trim: true,
    },
    rentalChangeDate: {
      type: Date,
    },
    rentalEndDate: {
      type: Date,
      required: true,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      trim: true,
    },
    totalPaye: {
      type: Number,
      required: true,
      trim: true,
    },
    statut: {
      type: String,
      enum: ["en cours", "validée", "annulée"],
      default: "en cours",
      required: true,
      trime: true,
    },
    appartement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appartement",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Rental = mongoose.model("Rental", rentalSchema);
module.exports = Rental;
