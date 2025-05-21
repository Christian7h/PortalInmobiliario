// Toast.tsx - Un componente para mostrar notificaciones temporales
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info',
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Configurar temporizador para ocultar automáticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      // Iniciar la animación de salida
      setIsExiting(true);
      
      // Esperar a que termine la animación antes de eliminar el componente
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300); // 300ms para la animación de salida
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Manejar el cierre manual
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  // Determinar el color y el ícono basados en el tipo
  let bgColor, icon, textColor;
  switch (type) {
    case 'success':
      bgColor = 'bg-green-100 border-green-400';
      textColor = 'text-green-700';
      icon = <CheckCircle className="w-5 h-5 text-green-500" />;
      break;
    case 'error':
      bgColor = 'bg-red-100 border-red-400';
      textColor = 'text-red-700';
      icon = <AlertCircle className="w-5 h-5 text-red-500" />;
      break;
    case 'info':
    default:
      bgColor = 'bg-blue-100 border-blue-400';
      textColor = 'text-blue-700';
      icon = <Info className="w-5 h-5 text-blue-500" />;
  }

  // Aplicar clases para animaciones
  const animationClass = isExiting 
    ? 'opacity-0 transform translate-x-4 transition-all duration-300' 
    : 'opacity-100 transform translate-x-0 transition-all duration-300';

  return (
    <div 
      className={`fixed bottom-4 right-4 flex items-center ${bgColor} ${textColor} px-4 py-3 rounded-md border shadow-lg z-50 max-w-md ${animationClass}`}
      role="alert"
    >
      <div className="mr-3">
        {icon}
      </div>
      <div className="mr-4">
        <p>{message}</p>
      </div>
      <button 
        onClick={handleClose}
        className="ml-auto"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
