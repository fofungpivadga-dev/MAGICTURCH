import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import InstallPrompt from './components/InstallPrompt';
import Home from './pages/Home';
import Painters from './pages/Painters';
import PainterProfile from './pages/PainterProfile';
import Join from './pages/Join';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Gallery from './pages/Gallery';
import Seed from './pages/Seed';
import { motion, AnimatePresence } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/painters" element={<Painters />} />
            <Route path="/painters/:id" element={<PainterProfile />} />
            <Route path="/join" element={<Join />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/seed" element={<Seed />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="painter">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'toast-custom',
            style: {
              background: '#17181C',
              color: '#F5F0E8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#17181C' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#17181C' } },
          }}
        />
        <AnimatedRoutes />
        <InstallPrompt />
      </AuthProvider>
    </BrowserRouter>
  );
}
