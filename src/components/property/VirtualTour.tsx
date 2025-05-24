import React from 'react';
import VirtualTourEmbed from './VirtualTourEmbed';

interface VirtualTourProps {
  tourUrl?: string;
  title?: string;
}

const VirtualTour: React.FC<VirtualTourProps> = ({ tourUrl, title }) => {
  if (!tourUrl) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">{title || "Tour Virtual"}</h3>
        </div>
        <div className="w-full h-[500px] flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">No hay tour virtual disponible para esta propiedad</p>
        </div>
      </div>
    );
  }

  return <VirtualTourEmbed url={tourUrl} title={title} />;
}

export default VirtualTour;