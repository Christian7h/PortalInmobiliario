import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Calendar, MapPin, Building2, ArrowUpDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Database } from '../../types/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

type SortField = 'created_at' | 'title' | 'price' | 'city';
type SortOrder = 'asc' | 'desc';

export default function AdminProperties() {
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortField, setSortField] = React.useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = React.useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchProperties();
  }, [sortField, sortOrder]);

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user?.id)
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredProperties = properties.filter(property => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProperties(properties.filter(property => property.id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency === 'UF' ? 'CLF' : 'CLP',
      minimumFractionDigits: currency === 'UF' ? 2 : 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Propiedades</h1>
          <p className="text-gray-600 mt-1">
            Administra tus {properties.length} propiedades
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar propiedades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <Link
            to="/admin/propiedades/nuevo"
            className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-600 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nueva Propiedad
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left cursor-pointer group"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 mr-1" />
                    Fecha
                    <ArrowUpDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left cursor-pointer group"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 mr-1" />
                    Propiedad
                    <ArrowUpDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left cursor-pointer group"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                    <ArrowUpDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left cursor-pointer group"
                  onClick={() => handleSort('city')}
                >
                  <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 mr-1" />
                    Ubicación
                    <ArrowUpDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr 
                  key={property.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(property.created_at), 'dd MMM yyyy', { locale: es })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(property.created_at), 'HH:mm', { locale: es })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                      {property.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(property.price, property.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{property.city}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{property.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => navigate(`/admin/propiedades/${property.id}`)}
                        className="text-amber-600 hover:text-amber-900 transition-colors"
                        title="Editar propiedad"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar propiedad"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay propiedades</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No se encontraron propiedades que coincidan con tu búsqueda.' : 'Comienza agregando una nueva propiedad.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  to="/admin/propiedades/nuevo"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nueva Propiedad
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}