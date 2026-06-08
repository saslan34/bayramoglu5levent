import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import './ResidentPortal.css';

export default function ResidentPortal() {
  const [activeTab, setActiveTab] = useState('dues'); // default to dues now
  const [purchases, setPurchases] = useState([]);
  const [finances, setFinances] = useState([]);
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  
  // Payment Modal States
  const [paymentModalDue, setPaymentModalDue] = useState(null);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const [currentUser] = useState(() => {
    const storedUser = sessionStorage.getItem('residentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [purchasesData, financesData, duesData] = await Promise.all([
        db.getPurchases(),
        db.getFinances(),
        db.getDuesForUser(currentUser?.id, currentUser?.username)
      ]);
      setPurchases(purchasesData);
      setFinances(financesData);
      setDues(duesData);
    } catch (err) {
      console.error("Finansal veriler yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('isResidentAuthenticated');
    if (isAuth !== 'true' || !currentUser) {
      navigate('/sakin/login');
      return;
    }

    // Defer data fetching to ensure it doesn't run synchronously in render phase
    Promise.resolve().then(() => {
      fetchData();
    });
  }, [currentUser, navigate, fetchData]);

  const handleLogout = () => {
    sessionStorage.removeItem('isResidentAuthenticated');
    sessionStorage.removeItem('residentUser');
    navigate('/');
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Payment Handlers
  const handleOpenPaymentModal = (due) => {
    setPaymentModalDue(due);
    setCardHolder('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setIsProcessing(false);
    setPaymentSuccess(false);
    setCardFlipped(false);
    setPaymentError('');
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setCardExpiry(value);
  };

  const handleCardCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');
    
    const cleanCardNum = cardNumber.replace(/\s/g, '');
    if (cleanCardNum.length !== 16) {
      setPaymentError('Lütfen 16 haneli kredi kartı numarasını girin.');
      return;
    }
    if (!cardHolder.trim()) {
      setPaymentError('Lütfen kart sahibinin adını girin.');
      return;
    }
    if (cardExpiry.length !== 5) {
      setPaymentError('Lütfen son kullanma tarihini girin (AA/YY).');
      return;
    }
    if (cardCvv.length !== 3) {
      setPaymentError('Lütfen 3 haneli CVV kodunu girin.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate transaction
    setTimeout(() => {
      setTimeout(async () => {
        try {
          const result = await db.payDue(
            paymentModalDue.id, 
            currentUser.id, 
            currentUser.username, 
            currentUser.fullName
          );
          if (result) {
            setPaymentSuccess(true);
            setIsProcessing(false);
            await fetchData();

            // Auto-close modal after 2.5 seconds
            setTimeout(() => {
              setPaymentModalDue(null);
            }, 2500);
          } else {
            throw new Error("Ödeme kaydedilemedi.");
          }
        } catch (err) {
          console.error("Payment registration failed:", err);
          setIsProcessing(false);
          setPaymentError('Ödeme işlemi sırasında veritabanı hatası oluştu. Lütfen tekrar deneyin.');
        }
      }, 1500);
    }, 1000);
  };

  const unpaidDuesTotal = dues
    .filter(d => d.status === 'unpaid')
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

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
        <div className="portal-summary-cards card-four-cols">
          <div className="summary-card bg-red-light">
            <div className="card-icon"><i className="fa-solid fa-circle-exclamation text-danger"></i></div>
            <div className="card-info">
              <h3 style={{ color: '#dc3545' }}>{formatCurrency(unpaidDuesTotal)}</h3>
              <p>Toplam Aidat Borcu</p>
            </div>
          </div>

          <div className="summary-card bg-primary-light">
            <div className="card-icon"><i className="fa-solid fa-wallet"></i></div>
            <div className="card-info">
              <h3>{purchases.length} Adet</h3>
              <p>Yapılan Satın Alma</p>
            </div>
          </div>
          
          <div className="summary-card bg-teal-light">
            <div className="card-icon"><i className="fa-solid fa-chart-line"></i></div>
            <div className="card-info">
              <h3>{finances[0] ? formatCurrency(finances[0].income) : '0,00 TL'}</h3>
              <p>Son Dönem Aidat Geliri ({finances[0]?.period || '-'})</p>
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
            className={`portal-tab-btn ${activeTab === 'dues' ? 'active' : ''}`}
            onClick={() => setActiveTab('dues')}
          >
            <i className="fa-solid fa-credit-card"></i> Aidat Sorgulama & Ödeme
          </button>
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

        {/* Tab Panel: Dues */}
        {activeTab === 'dues' && (
          <div className="portal-panel fade-in">
            <div className="panel-header">
              <h2>Aidat Borç Sorgulama ve Ödeme</h2>
              <p>Mevcut ve geçmiş dönem aidat borçlarınızı listeleyebilir, kredi kartınızla güvenli ödeme yapabilirsiniz.</p>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Dönem / Ay</th>
                    <th>Tutar</th>
                    <th>Son Ödeme Tarihi</th>
                    <th>Durum</th>
                    <th>Ödeme Tarihi</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {dues.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: '700', color: 'var(--primary-hover)' }}>{d.period}</td>
                      <td style={{ fontWeight: '700', color: d.status === 'paid' ? '#2e7d32' : '#dc3545' }}>{formatCurrency(d.amount)}</td>
                      <td>{d.due_date}</td>
                      <td>
                        <span className={`badge-status ${d.status}`}>
                          {d.status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                        </span>
                      </td>
                      <td>{d.payment_date || '-'}</td>
                      <td>
                        {d.status === 'unpaid' ? (
                          <button 
                            className="btn btn-primary btn-pay-due"
                            onClick={() => handleOpenPaymentModal(d)}
                          >
                            <i className="fa-solid fa-credit-card"></i> Kredi Kartı ile Öde
                          </button>
                        ) : (
                          <span className="payment-completed-text">
                            <i className="fa-solid fa-circle-check"></i> Ödeme Yapıldı
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {dues.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center empty-row">Kayıtlı aidat borcunuz bulunmamaktadır.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

        {/* Payment Modal */}
        {paymentModalDue && (
          <div className="portal-modal-overlay" onClick={() => !isProcessing && !paymentSuccess && setPaymentModalDue(null)}>
            <div className="portal-modal-card payment-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Kartla Aidat Ödeme</h2>
                {!isProcessing && !paymentSuccess && (
                  <button className="close-btn" onClick={() => setPaymentModalDue(null)}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
              <div className="portal-modal-body text-center">
                {paymentSuccess ? (
                  <div className="payment-success-animation">
                    <div className="success-checkmark">
                      <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                        <div className="icon-circle"></div>
                        <div className="icon-fix"></div>
                      </div>
                    </div>
                    <h3 className="success-title">Ödeme Başarılı!</h3>
                    <p className="success-desc">
                      {paymentModalDue.period} dönemine ait <strong>{formatCurrency(paymentModalDue.amount)}</strong> ödemeniz güvenli şekilde tahsil edilmiştir.
                    </p>
                    <p className="success-sub">Yönetim grubuna Telegram bildirimi gönderildi.</p>
                  </div>
                ) : isProcessing ? (
                  <div className="payment-processing-view">
                    <div className="credit-card-spinner">
                      <div className="double-bounce1"></div>
                      <div className="double-bounce2"></div>
                    </div>
                    <h3>Ödeme İşleniyor</h3>
                    <p>Lütfen bekleyiniz, banka provizyonu alınıyor...</p>
                  </div>
                ) : (
                  <div className="payment-form-layout">
                    {/* The 3D Credit Card */}
                    <div className={`flip-card ${cardFlipped ? 'flipped' : ''}`}>
                      <div className="flip-card-inner">
                        <div className="flip-card-front">
                          <div className="card-chip"></div>
                          <div className="card-logo">VISA</div>
                          <div className="card-number-display">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>
                          <div className="card-bottom-row">
                            <div className="card-holder-display">
                              <span className="card-label">Kart Sahibi</span>
                              <span className="card-val">{cardHolder.toUpperCase() || 'AD SOYAD'}</span>
                            </div>
                            <div className="card-expiry-display">
                              <span className="card-label">Son Kul.</span>
                              <span className="card-val">{cardExpiry || 'AA/YY'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flip-card-back">
                          <div className="card-magnetic-stripe"></div>
                          <div className="card-cvv-display">
                            <span className="card-label">CVV</span>
                            <div className="cvv-stripe">
                              <span>{cardCvv || '•••'}</span>
                            </div>
                          </div>
                          <div className="card-back-text">SECURE PAYMENT GATEWAY</div>
                        </div>
                      </div>
                    </div>

                    {paymentError && (
                      <div className="login-error-alert" style={{ margin: '1rem 0' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i> {paymentError}
                      </div>
                    )}

                    <form onSubmit={handlePaymentSubmit} className="credit-card-form">
                      <div className="form-group text-left">
                        <label className="form-label">Kart Numarası</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          onFocus={() => setCardFlipped(false)}
                          placeholder="0000 0000 0000 0000"
                          className="form-control card-input"
                          required
                        />
                      </div>
                      
                      <div className="form-group text-left">
                        <label className="form-label">Kart Sahibi</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          onFocus={() => setCardFlipped(false)}
                          placeholder="Kart Üzerindeki İsim"
                          className="form-control card-input"
                          required
                        />
                      </div>

                      <div className="form-row-two">
                        <div className="form-group text-left">
                          <label className="form-label">Son Kullanma Tarihi</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                            onFocus={() => setCardFlipped(false)}
                            placeholder="AA/YY"
                            className="form-control card-input"
                            required
                          />
                        </div>

                        <div className="form-group text-left">
                          <label className="form-label">CVV (Güvenlik Kodu)</label>
                          <input
                            type="text"
                            value={cardCvv}
                            onChange={handleCardCvvChange}
                            onFocus={() => setCardFlipped(true)}
                            onBlur={() => setCardFlipped(false)}
                            placeholder="000"
                            className="form-control card-input"
                            required
                          />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary btn-block payment-btn mt-3">
                        <i className="fa-solid fa-shield-halved"></i> {formatCurrency(paymentModalDue.amount)} Güvenli Öde
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
