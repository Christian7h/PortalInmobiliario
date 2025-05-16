import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { MessageCircleMore } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CompanyProfile } from '../../types';

const Layout = () => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('company_profile')
          .select('*')
          .single();
        
        if (error) {
          console.error('Error fetching company profile:', error);
        } else {
          setCompanyProfile(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCompanyProfile();
  }, []);

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
            className="flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
            aria-label="Contact via WhatsApp"
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