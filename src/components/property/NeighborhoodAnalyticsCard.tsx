import React from 'react';
import { School, ShoppingBag, Train, Leaf, Building, MapPin } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface ServicesNearby {
  count: number;
  distance: number;
}

export interface NeighborhoodData {
  schools_nearby?: ServicesNearby;
  shops_nearby?: ServicesNearby;
  transport_nearby?: ServicesNearby;
  green_areas_nearby?: ServicesNearby;
  services_nearby?: ServicesNearby;
  avg_square_meter_price?: number;
  annual_value_increase?: number;
  security_index?: number;
  life_quality_index?: number;
  demographics?: {
    families?: number;
    young_professionals?: number;
    retired?: number;
    students?: number;
  };
}

interface NeighborhoodAnalyticsCardProps {
  neighborhoodData: NeighborhoodData;
  currency: string;
}

const NeighborhoodAnalyticsCard: React.FC<NeighborhoodAnalyticsCardProps> = ({ 
  neighborhoodData,
  currency
}) => {
  const {
    schools_nearby = { count: 3, distance: 0.5 },
    shops_nearby = { count: 12, distance: 0.3 },
    transport_nearby = { count: 2, distance: 0.8 },
    green_areas_nearby = { count: 4, distance: 0.4 },
    services_nearby = { count: 8, distance: 0.6 },
    avg_square_meter_price = currency === 'UF' ? 65 : 2250000,
    annual_value_increase = 8.5,
    security_index = 85,
    life_quality_index = 92,
    demographics = {
      families: 40,
      young_professionals: 30,
      retired: 20,
      students: 10
    }
  } = neighborhoodData;
  
  // Datos para el gráfico de demografía
  const demographicsData = {
    labels: ['Familias', 'Jóvenes Profesionales', 'Jubilados', 'Estudiantes'],
    datasets: [{
      data: [
        demographics.families,
        demographics.young_professionals,
        demographics.retired,
        demographics.students
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
      ],
      borderWidth: 1,
    }],
  };
  
  const formatCurrency = (value: number) => {
    if (currency === 'UF') {
      return `UF ${value}`;
    } else {
      return new Intl.NumberFormat('es-CL', { 
        style: 'currency', 
        currency: 'CLP',
        maximumFractionDigits: 0
      }).format(value);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <MapPin className="w-6 h-6 text-amber-500 mr-2" />
          <h3 className="text-xl font-semibold">Análisis del Vecindario</h3>
        </div>
        
        {/* Bloque de Demografía y Servicios Cercanos */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Demografía */}
          <div>
            <h4 className="text-lg font-medium mb-4">Demografía</h4>
            <div className="h-64">
              <Pie data={demographicsData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          
          {/* Servicios Cercanos */}
          <div>
            <h4 className="text-lg font-medium mb-4">Servicios Cercanos</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <School className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Colegios</p>
                  <p className="text-sm text-gray-600">
                    {schools_nearby.count} {schools_nearby.count === 1 ? 'establecimiento' : 'establecimientos'} a {schools_nearby.distance} km
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <ShoppingBag className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Comercios</p>
                  <p className="text-sm text-gray-600">
                    {shops_nearby.count} {shops_nearby.count === 1 ? 'establecimiento' : 'establecimientos'} a {shops_nearby.distance} km
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <Train className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Transporte</p>
                  <p className="text-sm text-gray-600">
                    {transport_nearby.count} {transport_nearby.count === 1 ? 'establecimiento' : 'establecimientos'} a {transport_nearby.distance} km
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Áreas Verdes</p>
                  <p className="text-sm text-gray-600">
                    {green_areas_nearby.count} {green_areas_nearby.count === 1 ? 'establecimiento' : 'establecimientos'} a {green_areas_nearby.distance} km
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Servicios</p>
                  <p className="text-sm text-gray-600">
                    {services_nearby.count} {services_nearby.count === 1 ? 'establecimiento' : 'establecimientos'} a {services_nearby.distance} km
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Estadísticas del Sector */}
        <div>
          <h4 className="text-lg font-medium mb-4">Estadísticas del Sector</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatItem 
              title="Valor Promedio m²"
              value={formatCurrency(avg_square_meter_price)}
            />
            <StatItem 
              title="Plusvalía Anual"
              value={`+${annual_value_increase}%`}
            />
            <StatItem 
              title="Índice de Seguridad"
              value={`${security_index}/100`}
            />
            <StatItem 
              title="Calidad de Vida"
              value={`${life_quality_index}/100`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Eliminamos el componente ServiceItem ya que ahora usamos un diseño diferente

const StatItem = ({ title, value }: { title: string, value: string }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-xl font-bold text-amber-600 mt-1">{value}</p>
  </div>
);

export default NeighborhoodAnalyticsCard;
