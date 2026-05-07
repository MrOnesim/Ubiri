import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setupPushNotifications } from './services/PushNotificationService';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Profil from './pages/Profil';
import About from './pages/About';
import Contact from './pages/Contact';
import DashboardUser from './pages/DashboardUser';
import DashboardWorker from './pages/DashboardWorker';
import RequestTracking from './pages/RequestTracking';
import Article from './pages/Article';
import GenericPage from './pages/GenericPage';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Toast from './components/Toast';
import Checkout from './pages/Checkout';
import Wallet from './pages/Wallet';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import CommunityFeed from './pages/CommunityFeed';
import ScrollToTop from './components/ScrollToTop';

function AppContent() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      setupPushNotifications(currentUser.id);
    }
  }, [currentUser]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toast />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/profil/:id" element={<Profil />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard/user" element={<DashboardUser />} />
        <Route path="/dashboard/worker" element={<DashboardWorker />} />
        <Route path="/tracking" element={<RequestTracking />} />
        <Route path="/article" element={<Article />} />
        <Route path="/page" element={<GenericPage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/checkout/:serviceId" element={<Checkout />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/community" element={<CommunityFeed />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
