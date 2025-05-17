import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CompanyProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { uploadImage } from '../../lib/storage';

const CompanyProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({
    company_name: '',
    contact_email: '',
    contact_phone: '',    address: '',
    description: '',
    logo_url: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    whatsapp_number: '',
    mission: '',
    vision: '',
    values: '',
    history: '',
    years_experience: 0
  });
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchCompanyProfile = async () => {
      try {
        setLoading(true);
        
        // Verificar si ya existe un perfil de empresa
        const { data, error } = await supabase
          .from('company_profile')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 es el error "No se encontró ningún registro"
          throw error;
        }
        
        if (data) {
          setFormData({
            company_name: data.company_name || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            address: data.address || '',
            description: data.description || '',
            logo_url: data.logo_url || '',
            facebook_url: data.facebook_url || '',
            instagram_url: data.instagram_url || '',
            twitter_url: data.twitter_url || '',
            linkedin_url: data.linkedin_url || '',
            whatsapp_number: data.whatsapp_number || ''
          });
          setProfileId(data.id);
        }
      } catch (error) {
        console.error('Error al cargar el perfil de la empresa:', error);
        setError('Error al cargar los datos del perfil de la empresa');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const profileData = {
        ...formData,
        user_id: user.id
      };

      let result;

      if (profileId) {
        // Actualizar perfil existente
        result = await supabase
          .from('company_profile')
          .update(profileData)
          .eq('id', profileId);
      } else {
        // Crear nuevo perfil
        result = await supabase
          .from('company_profile')
          .insert(profileData);
      }

      if (result.error) {
        throw result.error;
      }

      setSuccess(true);
      
      // Si se creó un nuevo perfil, obtener su ID
      if (!profileId) {
        const { data } = await supabase
          .from('company_profile')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setProfileId(data.id);
        }
      }
    } catch (error) {
      console.error('Error al guardar el perfil de la empresa:', error);
      setError('Error al guardar los datos del perfil de la empresa');
    } finally {
      setSaving(false);
    }
  };
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      
      // Subir archivo a Supabase Storage usando nuestra función de utilidad
      const logoUrl = await uploadImage(file, 'company_logos');
      
      if (!logoUrl) {
        throw new Error('Error al subir el logo');
      }
      
      // Actualizar el estado con la URL del logo
      setFormData(prev => ({
        ...prev,
        logo_url: logoUrl
      }));
      
    } catch (error) {
      console.error('Error al subir el logo:', error);
      setError('Error al subir el logo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Perfil de la Empresa</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          El perfil de la empresa se ha guardado correctamente.
        </div>
      )}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-amber-600">Información Básica</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name || ''}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                  Email de Contacto *
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={formData.contact_email || ''}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone || ''}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción de la Empresa
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                  Logo de la Empresa
                </label>
                <div className="mt-1 flex items-center">
                  {formData.logo_url && (
                    <div className="mr-4">
                      <img src={formData.logo_url} alt="Logo" className="h-16 w-auto" />
                    </div>
                  )}
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
                <input
                  type="text"
                  id="logo_url"
                  name="logo_url"
                  value={formData.logo_url || ''}
                  onChange={handleChange}
                  placeholder="O ingresa la URL del logo"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Redes Sociales</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700">
                  Facebook URL
                </label>
                <input
                  type="url"
                  id="facebook_url"
                  name="facebook_url"
                  value={formData.facebook_url || ''}
                  onChange={handleChange}
                  placeholder="https://facebook.com/tuempresa"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700">
                  Instagram URL
                </label>
                <input
                  type="url"
                  id="instagram_url"
                  name="instagram_url"
                  value={formData.instagram_url || ''}
                  onChange={handleChange}
                  placeholder="https://instagram.com/tuempresa"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700">
                  Twitter URL
                </label>
                <input
                  type="url"
                  id="twitter_url"
                  name="twitter_url"
                  value={formData.twitter_url || ''}
                  onChange={handleChange}
                  placeholder="https://twitter.com/tuempresa"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url || ''}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/company/tuempresa"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700">
                  Número de WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp_number"
                  name="whatsapp_number"
                  value={formData.whatsapp_number || ''}
                  onChange={handleChange}
                  placeholder="+56912345678"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-200">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-amber-600">Información para la página "Nosotros"</h2>
          </div>
          
          <div>
            <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700">
              Años de experiencia
            </label>
            <input
              type="number"
              id="years_experience"
              name="years_experience"
              min="0"
              value={formData.years_experience || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="history" className="block text-sm font-medium text-gray-700">
              Historia de la empresa
            </label>
            <textarea
              id="history"
              name="history"
              rows={5}
              value={formData.history || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="Historia y trayectoria de la empresa..."
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="mission" className="block text-sm font-medium text-gray-700">
              Misión
            </label>
            <textarea
              id="mission"
              name="mission"
              rows={5}
              value={formData.mission || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="Misión de la empresa..."
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="vision" className="block text-sm font-medium text-gray-700">
              Visión
            </label>
            <textarea
              id="vision"
              name="vision"
              rows={5}
              value={formData.vision || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="Visión de la empresa..."
            ></textarea>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="values" className="block text-sm font-medium text-gray-700">
              Valores
            </label>
            <textarea
              id="values"
              name="values"
              rows={5}
              value={formData.values || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="Valores corporativos..."
            ></textarea>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfilePage;
