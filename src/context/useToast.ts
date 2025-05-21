// useToast.ts - Hook para usar el contexto de Toast
import { useContext } from 'react';
import { ToastContext } from './ToastContext';
import type { ToastContextType } from './ToastContext';

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
};
