import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Créer une nouvelle produits
export const useCreateSecteur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/secteurs/addSecteur', data),
    onSuccess: () => queryClient.invalidateQueries(['secteurs']),
  });
};

// Mettre à jour une secteurs
export const useUpdateSecteur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/secteurs/updateSecteur/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['secteurs']),
  });
};

// Lire toutes les secteurs
export const useAllSecteur = () =>
  useQuery({
    queryKey: ['secteurs'],
    queryFn: () => api.get('/secteurs/getAllSecteurs').then((res) => res.data),
  });

// ------------------------------------------------------------
// OPTIMISATION (dashboard): total secteurs (count only)
// ------------------------------------------------------------
export const useSecteurCount = () =>
  useQuery({
    queryKey: ['secteurs', 'count'],
    queryFn: () => api.get('/secteurs/count').then((res) => res.data),
    staleTime: 1000 * 60 * 2,
  });

// Obtenir un Secteur
export const useOneSecteur = (id) =>
  useQuery({
    queryKey: ['getSecteur', id],
    queryFn: () =>
      api.get(`/secteurs/getSecteur/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, //chaque 5 minutes rafraichir les données
  });

// Supprimer une secteurs
export const useDeleteSecteur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/secteurs/deleteSecteur/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['secteurs']),
  });
};
