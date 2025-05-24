import { useEffect } from 'react';
import { MapPin, School, ShoppingBag, Train, Sparkle as Park, Building2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface NeighborhoodAnalyticsProps {
  latitude: number;
  longitude: number;
}

const NeighborhoodAnalytics: React.FC<NeighborhoodAnalyticsProps> = ({ latitude, longitude }) => {
  const demographicsData = {
    labels: ['Familias', 'Jóvenes Profesionales', 'Jubilados', 'Estudiantes'],
    datasets: [{
      data: [40, 30, 20, 10],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
      ],
      borderWidth: 1,
    }],
  };

  const amenities = [
    { icon: School, name: 'Colegios', distance: '0.5 km', count: 3 },
    { icon: ShoppingBag, name: 'Comercios', distance: '0.3 km', count: 12 },
    { icon: Train, name: 'Transporte', distance: '0.8 km', count: 2 },
    { icon: Park, name: 'Áreas Verdes', distance: '0.4 km', count: 4 },
    { icon: Building2, name: 'Servicios', distance: '0.6 km', count: 8 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <MapPin className="w-6 h-6 text-amber-500 mr-2" />
        <h3 className="text-xl font-semibold">Análisis del Vecindario</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-medium mb-4">Demografía</h4>
          <div className="h-64">
            <Pie data={demographicsData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium mb-4">Servicios Cercanos</h4>
          <div className="space-y-4">
            {amenities.map((amenity) => (
              <div key={amenity.name} className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <amenity.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">{amenity.name}</p>
                  <p className="text-sm text-gray-600">
                    {amenity.count} establecimientos a {amenity.distance}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-medium mb-4">Estadísticas del Sector</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Valor Promedio m²</p>
            <p className="text-xl font-bold text-amber-600">UF 65</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Plusvalía Anual</p>
            <p className="text-xl font-bold text-amber-600">+8.5%</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Índice de Seguridad</p>
            <p className="text-xl font-bold text-amber-600">85/100</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Calidad de Vida</p>
            <p className="text-xl font-bold text-amber-600">92/100</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodAnalytics;