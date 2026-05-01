import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle Appartements
export const useCreateAppartement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/appartements/addAppartement', data),
    onSuccess: () => queryClient.invalidateQueries(['appartements']),
  });
};

// Update Appartement
export const useUpdateAppartement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/appartements/updateAppartement/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['appartements']),
  });
};

// Lire toutes les appartements
export const useAllAppartement = () =>
  useQuery({
    queryKey: ['appartements'],
    queryFn: () =>
      api.get('/appartements/getAllAppartements').then((res) => res.data),
  });

// Obtenir une Appartement
export const useOneAppartement = (id) =>
  useQuery({
    queryKey: ['getAppartement', id],
    queryFn: () =>
      api.get(`/appartements/getAppartement/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Supprimer une appartements
export const useCancelAppartement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/appartements/cancelAppartement/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['appartements']),
  });
};

// Supprimer une appartements
export const useDeleteAppartement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/appartements/deleteAppartement/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['appartements']),
  });
};
