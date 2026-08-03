import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Ajouter une rentals
export const useCreateRental = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/rentals/createRental', data),
    onSuccess: () => queryClient.invalidateQueries(['rentals']),
  });
};

// Obtenir une Rental
export const useAllRental = () =>
  useQuery({
    queryKey: ['rentals'],
    queryFn: () => api.get('/rentals/getAllRentals').then((res) => res.data),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// ------------------------------------------------------------
// OPTIMISATION (dashboard reservations): pagination + recherche (server-side)
// ------------------------------------------------------------
export const useRentalsPaged = ({ page = 1, limit = 20, search = '' }) =>
  useQuery({
    queryKey: ['rentals', 'paged', { page, limit, search }],
    queryFn: () =>
      api
        .get('/rentals/paged', { params: { page, limit, search } })
        .then((res) => res.data),
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): rentals filtrés par secteur
// ------------------------------------------------------------
// Objectif: éviter de charger toutes les réservations puis filtrer côté front.
export const useRentalsBySecteur = (secteurId) =>
  useQuery({
    queryKey: ['rentals', 'bySecteur', secteurId],
    queryFn: () =>
      api.get(`/rentals/bySecteur/${secteurId}`).then((res) => res.data),
    enabled: Boolean(secteurId),
    staleTime: 1000 * 60 * 2,
  });

// ------------------------------------------------------------
// OPTIMISATION (/secteur/:id): rentals paginés + recherche (server-side)
// ------------------------------------------------------------
export const useRentalsBySecteurPaged = ({
  secteurId,
  page = 1,
  limit = 20,
  search = '',
}) =>
  useQuery({
    queryKey: ['rentals', 'bySecteur', 'paged', { secteurId, page, limit, search }],
    queryFn: () =>
      api
        .get(`/rentals/bySecteur/${secteurId}/paged`, { params: { page, limit, search } })
        .then((res) => res.data),
    enabled: Boolean(secteurId),
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });

// ------------------------------------------------------------
// OPTIMISATION (reservations liste): pagination + recherche (server-side)
// ------------------------------------------------------------
export const useRentalsByClientPaged = ({
  clientId,
  page = 1,
  limit = 20,
  search = '',
}) =>
  useQuery({
    queryKey: ['rentals', 'byClient', 'paged', { clientId, page, limit, search }],
    queryFn: () =>
      api
        .get(`/rentals/byClient/${clientId}/paged`, { params: { page, limit, search } })
        .then((res) => res.data),
    enabled: Boolean(clientId),
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });

// Obtenir une rentals
export const useOneRental = (id) =>
  useQuery({
    queryKey: ['rentals', id],
    queryFn: () => api.get(`/rentals/getRental/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Mettre à jour une Rental
export const useUpdateRental = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/rentals/updateRental/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['rentals']),
  });
};

// Mettre à jour une Rental
export const useUpdateRentalStatut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/rentals/updateRentalStatut', data),
    onSuccess: () => queryClient.invalidateQueries(['rentals']),
  });
};

// Supprimer une rentals
export const useDeleteRental = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/rentals/deleteRental/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['rentals']),
  });
};
