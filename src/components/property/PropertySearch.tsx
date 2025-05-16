import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, DollarSign, MapPin, Filter, Bed, Bath } from 'lucide-react';
import type { PropertyType, Currency } from '../../types';

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'casa', label: 'Casas' },
  { value: 'departamento', label: 'Departamentos' },
  { value: 'oficina', label: 'Oficinas' },
  { value: 'local', label: 'Locales' },
  { value: 'bodega', label: 'Bodegas' },
  { value: 'industrial', label: 'Industriales' },
  { value: 'terreno', label: 'Terrenos' },
  { value: 'parcela', label: 'Parcelas' },
  { value: 'sitio', label: 'Sitios' },
  { value: 'loteo', label: 'Loteos' },
  { value: 'agricola', label: 'Agrícolas' },
];

const bedroomOptions = [
  { value: '', label: 'Cualquiera' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

const bathroomOptions = [
  { value: '', label: 'Cualquiera' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

const PropertySearch: React.FC = () => {
  const [selectedType, setSelectedType] = useState<PropertyType>('casa');
  const [location, setLocation] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('CLP');
  const [minBedrooms, setMinBedrooms] = useState('');
  const [minBathrooms, setMinBathrooms] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construir query params
    const params = new URLSearchParams();
    
    if (location) params.append('location', location);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (currency) params.append('currency', currency);
    if (minBedrooms) params.append('minBedrooms', minBedrooms);
    if (minBathrooms) params.append('minBathrooms', minBathrooms);
    
    navigate(`/categoria/${selectedType}?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto -mt-16 relative z-10">
      <form onSubmit={handleSearch}>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <Home size={16} className="mr-1 text-amber-500" />
                Tipo de Propiedad
              </div>
            </label>
            <select
              id="propertyType"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as PropertyType)}
            >
              {propertyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <MapPin size={16} className="mr-1 text-amber-500" />
                Ciudad o Comuna
              </div>
            </label>
            <input
              type="text"
              id="location"
              placeholder="Ej: Santiago, Providencia, etc."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-amber-600 font-medium py-3 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center"
          >
            <Filter size={18} className="mr-2" />
            {showAdvanced ? 'Ocultar filtros' : 'Más filtros'}
          </button>

          <button
            type="submit"
            className="bg-amber-500 text-white font-medium py-3 px-6 rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center"
          >
            <Search size={20} className="mr-2" />
            Buscar
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <DollarSign size={16} className="mr-1 text-amber-500" />
                  Precio
                </div>
              </label>
              <div className="flex items-center gap-2">
                <select
                  className="w-24 p-2 border border-gray-300 rounded-md"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                >
                  <option value="CLP">CLP</option>
                  <option value="UF">UF</option>
                </select>
                <input
                  type="number"
                  placeholder="Mínimo"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Máximo"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Bed size={16} className="mr-1 text-amber-500" />
                  Dormitorios
                </div>
              </label>
              <select
                id="bedrooms"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={minBedrooms}
                onChange={(e) => setMinBedrooms(e.target.value)}
              >
                {bedroomOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Bath size={16} className="mr-1 text-amber-500" />
                  Baños
                </div>
              </label>
              <select
                id="bathrooms"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={minBathrooms}
                onChange={(e) => setMinBathrooms(e.target.value)}
              >
                {bathroomOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PropertySearch;