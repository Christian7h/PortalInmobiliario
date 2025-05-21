import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { Download, Mail, MessageCircle, Phone, Filter, Search, X } from 'lucide-react';
import type { Lead, LeadStatus } from '../../types';
import * as XLSX from 'xlsx';
import { fetchLeads, updateLeadStatus, updateLeadNotes } from '../../lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const statusLabels = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Calificado',
  unqualified: 'No calificado',
  converted: 'Convertido'
};

const sourceLabels = {
  website: 'Sitio web',
  whatsapp: 'WhatsApp',
  email: 'Email'
};

export default function Leads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Usar React Query para obtener y actualizar los leads
  const { 
    data: leads = [], 
    isLoading: loading,
    isError
  } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => fetchLeads({
      status: filters.status || undefined,
      source: filters.source || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    }),
    enabled: !!user?.id
  });
  
  // Filtrar por búsqueda de texto
  const filteredLeads = leads.filter((lead: Lead) => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm) ||
      lead.phone.toLowerCase().includes(searchTerm) ||
      lead.message.toLowerCase().includes(searchTerm) ||
      lead.property?.title?.toLowerCase().includes(searchTerm) ||
      lead.property?.address?.toLowerCase().includes(searchTerm)
    );
  });

  const handleUpdateLeadStatus = async (leadId: string, status: LeadStatus) => {
    try {
      await updateLeadStatus(leadId, status);
      // Invalidar la consulta para que se actualice la lista
      queryClient.invalidateQueries({queryKey: ['leads']});
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };
  const handleUpdateLeadNotes = async () => {
    if (!selectedLead) return;

    try {
      await updateLeadNotes(selectedLead.id, notes);
      // Invalidar la consulta para que se actualice la lista
      queryClient.invalidateQueries({queryKey: ['leads']});
      // Cerrar el modal y limpiar los campos
      setSelectedLead(null);
      setNotes('');
    } catch (error) {
      console.error('Error al actualizar las notas del lead:', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      source: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  };

  function exportToExcel() {
    const data = filteredLeads.map(lead => ({
      'Fecha': format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: es }),
      'Nombre': lead.name,
      'Email': lead.email,
      'Teléfono': lead.phone,      'Estado': statusLabels[lead.status as keyof typeof statusLabels],
      'Origen': sourceLabels[lead.source as keyof typeof sourceLabels],
      'Propiedad': lead.property?.title || 'N/A',
      'Dirección': lead.property?.address || 'N/A',
      'Ciudad': lead.property?.city || 'N/A',
      'Último contacto': format(new Date(lead.last_contact), 'dd/MM/yyyy HH:mm', { locale: es }),
      'Notas': lead.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> No se pudieron cargar los leads.</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Leads</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 mr-1" />
            Filtros
          </button>
          
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar a Excel
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Filtros</h2>
            <button 
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-amber-600"
            >
              Restablecer filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Buscar..."
                  className="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                {filters.search && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              >
                <option value="">Todos</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
              <select
                name="source"
                value={filters.source}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              >
                <option value="">Todos</option>
                {Object.entries(sourceLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propiedad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron leads
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead: Lead) => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-gray-400 hover:text-gray-600"
                          title="Enviar email"
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-gray-400 hover:text-gray-600"
                          title="Llamar"
                        >
                          <Phone className="w-5 h-5" />
                        </a>
                        <a
                          href={`https://wa.me/${lead.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.property ? (
                        <a
                          href={`/propiedad/${lead.property.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-800"
                        >
                          {lead.property.title}
                        </a>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {sourceLabels[lead.source]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setNotes(lead.notes || '');
                        }}
                        className="text-amber-600 hover:text-amber-900"
                      >
                        Agregar nota
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Notas para {selectedLead.name}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Agregar notas sobre este lead..."
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedLead(null);
                  setNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateLeadNotes}
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}