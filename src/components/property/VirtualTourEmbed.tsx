import React from 'react';

interface VirtualTourEmbedProps {
  url: string;
  title?: string;
}

const VirtualTourEmbed: React.FC<VirtualTourEmbedProps> = ({ url, title = "Tour Virtual" }) => {
  if (!url) return null;

  // Extraer el proveedor del tour virtual
  const isMatterport = url.includes('matterport.com');
  const isKuula = url.includes('kuula.co');
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  
  // Normalizar URL para embeber
  let embedUrl = url;
  
  if (isYoutube) {
    // Convertir URL de YouTube a formato embed
    const videoId = url.includes('youtu.be/') 
      ? url.split('youtu.be/')[1].split('?')[0]
      : url.includes('watch?v=') 
        ? url.split('watch?v=')[1].split('&')[0]
        : null;
        
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (isMatterport && !url.includes('embed')) {
    // Convertir Matterport URL a formato embed si es necesario
    const modelId = url.split('/models/')[1]?.split('/')[0];
    if (modelId) {
      embedUrl = `https://my.matterport.com/show/?m=${modelId}&play=1`;
    }
  } else if (isKuula && !url.includes('iframe')) {
    // Mantener URL de Kuula tal cual - se incrustará directamente
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="w-full aspect-video">
        <iframe 
          src={embedUrl}
          title={title}
          allowFullScreen
          frameBorder="0"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default VirtualTourEmbed;
