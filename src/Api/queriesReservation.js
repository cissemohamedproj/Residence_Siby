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
