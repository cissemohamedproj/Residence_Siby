import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle Paiement
export const useCreatePaiement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/paiements/createPaiement', data),
    onSuccess: () => queryClient.invalidateQueries(['paiements']),
  });
};

// Mettre à jour une Paiement
export const useUpdatePaiement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/paiements/updatePaiement/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['paiements']),
  });
};
// Lire toutes les paiements
export const useAllPaiements = () =>
  useQuery({
    queryKey: ['paiements'],
    queryFn: () =>
      api.get('/paiements/getAllPaiements').then((res) => res.data),
  });

// ------------------------------------------------------------
// OPTIMISATION (paiements): pagination + recherche (server-side)
// ------------------------------------------------------------
export const usePaiementsPaged = ({ page = 1, limit = 20, search = '' }) =>
  useQuery({
    queryKey: ['paiements', 'paged', { page, limit, search }],
    queryFn: () =>
      api
        .get('/paiements/paged', { params: { page, limit, search } })
        .then((res) => res.data),
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });

// ------------------------------------------------------------
// OPTIMISATION (paiements): résumé global (totaux)
// ------------------------------------------------------------
export const usePaiementsSummary = () =>
  useQuery({
    queryKey: ['paiements', 'summary'],
    queryFn: () => api.get('/paiements/summary').then((res) => res.data),
    staleTime: 1000 * 60, // les totaux ne changent pas à chaque seconde
  });

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): paiements filtrés par secteur
// ------------------------------------------------------------
// Objectif: éviter de charger tous les paiements puis filtrer côté front.
export const usePaiementsBySecteur = (secteurId) =>
  useQuery({
    queryKey: ['paiements', 'bySecteur', secteurId],
    queryFn: () =>
      api.get(`/paiements/bySecteur/${secteurId}`).then((res) => res.data),
    enabled: Boolean(secteurId),
    staleTime: 1000 * 60 * 2,
  });

// Obtenir une Paiement
export const useOnePaiement = (id) =>
  useQuery({
    queryKey: ['getOnePaiement', id],
    queryFn: () =>
      api.get(`/paiements/getOnePaiement/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Obtenir un Paiement via ID de COMMANDE sélectionnée
export const useOnePaiementBySelectedCommandeID = (id) =>
  useQuery({
    queryKey: ['getOnePaiementBySelectedCommandeID', id],
    queryFn: () =>
      api
        .get(`/paiements/getPaiementBySelectedCommandeID/${id}`)
        .then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Supprimer une Paiement
export const useDeletePaiement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/paiements/deletePaiement/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['paiements']),
  });
};
