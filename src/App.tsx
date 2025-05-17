import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, createPersister } from './lib/queryClient';
import { startRealtimeSubscriptions } from './lib/realtimeSyncService';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import CategoryPage from './pages/CategoryPage';
import Contact from './pages/Contact';
import About from './pages/About';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/Properties';
import EditProperty from './pages/admin/EditProperty';
import CompanyProfile from './pages/admin/CompanyProfile';
import TeamMembers from './pages/admin/TeamMembers';
import Login from './pages/Login';
// import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const persister = createPersister();
  
  useEffect(() => {
    // Iniciamos las suscripciones en tiempo real para sincronizar la caché con Supabase
    const cleanupSubscriptions = startRealtimeSubscriptions();
    return () => cleanupSubscriptions(); // Limpiamos las suscripciones al desmontar
  }, []);
  
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: persister || undefined }}
    >
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="propiedad/:id" element={<PropertyDetail />} />
              <Route path="categoria/:type" element={<CategoryPage />} />
              <Route path="contacto" element={<Contact />} />
              <Route path="nosotros" element={<About />} />
              <Route path="login" element={<Login />} />
              {/* <Route path="registro" element={<Register />} /> */}
            </Route>
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="propiedades" element={<AdminProperties />} />
              <Route path="propiedades/nuevo" element={<EditProperty />} />
              <Route path="propiedades/:id" element={<EditProperty />} />
              <Route path="empresa" element={<CompanyProfile />} />
              <Route path="equipo" element={<TeamMembers />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}

export default App;