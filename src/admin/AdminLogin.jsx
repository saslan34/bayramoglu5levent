import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import './AdminLogin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const user = await db.authenticateUser(username, password);
    if (user) {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      sessionStorage.setItem('adminUser', JSON.stringify(user));
      navigate('/admin');
    } else {
      setError('Geçersiz kullanıcı adı veya şifre.');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-card-container">
        <div className="login-card">
          <div className="login-logo-area">
            <img src="/logo.png" alt="Logo" className="login-logo-img" />
            <h2>Yönetici Girişi</h2>
            <p>5. Levent Bayramoğlu Sitesi Yönetim Paneli</p>
          </div>

          {error && (
            <div className="login-error-alert">
              <i className="fa-solid fa-triangle-exclamation"></i> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Kullanıcı Adı</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adını yazın"
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Şifre</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi yazın"
                  className="form-control"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-btn">
              Giriş Yap <i className="fa-solid fa-arrow-right-to-bracket"></i>
            </button>
          </form>

          <div className="login-back-link">
            <a href="/"><i className="fa-solid fa-arrow-left"></i> Web Sitesine Dön</a>
          </div>
        </div>
      </div>
    </div>
  );
}
