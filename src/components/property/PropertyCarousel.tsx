import { useRef, useEffect } from 'react';
import { register } from 'swiper/element/bundle';
import PropertyCard from './PropertyCard';
import type { Property } from '../../types';
import './PropertyCarousel.css'; // Importar estilos CSS personalizados

// Registra los componentes personalizados de Swiper
register();

interface PropertyCarouselProps {
  properties: Property[];
  title: string;
  viewAllLink: string;
  slidesPerView?: number;
  autoplay?: boolean;
  featured?: boolean;
}

// Extendemos las interfaces JSX directamente sin usar namespace
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'swiper-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        navigation?: string;
        pagination?: string;
        'pagination-clickable'?: string;
        autoplay?: string;
        loop?: string;
        rewind?: string;
        'space-between'?: string;
        'slides-per-view'?: string;
        init?: string;
        'breakpoints-480-slides-per-view'?: string;
        'breakpoints-640-slides-per-view'?: string;
        'breakpoints-768-slides-per-view'?: string;
        'breakpoints-1024-slides-per-view'?: string;
        'breakpoints-1280-slides-per-view'?: string;
        className?: string;
      };
      'swiper-slide': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ 
  properties, 
  title, 
  viewAllLink, 
  slidesPerView = 5, // Cambiado a 5 por defecto
  autoplay = true,
  featured = false
}) => {
  const swiperElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Configuración de Swiper
    const swiperEl = swiperElRef.current;
    if (!swiperEl) return;

    // Comprobamos si ya existe una instancia inicializada para evitar duplicaciones
    // @ts-expect-error: La interfaz TypeScript puede no estar actualizada
    if (swiperEl.swiper && typeof swiperEl.swiper.destroy === 'function') {
      // @ts-expect-error: La interfaz TypeScript puede no estar actualizada
      swiperEl.swiper.destroy(true, true);
    }

    // Configuración responsive
    const swiperParams = {
      injectStyles: [
        `
          :host {
            --swiper-theme-color: #f59e0b;
            --swiper-navigation-size: 24px;
          }
        `
      ],
      slidesPerView: 1,  // Por defecto muestra 1 en móviles muy pequeños
      spaceBetween: 20,
      navigation: {
        enabled: true,
        hideOnClick: false
      },
      loop: false,
      rewind: true, // Añade la capacidad de "rebobinar" al principio cuando se presiona siguiente en el último slide
      autoplay: autoplay ? {
        delay: 3000,
        disableOnInteraction: false,
        stopOnLastSlide: true // Detiene el autoplay al llegar al último slide
      } : false,
      breakpoints: {
        // Estos son los puntos de quiebre donde cambia el número de tarjetas mostradas
        // Móvil pequeño
        480: { 
          slidesPerView: 1,
          spaceBetween: 10
        },
        // Móvil grande
        640: { 
          slidesPerView: 2,
          spaceBetween: 15
        },
        // Tablet
        768: { 
          slidesPerView: 3,
          spaceBetween: 15
        },
        // Laptop pequeña
        1024: { 
          slidesPerView: 4,
          spaceBetween: 20
        },
        // Desktop/Laptop grande
        1280: { 
          slidesPerView: slidesPerView  // Usar el valor que viene como prop (5 por defecto)
        },
      },
      on: {
        init() {
          // Inicializado correctamente
        },
        slideChange() {
          // Evento de cambio de slide
        }
      }
    };

    // La mejor forma de configurar los parámetros
    Object.assign(swiperEl, swiperParams);

    // Inicializar Swiper usando el método recomendado
    // Para garantizar que el elemento está definido
    const initSwiper = async () => {
      try {
        await customElements.whenDefined('swiper-container');
        await customElements.whenDefined('swiper-slide');
        
        // Con esta pausa pequeña evitamos problemas de timing
        setTimeout(() => {
          // @ts-expect-error: La interfaz TypeScript puede no estar actualizada
          if (typeof swiperEl.initialize === 'function') {
            // @ts-expect-error: La interfaz TypeScript puede no estar actualizada
            swiperEl.initialize();
          } else {
            // Alternativa si no existe el método initialize
            Object.assign(swiperEl, swiperParams);
          }
        }, 0);
      } catch {
        // Error silenciado para evitar logs en consola
      }
    };
    
    initSwiper();
    
    // Limpieza al desmontar
    return () => {
      try {
        // @ts-expect-error: La interfaz TypeScript puede no estar actualizada
        if (swiperEl.swiper && typeof swiperEl.swiper.destroy === 'function') {
          // @ts-expect-error: La interfaz TypeScript puede no estar actualizada
          swiperEl.swiper.destroy(true, true);
        }
      } catch {
        // Error silenciado para evitar logs en consola
      }
    };
  }, [properties.length, slidesPerView, autoplay, featured]);

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <a href={viewAllLink} className="text-amber-600 hover:underline font-medium">
          Ver todo
        </a>
      </div>

      <div className="relative px-4 md:px-10">
        <swiper-container
          ref={swiperElRef}
          init="false"
          className={`property-swiper ${featured ? 'featured-swiper' : ''}`}
          navigation="true"
          pagination="true"
          pagination-clickable="true"
          space-between="20"
          slides-per-view="1"
          rewind="true"
          breakpoints-480-slides-per-view="1"
          breakpoints-640-slides-per-view="2"
          breakpoints-768-slides-per-view="3"
          breakpoints-1024-slides-per-view="4"
          breakpoints-1280-slides-per-view={slidesPerView.toString()}
          loop="false"
          autoplay={autoplay ? '{"delay": 3000, "disableOnInteraction": false, "stopOnLastSlide": true}' : "false"}
        >
          {properties.map((property) => (
            <swiper-slide key={property.id}>
              <PropertyCard property={property} />
            </swiper-slide>
          ))}
        </swiper-container>
      </div>
    </div>
  );
};

export default PropertyCarousel;
