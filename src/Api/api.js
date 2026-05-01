// src/api/api.js
import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://5002/api',
  baseURL: '/residence_siby/api',

  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter token JWT automatiquement
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('authUser');
  const token = user ? JSON.parse(user).token : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


/**
 * Déconnexion automatique si token expiré ou invalide (401).
 *
 * IMPORTANT (prod sous sous-chemin `/residence_siby`) :
 * - `window.location.href = '/login'` pointe vers la RACINE du domaine
 *   => URL incorrecte : `.../login` au lieu de `.../residence_siby/login`.
 * - Create React App définit `process.env.PUBLIC_URL` depuis `package.json` > `homepage`
 *   (chez vous : `/residence_siby`). On l'utilise pour reconstruire l'URL de login.
 *
 * IMPORTANT (écran Login) :
 * - Le backend renvoie aussi **401** pour « email / mot de passe incorrect » sur `POST /users/login`.
 * - Ce n'est PAS une session expirée : il ne faut **ni** vider le storage **ni** recharger la page,
 *   sinon l'utilisateur perd le formulaire et l'URL part à la racine.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = String(error.config?.url || '');
      const isLoginAttempt = requestUrl.includes('/users/login');

      if (isLoginAttempt) {
        return Promise.reject(error);
      }

      localStorage.removeItem('authUser');

      const publicBase = (
        process.env.PUBLIC_URL || '/residence_siby'
      ).replace(/\/$/, '');
      window.location.assign(`${publicBase}/login`);
    }
    return Promise.reject(error);
  }
);
export default api;
