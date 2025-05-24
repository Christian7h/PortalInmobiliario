import { useState, useEffect } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanyProfile } from '../../lib/api';
import { CompanyProfile } from '../../types';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  
  // Usamos useQuery para obtener y memorizar el perfil de la empresa
  const { data: companyProfile } = useQuery<CompanyProfile, Error>({
    queryKey: ['companyProfile'],
    queryFn: fetchCompanyProfile,
    staleTime: 1000 * 60 * 20, // 20 minutos antes de considerar los datos obsoletos
  });

  // Detectar scroll para cambiar apariencia del header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Limpieza del evento cuando el componente se desmonta
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Cerrar menú móvil cuando cambia la ubicación (al navegar a una nueva página)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Controlar el scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      // Deshabilitar scroll en el body cuando el menú está abierto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll cuando el menú se cierra
      document.body.style.overflow = '';
    }
    
    // Limpieza al desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Cerrar menú al hacer clic fuera
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsMenuOpen(false);
    }
  };

  // Función para determinar si un enlace está activo
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Detener la propagación de eventos para evitar redirecciones no deseadas
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Estilos de enlace activo
  const activeNavLinkClass = "after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-amber-500";
  const navLinkBaseClass = "relative text-slate-800 font-medium text-sm hover:text-amber-500 transition-colors duration-300 py-1 px-1";

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 w-full backdrop-blur-lg backdrop-saturate-[180%] ${
        scrolled 
          ? 'py-2 md:py-3 shadow-sm border-b border-slate-200/70 bg-white/95' 
          : 'py-3 md:py-5 bg-white/90'
      } transition-all duration-300 pointer-events-none`}
      onClick={stopPropagation}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between pointer-events-auto">
        {/* Logo y nombre de la empresa */}
        <Link to="/" className="flex items-center gap-2.5 group transition-all duration-300 hover:opacity-80 select-none">
          {companyProfile?.logo_url ? (
            <img 
              src={companyProfile.logo_url} 
              alt="Logo" 
              className="h-8 sm:h-9 w-auto filter invert" 
              loading="eager"
            />
          ) : (
            <Building className="h-6 sm:h-7 w-6 sm:w-7 text-amber-500" />
          )}
          <span className="text-lg sm:text-xl font-semibold tracking-tight text-slate-800">
            {companyProfile?.company_name || 'PropPortal'}
          </span>
        </Link>

        {/* Navegación desktop */}
        <div className="hidden md:flex items-center justify-between flex-grow max-w-2xl ml-12">
          <nav className="flex items-center gap-x-7">
            <NavLink 
              to="/" 
              className={`${navLinkBaseClass} ${isActive('/') ? activeNavLinkClass : ''}`}
              onClick={stopPropagation}
            >
              Inicio
            </NavLink>
            <NavLink 
              to="/categoria/casa" 
              className={`${navLinkBaseClass} ${isActive('/categoria/casa') ? activeNavLinkClass : ''}`}
              onClick={stopPropagation}
            >
              Casas
            </NavLink>
            <NavLink 
              to="/categoria/departamento" 
              className={`${navLinkBaseClass} ${isActive('/categoria/departamento') ? activeNavLinkClass : ''}`}
              onClick={stopPropagation}
            >
              Departamentos
            </NavLink>
            <NavLink 
              to="/categoria/terreno" 
              className={`${navLinkBaseClass} ${isActive('/categoria/terreno') ? activeNavLinkClass : ''}`}
              onClick={stopPropagation}
            >
              Terrenos
            </NavLink>
            <NavLink 
              to="/nosotros" 
              className={`${navLinkBaseClass} ${isActive('/nosotros') ? activeNavLinkClass : ''}`}
              onClick={stopPropagation}
            >
              Nosotros
            </NavLink>
            <NavLink 
              to="/contacto" 
              className={`${navLinkBaseClass} ${isActive('/contacto') ? activeNavLinkClass : ''}`}
              onClick={stopPropagation}
            >
              Contacto
            </NavLink>
          </nav>
        </div>

        {/* Botón de autenticación desktop */}
        <div className="hidden md:block">
          {user ? (
            <Link 
              to="/admin" 
              className="inline-flex items-center gap-2 border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-300 transform hover:-translate-y-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <LayoutDashboard size={16} />
              <span>Panel Admin</span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-full font-medium text-sm hover:shadow-lg hover:shadow-amber-200 transition-all duration-300 transform hover:-translate-y-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <LogIn size={16} />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>

        {/* Botón menú móvil */}
        <button 
          className="md:hidden text-slate-700 p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-all duration-150 relative z-50"
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={24} className="text-amber-500" /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navegación móvil - Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 z-40 md:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
      
      {/* Navegación móvil - Panel */}
<div 
  className={`fixed top-0 left-0 right-0 bottom-0 w-full pt-[60px] h-screen z-50 bg-white/95 backdrop-blur-lg md:hidden transform transition-transform duration-300 shadow-xl ${
    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
  } pointer-events-auto overflow-hidden`}
>
        <div className="h-full overflow-y-auto py-8 px-6 flex flex-col">
              {/* Botón de cerrar menú */}
    <button
      onClick={toggleMenu}
      className="absolute top-4 right-4 text-slate-700 hover:text-amber-500 transition-colors z-50"
      aria-label="Cerrar menú"
    >
      <X size={28} />
    </button>
          <nav className="flex flex-col space-y-6 mb-10">
            <Link 
              to="/" 
              className={`flex items-center justify-between text-slate-800 text-lg font-medium border-b border-slate-200 pb-4 hover:text-amber-500 transition-colors ${isActive('/') ? 'text-amber-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              <span>Inicio</span>
              {isActive('/') && <span className="h-2 w-2 rounded-full bg-amber-500"></span>}
            </Link>
            <Link 
              to="/categoria/casa" 
              className={`flex items-center justify-between text-slate-800 text-lg font-medium border-b border-slate-200 pb-4 hover:text-amber-500 transition-colors ${isActive('/categoria/casa') ? 'text-amber-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              <span>Casas</span>
              {isActive('/categoria/casa') && <span className="h-2 w-2 rounded-full bg-amber-500"></span>}
            </Link>
            <Link 
              to="/categoria/departamento" 
              className={`flex items-center justify-between text-slate-800 text-lg font-medium border-b border-slate-200 pb-4 hover:text-amber-500 transition-colors ${isActive('/categoria/departamento') ? 'text-amber-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              <span>Departamentos</span>
              {isActive('/categoria/departamento') && <span className="h-2 w-2 rounded-full bg-amber-500"></span>}
            </Link>
            <Link 
              to="/categoria/terreno" 
              className={`flex items-center justify-between text-slate-800 text-lg font-medium border-b border-slate-200 pb-4 hover:text-amber-500 transition-colors ${isActive('/categoria/terreno') ? 'text-amber-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              <span>Terrenos</span>
              {isActive('/categoria/terreno') && <span className="h-2 w-2 rounded-full bg-amber-500"></span>}
            </Link>
            <Link 
              to="/nosotros" 
              className={`flex items-center justify-between text-slate-800 text-lg font-medium border-b border-slate-200 pb-4 hover:text-amber-500 transition-colors ${isActive('/nosotros') ? 'text-amber-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              <span>Nosotros</span>
              {isActive('/nosotros') && <span className="h-2 w-2 rounded-full bg-amber-500"></span>}
            </Link>
            <Link 
              to="/contacto" 
              className={`flex items-center justify-between text-slate-800 text-lg font-medium border-b border-slate-200 pb-4 hover:text-amber-500 transition-colors ${isActive('/contacto') ? 'text-amber-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              <span>Contacto</span>
              {isActive('/contacto') && <span className="h-2 w-2 rounded-full bg-amber-500"></span>}
            </Link>
          </nav>
          <div className="mt-auto py-6 flex justify-center">
            {user ? (
              <Link 
                to="/admin" 
                className="flex items-center justify-center gap-2 w-full border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-4 py-3.5 rounded-xl font-medium transition-all duration-300 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu();
                }}
              >
                <LayoutDashboard size={20} />
                <span>Panel Admin</span>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3.5 rounded-xl font-medium shadow-md hover:shadow-lg hover:shadow-amber-200/50 transition-all duration-300 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu();
                }}
              >
                <LogIn size={20} />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;