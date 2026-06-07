import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleAdminClick = () => {
    closeMenu();
    navigate('/admin');
  };

  const isResident = sessionStorage.getItem('isResidentAuthenticated') === 'true';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo-link" onClick={closeMenu}>
          <img src="/logo.png" alt="5. Levent Bayramoğlu Sitesi" className="navbar-logo-img" />
          <div className="navbar-logo-text">
            <span className="logo-title">5. LEVENT</span>
            <span className="logo-subtitle">BAYRAMOĞLU SİTESİ</span>
          </div>
        </Link>

        <button className={`menu-toggle ${isOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle Navigation">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`nav-menu-wrapper ${isOpen ? 'open' : ''}`}>
          <div className="nav-menu">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              Anasayfa
            </NavLink>
            <NavLink to="/duyurular" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              Duyurular
            </NavLink>
            <NavLink to="/projeler" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              Projeler
            </NavLink>
            <NavLink to="/hakkimizda" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              Hakkımızda
            </NavLink>
            <NavLink to="/iletisim" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              İletişim
            </NavLink>
            <NavLink to={isResident ? "/sakin/portal" : "/sakin/login"} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              {isResident ? 'Sakin Paneli' : 'Sakin Girişi'}
            </NavLink>
            <button className="btn btn-primary btn-admin-nav" onClick={handleAdminClick}>
              <i className="fa-solid fa-user-gear"></i> Yönetim
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
