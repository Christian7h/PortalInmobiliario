// filepath: src/components/layout/Layout.tsx
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { MessageCircleMore } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanyProfile } from '../../lib/api';
import { CompanyProfile } from '../../types';

const Layout = () => {
  // Usamos useQuery para obtener y memorizar el perfil de la empresa
  const { data: companyProfile } = useQuery<CompanyProfile, Error>({
    queryKey: ['companyProfile'],
    queryFn: fetchCompanyProfile,
    staleTime: 1000 * 60 * 20, // 20 minutos antes de considerar los datos obsoletos
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      {companyProfile?.whatsapp_number && (
        <div className="fixed bottom-8 right-8 z-50">
          <a
            href={`https://wa.me/${companyProfile.whatsapp_number.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircleMore size={28} />
          </a>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Layout;
