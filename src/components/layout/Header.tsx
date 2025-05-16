import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, Menu, X, LogIn } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanyProfile } from '../../lib/api';
import { CompanyProfile } from '../../types';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  
  // Usamos useQuery para obtener y memorizar el perfil de la empresa
  const { data: companyProfile } = useQuery<CompanyProfile, Error>({
    queryKey: ['companyProfile'],
    queryFn: fetchCompanyProfile,
    staleTime: 1000 * 60 * 20, // 20 minutos antes de considerar los datos obsoletos
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            {companyProfile?.logo_url ? (
              <img src={companyProfile.logo_url} alt="Logo" className="h-8 w-auto" />
            ) : (
              <Building className="h-8 w-8 text-amber-400" />
            )}
            <span className="text-2xl font-bold">{companyProfile?.company_name || 'PropPortal'}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-amber-400 transition-colors">Inicio</Link>
            <Link to="/categoria/casa" className="hover:text-amber-400 transition-colors">Casas</Link>
            <Link to="/categoria/departamento" className="hover:text-amber-400 transition-colors">Departamentos</Link>
            <Link to="/categoria/terreno" className="hover:text-amber-400 transition-colors">Terrenos</Link>
            <Link to="/nosotros" className="hover:text-amber-400 transition-colors">Nosotros</Link>
            <Link to="/contacto" className="hover:text-amber-400 transition-colors">Contacto</Link>
            
            {user ? (
              <Link 
                to="/admin" 
                className="flex items-center space-x-1 font-medium text-amber-400 hover:underline"
              >
                Panel Admin
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-1 font-medium text-amber-400 hover:underline"
              >
                <LogIn size={18} />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-slate-700 py-4 px-4">
          <div className="flex flex-col space-y-3">
            <Link to="/" className="hover:text-amber-400 transition-colors" onClick={toggleMenu}>Inicio</Link>
            <Link to="/categoria/casa" className="hover:text-amber-400 transition-colors" onClick={toggleMenu}>Casas</Link>
            <Link to="/categoria/departamento" className="hover:text-amber-400 transition-colors" onClick={toggleMenu}>Departamentos</Link>
            <Link to="/categoria/terreno" className="hover:text-amber-400 transition-colors" onClick={toggleMenu}>Terrenos</Link>
            <Link to="/nosotros" className="hover:text-amber-400 transition-colors" onClick={toggleMenu}>Nosotros</Link>
            <Link to="/contacto" className="hover:text-amber-400 transition-colors" onClick={toggleMenu}>Contacto</Link>
            
            {user ? (
              <Link 
                to="/admin" 
                className="flex items-center space-x-1 font-medium text-amber-400 hover:underline"
                onClick={toggleMenu}
              >
                Panel Admin
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-1 font-medium text-amber-400 hover:underline"
                onClick={toggleMenu}
              >
                <LogIn size={18} />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;