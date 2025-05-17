import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TeamMember } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { uploadImage } from '../../lib/storage';
import { PlusCircle, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { queryClient } from '../../lib/queryClient';

const TeamMembersPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentMember, setCurrentMember] = useState<Partial<TeamMember>>({
    name: '',
    position: '',
    bio: '',
    email: '',
    phone: '',
    linkedin_url: '',
    twitter_url: '',
    instagram_url: '',
    order_number: 0,
    is_active: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Cargar miembros del equipo
  const fetchTeamMembers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('order_number', { ascending: true });
        
      if (error) throw error;
      
      setTeamMembers(data as TeamMember[]);
    } catch (error: any) {
      console.error('Error al cargar los miembros del equipo:', error);
      setError('Error al cargar los miembros del equipo');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTeamMembers();
  }, [user]);
  
  // Manejar la subida de la foto
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!user) {
      setError('Debes iniciar sesión para realizar esta acción');
      return;
    }
    
    if (!currentMember.name || !currentMember.position) {
      setError('El nombre y el cargo son obligatorios');
      return;
    }
    
    try {
      // Subir la foto si hay una nueva
      let photo_url = currentMember.photo_url;
      
      if (photoFile) {
        const uploadResult = await uploadImage(
          photoFile,
          'team-members',
          crypto.randomUUID()
        );
        
        if (uploadResult.error) throw uploadResult.error;
        photo_url = uploadResult.publicUrl;
      }
      
      const memberData = {
        ...currentMember,
        photo_url,
        user_id: user.id,
      };
      
      let result;
      
      if (isEditing && currentMember.id) {
        // Actualizar miembro existente
        result = await supabase
          .from('team_members')
          .update({
            ...memberData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentMember.id);
      } else {
        // Crear nuevo miembro
        result = await supabase
          .from('team_members')
          .insert([{
            ...memberData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
      }
      
      if (result.error) throw result.error;
      
      // Limpiar formulario y recargar datos
      setCurrentMember({
        name: '',
        position: '',
        bio: '',
        email: '',
        phone: '',
        linkedin_url: '',
        twitter_url: '',
        instagram_url: '',
        order_number: 0,
        is_active: true,
      });
      setPhotoFile(null);
      setPhotoPreview(null);
      setIsEditing(false);
      setSuccess(isEditing ? 'Miembro actualizado correctamente' : 'Miembro agregado correctamente');
      
      // Recargar los miembros del equipo
      await fetchTeamMembers();
      
      // Invalidar la caché de react-query para actualizar la página de Nosotros
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      
    } catch (error: any) {
      console.error('Error al guardar miembro del equipo:', error);
      setError('Error al guardar los datos. Por favor intenta de nuevo.');
    }
  };
  
  // Editar un miembro existente
  const handleEdit = (member: TeamMember) => {
    setCurrentMember(member);
    setPhotoPreview(member.photo_url || null);
    setIsEditing(true);
    setError(null);
    setSuccess(null);
    
    // Scroll al formulario
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Eliminar un miembro
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este miembro del equipo?')) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Recargar datos
      await fetchTeamMembers();
      setSuccess('Miembro eliminado correctamente');
      
      // Invalidar la caché de react-query
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    } catch (error: any) {
      console.error('Error al eliminar miembro:', error);
      setError('Error al eliminar miembro. Por favor intenta de nuevo.');
    }
  };
  
  // Mover un miembro arriba o abajo en el orden
  const handleReorder = async (memberId: string, direction: 'up' | 'down') => {
    const memberIndex = teamMembers.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return;
    
    // No permitir mover el primer elemento hacia arriba o el último hacia abajo
    if (
      (direction === 'up' && memberIndex === 0) || 
      (direction === 'down' && memberIndex === teamMembers.length - 1)
    ) {
      return;
    }
    
    const newTeamMembers = [...teamMembers];
    const targetIndex = direction === 'up' ? memberIndex - 1 : memberIndex + 1;
    
    // Intercambiar posiciones
    const temp = newTeamMembers[targetIndex];
    newTeamMembers[targetIndex] = newTeamMembers[memberIndex];
    newTeamMembers[memberIndex] = temp;
    
    // Actualizar order_number
    const updates = newTeamMembers.map((member, index) => ({
      id: member.id,
      order_number: index
    }));
    
    try {
      // Actualizar todos los miembros con sus nuevos órdenes
      for (const update of updates) {
        const { error } = await supabase
          .from('team_members')
          .update({ order_number: update.order_number })
          .eq('id', update.id);
          
        if (error) throw error;
      }
      
      // Recargar datos
      await fetchTeamMembers();
      
      // Invalidar la caché de react-query
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    } catch (error: any) {
      console.error('Error al reordenar miembros:', error);
      setError('Error al reordenar miembros. Por favor intenta de nuevo.');
    }
  };
  
  // Cancelar la edición
  const handleCancel = () => {
    setCurrentMember({
      name: '',
      position: '',
      bio: '',
      email: '',
      phone: '',
      linkedin_url: '',
      twitter_url: '',
      instagram_url: '',
      order_number: 0,
      is_active: true,
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión del Equipo</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Editar Miembro del Equipo' : 'Agregar Nuevo Miembro del Equipo'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                id="name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                value={currentMember.name}
                onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Cargo *
              </label>
              <input
                type="text"
                id="position"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                value={currentMember.position}
                onChange={(e) => setCurrentMember({ ...currentMember, position: e.target.value })}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Biografía
              </label>
              <textarea
                id="bio"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                value={currentMember.bio || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, bio: e.target.value })}
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                value={currentMember.email || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                id="phone"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                value={currentMember.phone || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, phone: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                URL de LinkedIn
              </label>
              <input
                type="url"
                id="linkedin"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                value={currentMember.linkedin_url || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                URL de Twitter
              </label>
              <input
                type="url"
                id="twitter"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                value={currentMember.twitter_url || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, twitter_url: e.target.value })}
                placeholder="https://twitter.com/username"
              />
            </div>
            
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                URL de Instagram
              </label>
              <input
                type="url"
                id="instagram"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                value={currentMember.instagram_url || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, instagram_url: e.target.value })}
                placeholder="https://instagram.com/username"
              />
            </div>
            
            <div>
              <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="is_active"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                value={currentMember.is_active ? 'true' : 'false'}
                onChange={(e) => setCurrentMember({ ...currentMember, is_active: e.target.value === 'true' })}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
                Foto
              </label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
            </div>
            
            {photoPreview && (
              <div className="mt-2">
                <img 
                  src={photoPreview} 
                  alt="Vista previa" 
                  className="h-32 w-32 object-cover rounded-md" 
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-amber-600"
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Miembros del Equipo</h2>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando...</p>
          </div>
        ) : teamMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay miembros del equipo registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className={!member.is_active ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.photo_url ? (
                        <img 
                          src={member.photo_url} 
                          alt={`Foto de ${member.name}`}
                          className="h-10 w-10 rounded-full object-cover" 
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">N/A</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      {member.email && (
                        <div className="text-sm text-gray-500">{member.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleReorder(member.id, 'up')}
                          disabled={teamMembers.indexOf(member) === 0}
                          className={`p-1 rounded-full hover:bg-gray-100 ${
                            teamMembers.indexOf(member) === 0 ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button 
                          onClick={() => handleReorder(member.id, 'down')}
                          disabled={teamMembers.indexOf(member) === teamMembers.length - 1}
                          className={`p-1 rounded-full hover:bg-gray-100 ${
                            teamMembers.indexOf(member) === teamMembers.length - 1 ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersPage;
