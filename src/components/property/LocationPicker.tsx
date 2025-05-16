import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrigiendo el problema de íconos de Leaflet en el entorno de React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configurar el ícono por defecto para los marcadores de Leaflet
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

interface LocationPickerProps {
  initialPosition?: [number, number];
  onLocationChange: (lat: number, lng: number) => void;
}

// Componente para manejar los eventos del mapa
const MapEventsHandler = ({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    }
  });
  
  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ initialPosition, onLocationChange }) => {
  // Santiago de Chile como ubicación por defecto si no hay una inicial
  const [position, setPosition] = useState<[number, number]>(
    initialPosition || [-33.447487, -70.673676]
  );
  
  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);
  
  const handleLocationChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };
  
  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Haz clic en el mapa para seleccionar la ubicación de la propiedad.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <div><strong>Latitud:</strong> {position[0].toFixed(6)}</div>
          <div><strong>Longitud:</strong> {position[1].toFixed(6)}</div>
        </div>
      </div>
      <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={defaultIcon} />
          <MapEventsHandler onLocationChange={handleLocationChange} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationPicker;
