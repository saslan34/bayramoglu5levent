import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import './ResidentPortal.css';

export default function ResidentPortal() {
  const [activeTab, setActiveTab] = useState('purchases'); // purchases, finances
  const [purchases, setPurchases] = useState([]);
  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [currentUser] = useState(() => {
    const storedUser = sessionStorage.getItem('residentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = sessionStorage.getItem('isResidentAuthenticated');
    if (isAuth !== 'true' || !currentUser) {
      navigate('/sakin/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [purchasesData, financesData] = await Promise.all([
          db.getPurchases(),
          db.getFinances()
        ]);
        setPurchases(purchasesData);
        setFinances(financesData);
      } catch (err) {
        console.error("Finansal veriler yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('isResidentAuthenticated');
    sessionStorage.removeItem('residentUser');
    navigate('/');
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="resident-portal-page fade-in">
      {/* Header Banner */}
      <section className="portal-header-banner">
        <div className="container header-flex">
          <div>
            <h1>Sakin Bilgi ve Finans Portalı</h1>
            <p>5. Levent Bayramoğlu Sitesi Finansal Raporlama Ekranı</p>
          </div>
          {currentUser && (
            <div className="portal-user-badge">
              <span>Hoş geldiniz, <strong>{currentUser.fullName}</strong></span>
              <button className="btn btn-secondary btn-logout-portal" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i> Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="container portal-content-layout">
        
        {/* Info Grid */}
        <div className="portal-summary-cards">
          <div className="summary-card bg-primary-light">
            <div className="card-icon"><i className="fa-solid fa-wallet"></i></div>
            <div className="card-info">
              <h3>{purchases.length} Adet</h3>
              <p>Yapılan Toplam Satın Alma</p>
            </div>
          </div>
          
          <div className="summary-card bg-teal-light">
            <div className="card-icon"><i className="fa-solid fa-chart-line"></i></div>
            <div className="card-info">
              <h3>{finances[0] ? formatCurrency(finances[0].income) : '0,00 TL'}</h3>
              <p>Son Dönem Daire Aidat Geliri ({finances[0]?.period || '-'})</p>
            </div>
          </div>

          <div className="summary-card bg-yellow-light">
            <div className="card-icon"><i className="fa-solid fa-hand-holding-dollar"></i></div>
            <div className="card-info">
              <h3>{finances[0] ? formatCurrency(finances[0].expense) : '0,00 TL'}</h3>
              <p>Son Dönem Toplam Gider ({finances[0]?.period || '-'})</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="portal-tabs">
          <button 
            className={`portal-tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            <i className="fa-solid fa-cart-shopping"></i> Satın Alınan Malzemeler & Hizmetler
          </button>
          <button 
            className={`portal-tab-btn ${activeTab === 'finances' ? 'active' : ''}`}
            onClick={() => setActiveTab('finances')}
          >
            <i className="fa-solid fa-scale-balanced"></i> Aylık Gelir-Gider Tabloları
          </button>
        </div>

        {/* Tab Panel: Purchases */}
        {activeTab === 'purchases' && (
          <div className="portal-panel fade-in">
            <div className="panel-header">
              <h2>Satın Almalar Raporu</h2>
              <p>Site bütçesinden yapılan bakım, onarım, malzeme ve hizmet alımları listesi.</p>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Harcama Kalemi</th>
                    <th>Tutar</th>
                    <th>Tarih</th>
                    <th>Detaylar</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedPurchase(p)} 
                      style={{ cursor: 'pointer' }}
                      className="purchase-row-clickable"
                    >
                      <td style={{ fontWeight: '700', color: 'var(--primary-hover)' }}>{p.title}</td>
                      <td style={{ fontWeight: '700', color: '#dc3545' }}>{formatCurrency(p.amount)}</td>
                      <td>{p.date}</td>
                      <td>
                        <span className="btn-view-details">
                          <i className="fa-solid fa-receipt"></i> İncele
                        </span>
                      </td>
                    </tr>
                  ))}
                  {purchases.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center empty-row">Henüz satın alma kaydı bulunmamaktadır.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Panel: Finances */}
        {activeTab === 'finances' && (
          <div className="portal-panel fade-in">
            <div className="panel-header">
              <h2>Aylık Gelir-Gider Dengesi</h2>
              <p>Aylara göre toplam aidat/ortak alan gelirleri ve genel gider kalemleri tablosu.</p>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Dönem / Ay</th>
                    <th>Toplam Gelir (Aidat vb.)</th>
                    <th>Toplam Gider (Faturalar, Maaşlar vb.)</th>
                    <th>Aylık Bakiye (Kasa)</th>
                    <th>Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {finances.map((f) => {
                    const balance = f.income - f.expense;
                    return (
                      <tr key={f.id}>
                        <td style={{ fontWeight: '700', color: 'var(--primary-hover)' }}>{f.period}</td>
                        <td style={{ fontWeight: '700', color: '#2e7d32' }}>{formatCurrency(f.income)}</td>
                        <td style={{ fontWeight: '700', color: '#d32f2f' }}>{formatCurrency(f.expense)}</td>
                        <td style={{ fontWeight: '700', color: balance >= 0 ? '#2e7d32' : '#d32f2f' }}>
                          {formatCurrency(balance)}
                        </td>
                        <td>{f.description || '-'}</td>
                      </tr>
                    );
                  })}
                  {finances.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center empty-row">Henüz gelir-gider raporu bulunmamaktadır.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal: Purchase Detail */}
        {selectedPurchase && (
          <div className="portal-modal-overlay" onClick={() => setSelectedPurchase(null)}>
            <div className="portal-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Satın Alma Detayları</h2>
                <button className="close-btn" onClick={() => setSelectedPurchase(null)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="portal-modal-body">
                <div className="detail-field">
                  <label>Harcama Kalemi</label>
                  <h3>{selectedPurchase.title}</h3>
                </div>

                <div className="detail-grid-two">
                  <div className="detail-field">
                    <label>Tutar</label>
                    <p className="detail-amount">{formatCurrency(selectedPurchase.amount)}</p>
                  </div>
                  <div className="detail-field">
                    <label>Tarih</label>
                    <p>{selectedPurchase.date}</p>
                  </div>
                </div>

                <div className="detail-field">
                  <label>Açıklama</label>
                  <p className="detail-description">{selectedPurchase.description || 'Bu satın alma için ek açıklama girilmemiş.'}</p>
                </div>

                <div className="detail-field">
                  <label>Alınan Fiyat Teklifleri</label>
                  <div className="offers-box">
                    {selectedPurchase.offers ? (
                      <p style={{ whiteSpace: 'pre-line' }}>{selectedPurchase.offers}</p>
                    ) : (
                      <p className="no-data-text"><i className="fa-solid fa-circle-info"></i> Bu satın alma için teklif detayları girilmemiş.</p>
                    )}
                  </div>
                </div>

                <div className="detail-field">
                  <label>Harcama Faturası</label>
                  <div className="invoice-box">
                    {selectedPurchase.invoiceUrl ? (
                      <a 
                        href={selectedPurchase.invoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary btn-invoice-view"
                      >
                        <i className="fa-solid fa-file-pdf"></i> Faturayı Görüntüle / İndir
                      </a>
                    ) : (
                      <p className="no-data-text"><i className="fa-solid fa-circle-info"></i> Bu satın alma için fatura belgesi yüklenmemiş.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer-actions">
                <button className="btn btn-secondary" onClick={() => setSelectedPurchase(null)}>Kapat</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
