const express = require('express');
// Import des routes
const userRoute = require('./routes/UserRoute');
const secteurRoute = require('./routes/SecteurRoute');
const appartementRoute = require('./routes/AppartementRoute');
const clientRoute = require('./routes/ClientRoute');
const contratRoute = require('./routes/ContratRoute');
const rentalRoute = require('./routes/RentalRoute');
const paiementRoute = require('./routes/PaiementRoute');
const comissionRoute = require('./routes/ComissionRoute');
const depenseRoute = require('./routes/DepenseRoute');

const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middlewares globaux

app.use(cors());
// app.use(
//   cors({
//     origin: 'https://quincaillerie-groupe-siby.onrender.com',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })
// );
// app.options('*', cors());
app.use(express.json()); // Parser les requêtes avec JSON

// Lire les données de formulaire avec body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Utilisation des routes étudiant
// Ajoute un préfixe /api à toutes les routes

app.use('/', userRoute);

// Utilisation des routes Utilisateur
app.use('/api/users', userRoute);

// Routes pour Secteurs 
app.use('/api/secteurs', secteurRoute);


// Utilisation des routes Appartements
app.use('/api/appartements', appartementRoute);

// Utilisation des routes client
app.use('/api/clients', clientRoute);

// Utilisation des routes contrats
app.use('/api/contrats', contratRoute);


// Utilisation des routes rentals
app.use('/api/rentals', rentalRoute);

// Utilisation des routes Paiement
app.use('/api/paiements', paiementRoute);

// Utilisation des routes Comission
app.use('/api/comissions', comissionRoute);

// Utilisation des routes Depense
app.use('/api/depenses', depenseRoute);

//  Exporter le fichier APP
module.exports = app;
