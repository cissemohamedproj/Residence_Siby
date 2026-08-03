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

/**
 * CORS — Protection uniquement sur un chemin (préfixe /api)
 *
 * Objectif:
 * - Ne pas exposer "tout le serveur" au CORS (évite d’ouvrir aussi des routes non-API)
 * - Autoriser uniquement les origines front nécessaires (prod + dev)
 *
 * Configuration:
 * - CORS_ORIGINS : liste séparée par virgule
 *   ex: "https://gestiongroupesiby.online,http://localhost:3000"
 */
const corsOriginsRaw = (process.env.CORS_ORIGINS || '').toString().trim();
const allowedOrigins = corsOriginsRaw
  ? corsOriginsRaw.split(',').map((s) => s.trim()).filter(Boolean)
  : [
      // Prod (avec / sans www)
      'https://gestiongroupesiby.online',
      'https://www.gestiongroupesiby.online',
      // Dev
      'http://localhost:3000',
      'http://localhost:3000/residence_siby',
    ];

// Petit helper pour tolérer www si l’admin l’utilise en prod.
const prodOriginRegex = /^https:\/\/(www\.)?gestiongroupesiby\.online$/i;

const corsOptions = {
  origin(origin, cb) {
    // origin absent => curl/Postman/serveur-à-serveur (pas un navigateur)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || prodOriginRegex.test(origin)) {
      return cb(null, true);
    }
    // On renvoie une erreur explicite (ceci remonte souvent en 500 si non géré ailleurs)
    return cb(new Error(`CORS refusé pour l'origine: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // cache preflight 24h
};

// CORS UNIQUEMENT pour l’API
app.use('/residence_siby/api', cors(corsOptions));
// Preflight pour toutes les routes /api/... (regex => pas de parsing path-to-regexp)
app.options(/^\/api\/.*$/, cors(corsOptions));
app.use(express.json()); // Parser les requêtes avec JSON

// Lire les données de formulaire avec body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Utilisation des routes étudiant
// Ajoute un préfixe /api à toutes les routes

// app.use('/', userRoute);

// Utilisation des routes Utilisateur
app.use('/residence_siby/api/users', userRoute);

// Routes pour Secteurs 
app.use('/residence_siby/api/secteurs', secteurRoute);


// Utilisation des routes Appartements
app.use('/residence_siby/api/appartements', appartementRoute);

// Utilisation des routes client
app.use('/residence_siby/api/clients', clientRoute);

// Utilisation des routes contrats
app.use('/residence_siby/api/contrats', contratRoute);


// Utilisation des routes rentals
app.use('/residence_siby/api/rentals', rentalRoute);

// Utilisation des routes Paiement
app.use('/residence_siby/api/paiements', paiementRoute);

// Utilisation des routes Comission
app.use('/residence_siby/api/comissions', comissionRoute);

// Utilisation des routes Depense
app.use('/residence_siby/api/depenses', depenseRoute);

//  Exporter le fichier APP
module.exports = app;
