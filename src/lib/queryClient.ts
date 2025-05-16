import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Creamos una instancia de QueryClient con configuraciones personalizadas
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 1 día antes de considerar los datos obsoletos
      gcTime: 1000 * 60 * 60 * 24, // Guardar en caché durante 1 día
      refetchOnWindowFocus: false,
      retry: 1, // Reintentar una vez si hay fallos
    },
  },
});

// Crear persistidor para LocalStorage usando el utility de TanStack Query
export const createPersister = () => {
  if (typeof window === 'undefined') return undefined;
    return createSyncStoragePersister({
    storage: window.localStorage,
    key: 'REAL_ESTATE_REACT_QUERY_CACHE',
    // Serializar/deserializar para manejar posibles tipos especiales
    serialize: (data: unknown) => JSON.stringify(data),
    deserialize: (data: string) => JSON.parse(data),
  });
};
