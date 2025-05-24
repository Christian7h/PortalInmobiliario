import { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';

interface VirtualTourProps {
  panoramaUrl: string;
}

export default function VirtualTour({ panoramaUrl }: VirtualTourProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (containerRef.current && !viewerRef.current) {
      viewerRef.current = new Viewer({
        container: containerRef.current,
        panorama: panoramaUrl,
        navbar: [
          'zoom',
          'move',
          'fullscreen',
        ],
      });
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [panoramaUrl]);

  return (
    <div ref={containerRef} className="w-full h-[500px] rounded-lg overflow-hidden" />
  );
}