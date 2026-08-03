import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Ajouter une Contrats
export const useCreateContrat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/contrats/createContrat', data),
    onSuccess: () => queryClient.invalidateQueries(['contrats']),
  });
};

// Renouveller un Contrats
export const useReloadContrat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/contrats/reloadContrat', data),
    onSuccess: () => queryClient.invalidateQueries(['contrats']),
  });
};

// Stoper un Contrats
export const useStopeContrat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/contrats/stopeContrat', data),
    onSuccess: () => queryClient.invalidateQueries(['contrats']),
  });
};

// Obtenir une Contrat
export const useAllContrat = () =>
  useQuery({
    queryKey: ['contrats'],
    queryFn: () => api.get('/contrats/getAllContrats').then((res) => res.data),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// ------------------------------------------------------------
// OPTIMISATION (dashboard): total contrats (count only)
// ------------------------------------------------------------
export const useContratCount = () =>
  useQuery({
    queryKey: ['contrats', 'count'],
    queryFn: () => api.get('/contrats/count').then((res) => res.data),
    staleTime: 1000 * 60 * 2,
  });

// ------------------------------------------------------------
// OPTIMISATION (dashboard): contrats actifs (statut=true)
// ------------------------------------------------------------
export const useActiveContrats = () =>
  useQuery({
    queryKey: ['contrats', 'active'],
    queryFn: () => api.get('/contrats/active').then((res) => res.data),
    staleTime: 1000 * 30, // refresh rapide: tableau de bord
  });

// ------------------------------------------------------------
// OPTIMISATION (contrats liste): pagination + recherche (server-side)
// ------------------------------------------------------------
export const useContratsPaged = ({ page = 1, limit = 20, search = '' }) =>
  useQuery({
    queryKey: ['contrats', 'paged', { page, limit, search }],
    queryFn: () =>
      api
        .get('/contrats/paged', { params: { page, limit, search } })
        .then((res) => res.data),
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): contrats filtrés par secteur
// ------------------------------------------------------------
// Objectif: éviter de charger tous les contrats puis filtrer côté front.
export const useContratsBySecteur = (secteurId) =>
  useQuery({
    queryKey: ['contrats', 'bySecteur', secteurId],
    queryFn: () =>
      api.get(`/contrats/bySecteur/${secteurId}`).then((res) => res.data),
    enabled: Boolean(secteurId),
    staleTime: 1000 * 60 * 2,
  });

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): contrats paginés + recherche (server-side)
// ------------------------------------------------------------
export const useContratsBySecteurPaged = ({
  secteurId,
  page = 1,
  limit = 20,
  search = '',
}) =>
  useQuery({
    queryKey: ['contrats', 'bySecteur', 'paged', { secteurId, page, limit, search }],
    queryFn: () =>
      api
        .get(`/contrats/bySecteur/${secteurId}/paged`, { params: { page, limit, search } })
        .then((res) => res.data),
    enabled: Boolean(secteurId),
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });

// Obtenir une contrats
export const useOneContrat = (id) =>
  useQuery({
    queryKey: ['contrats', id],
    queryFn: () =>
      api.get(`/contrats/getContrat/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Mettre à jour une Contrat
export const useUpdateContrat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/contrats/updateContrat/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['contrats']),
  });
};

// Supprimer une contrats
export const useDeleteContrat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/contrats/deleteContrat/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['contrats']),
  });
};

// Supprimer toutes les contrats
export const useDeleteAllContrat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/contrats/deleteAllContrat'),
    onSuccess: () => queryClient.invalidateQueries(['contrats']),
  });
};
