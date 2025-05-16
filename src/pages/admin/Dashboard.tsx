import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Home, Bookmark, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProperties: 0,
    featuredProperties: 0,
    totalViews: 0
  });
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        if (!user) return;
        
        // Get property count
        const { count: totalCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // Get featured property count
        const { count: featuredCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_featured', true);
        
        // Get recent properties
        const { data: recentProps } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setStats({
          totalProperties: totalCount || 0,
          featuredProperties: featuredCount || 0,
          totalViews: 0 // This would be implemented with a proper view tracking system
        });
        
        setRecentProperties(recentProps || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <Link
          to="/admin/propiedades/nuevo"
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <span className="mr-2">Nueva propiedad</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Home size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Propiedades</p>
                  <p className="text-2xl font-semibold">{stats.totalProperties}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                  <Bookmark size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Propiedades Destacadas</p>
                  <p className="text-2xl font-semibold">{stats.featuredProperties}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Eye size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Visitas totales</p>
                  <p className="text-2xl font-semibold">{stats.totalViews}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-slate-800">Propiedades recientes</h2>
            </div>
            
            {recentProperties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentProperties.map((property) => (
                      <tr key={property.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{property.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{property.property_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {property.currency === 'UF'
                              ? `UF ${property.price.toLocaleString('es-CL')}`
                              : `CLP ${property.price.toLocaleString('es-CL')}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            property.is_featured
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {property.is_featured ? 'Destacada' : 'Normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/admin/propiedades/${property.id}`}
                            className="text-amber-600 hover:text-amber-900 mr-3"
                          >
                            Editar
                          </Link>
                          <Link
                            to={`/propiedad/${property.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            target="_blank"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No hay propiedades para mostrar
              </div>
            )}
            
            {recentProperties.length > 0 && (
              <div className="px-6 py-4 border-t">
                <Link
                  to="/admin/propiedades"
                  className="text-amber-600 hover:text-amber-900 font-medium"
                >
                  Ver todas las propiedades
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;