import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle Comission
export const useCreateComission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/comissions/createComission', data),
    onSuccess: () => queryClient.invalidateQueries(['comissions']),
  });
};

// Mettre à jour une Comission
export const useUpdateComission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/comissions/updateComission/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['comissions']),
  });
};
// Lire toutes les comissions
export const useAllComissions = () =>
  useQuery({
    queryKey: ['comissions'],
    queryFn: () =>
      api.get('/comissions/getAllComissions').then((res) => res.data),
  });

// ------------------------------------------------------------
// OPTIMISATION (commissions): pagination + recherche (server-side)
// ------------------------------------------------------------
export const useComissionsPaged = ({ page = 1, limit = 20, search = '' }) =>
  useQuery({
    queryKey: ['comissions', 'paged', { page, limit, search }],
    queryFn: () =>
      api
        .get('/comissions/paged', { params: { page, limit, search } })
        .then((res) => res.data),
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });

// Obtenir une Paiement
export const useOneComission = (id) =>
  useQuery({
    queryKey: ['getOneComission', id],
    queryFn: () =>
      api.get(`/comissions/getOneComission/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Supprimer une Comission
export const useDeleteComission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/comissions/deleteComission/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['comissions']),
  });
};
