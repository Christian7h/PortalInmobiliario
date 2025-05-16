import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, Home, LayoutDashboard, LogOut, Menu, Plus, UserCircle, X, Settings } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 z-50 flex flex-col w-64 bg-slate-800 transition-all duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <Link to="/" className="flex items-center space-x-2 text-white">
            <Building className="h-7 w-7 text-amber-400" />
            <span className="text-xl font-bold">PropPortal</span>
          </Link>
          <button 
            className="text-white md:hidden" 
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-slate-700 text-amber-400'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </NavLink>
            
            <NavLink 
              to="/admin/propiedades" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-slate-700 text-amber-400'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Home className="h-5 w-5 mr-3" />
              Propiedades
            </NavLink>
            
            <Link 
              to="/admin/propiedades/nuevo" 
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white rounded-md transition-colors"
            >
              <Plus className="h-5 w-5 mr-3" />
              Nueva propiedad
            </Link>
            
            <NavLink 
              to="/admin/perfil" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-slate-700 text-amber-400'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <UserCircle className="h-5 w-5 mr-3" />
              Mi perfil
            </NavLink>
            
            <NavLink 
              to="/admin/empresa" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-slate-700 text-amber-400'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Settings className="h-5 w-5 mr-3" />
              Perfil Empresa
            </NavLink>
          </nav>
          
          <div className="p-4 border-t border-slate-700">
            <button 
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-white rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-4 py-3">
            <button 
              className="text-gray-700 md:hidden" 
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center space-x-3">
              <span className="text-gray-700">
                {user?.email}
              </span>
              <div className="bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center">
                <UserCircle className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;