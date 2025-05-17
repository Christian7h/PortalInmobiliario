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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
      className={`sticky top-0 z-40 w-full backdrop-blur-lg backdrop-saturate-[180%] ${
        scrolled 
          ? 'py-3 shadow-sm border-b border-slate-200/70 bg-white/90' 
          : 'py-5 bg-white/80'
      } transition-all duration-300 pointer-events-none`}
      onClick={stopPropagation}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between pointer-events-auto">
        {/* Logo y nombre de la empresa */}
        <Link to="/" className="flex items-center gap-3 group transition-opacity duration-300 hover:opacity-80">
          {companyProfile?.logo_url ? (
            <img src={companyProfile.logo_url} alt="Logo" className="h-9 w-auto" />
          ) : (
            <Building className="h-7 w-7 text-amber-500" />
          )}
          <span className="text-xl font-semibold tracking-tight text-slate-800">
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
          className="md:hidden text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navegación móvil */}
      <div 
        className={`fixed inset-0 top-[60px] z-30 bg-white/90 backdrop-blur-lg md:hidden transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } pointer-events-auto`}
        onClick={stopPropagation}
      >
        <div className="h-full overflow-y-auto py-6 px-6 flex flex-col">
          <nav className="flex flex-col space-y-6 mb-10">
            <Link 
              to="/" 
              className="text-slate-800 text-lg font-medium border-b border-slate-100 pb-3"
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              Inicio
            </Link>
            <Link 
              to="/categoria/casa" 
              className="text-slate-800 text-lg font-medium border-b border-slate-100 pb-3"
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              Casas
            </Link>
            <Link 
              to="/categoria/departamento" 
              className="text-slate-800 text-lg font-medium border-b border-slate-100 pb-3"
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              Departamentos
            </Link>
            <Link 
              to="/categoria/terreno" 
              className="text-slate-800 text-lg font-medium border-b border-slate-100 pb-3"
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              Terrenos
            </Link>
            <Link 
              to="/nosotros" 
              className="text-slate-800 text-lg font-medium border-b border-slate-100 pb-3"
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              Nosotros
            </Link>
            <Link 
              to="/contacto" 
              className="text-slate-800 text-lg font-medium border-b border-slate-100 pb-3"
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              Contacto
            </Link>
          </nav>
          <div className="mt-auto flex justify-center">
            {user ? (
              <Link 
                to="/admin" 
                className="flex items-center justify-center gap-2 w-full border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-4 py-3 rounded-xl font-medium transition-colors duration-300"
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
                className="flex items-center justify-center gap-2 w-full bg-amber-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300"
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