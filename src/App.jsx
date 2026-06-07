import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Announcements from './pages/Announcements';
import Projects from './pages/Projects';
import About from './pages/About';
import Contact from './pages/Contact';
import ResidentLogin from './pages/ResidentLogin';
import ResidentPortal from './pages/ResidentPortal';

// Admin Pages
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Navbar/Footer Layout */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/duyurular"
          element={
            <Layout>
              <Announcements />
            </Layout>
          }
        />
        <Route
          path="/projeler"
          element={
            <Layout>
              <Projects />
            </Layout>
          }
        />
        <Route
          path="/hakkimizda"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/iletisim"
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />

        {/* Admin Login Gate */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin CMS Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Sakin Giriş ve Portal Rotaları */}
        <Route path="/sakin/login" element={<ResidentLogin />} />
        <Route
          path="/sakin/portal"
          element={
            <Layout>
              <ResidentPortal />
            </Layout>
          }
        />

        {/* Fallback Catch-All Route */}
        <Route
          path="*"
          element={
            <Layout>
              <div className="container section-padding text-center">
                <h2>404 - Sayfa Bulunamadı</h2>
                <p className="mt-3">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
                <a href="/" className="btn btn-primary mt-4">Anasayfaya Dön</a>
              </div>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
