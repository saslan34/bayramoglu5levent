import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import './Home.css';

const HERO_SLIDES = [
  {
    image: '/hero-1.jpg',
    title: 'Şehrin kalbi burada atıyor!',
    subtitle: '4 blokta 400 dairelik büyük bir aile sıcaklığı ve güven dolu bir yaşam.'
  },
  {
    image: '/hero-2.jpg',
    title: 'Modern Mimari & Konfor',
    subtitle: 'Estetik detaylar ve birinci sınıf işçilik ile hayalinizdeki yaşam alanları.'
  },
  {
    image: '/hero-3.jpg',
    title: 'Sosyal Tesisler & Yeşil Alanlar',
    subtitle: 'Geniş peyzaj alanları, spor salonu ve çocuk oyun alanlarıyla dolu dolu sosyal yaşam.'
  }
];

const PRIVILEGES = [
  {
    icon: 'fa-solid fa-map-location-dot',
    title: 'Merkezi Konum',
    desc: 'Ana ulaşım yollarına ve TEM bağlantısına yakın konumu sayesinde şehir içi ulaşımda kolay ve hızlı erişim imkânı.'
  },
  {
    icon: 'fa-solid fa-shield-halved',
    title: '7/24 Güvenlik',
    desc: 'Site giriş-çıkış kontrolü, kesintisiz kamera takip sistemi ve düzenli devriyeler ile güvenli bir yaşam ortamı.'
  },
  {
    icon: 'fa-solid fa-square-parking',
    title: 'Düzenli Otopark Sistemi',
    desc: 'Açık ve kapalı otopark alanları, otomatik plaka tanıma sistemi ve düzenli otopark yönetimi.'
  },
  {
    icon: 'fa-solid fa-tree',
    title: 'Sosyal Yaşam Alanları',
    desc: 'Geniş kamelyalar, modern çocuk oyun parkı ve ortak kullanım alanları ile komşuluk ilişkilerini destekleyen ortam.'
  },
  {
    icon: 'fa-solid fa-user-tie',
    title: 'Planlı Site Yönetimi',
    desc: 'Site yönetimi, teknik destek, güvenlik ve temizlik personeli ile ortak alanların düzenli işletilmesi.'
  },
  {
    icon: 'fa-solid fa-broom',
    title: 'Temiz ve Bakımlı Alanlar',
    desc: 'Blok içleri, asansörler ve çevre alanların düzenli dezenfeksiyonu, temizlik ve yeşil alan bakımı.'
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);

  // Resident Ticket Form States
  const [ticketData, setTicketData] = useState({
    fullName: '',
    phone: '',
    block: 'A Blok',
    aptNo: '',
    category: 'Teknik',
    title: '',
    detail: ''
  });
  const [ticketErrors, setTicketErrors] = useState({});
  const [submittedTicketId, setSubmittedTicketId] = useState('');

  useEffect(() => {
    // Fetch latest 3 announcements from dynamic DB
    const fetchAnn = async () => {
      const data = await db.getAnnouncements();
      setLatestAnnouncements(data.slice(0, 3));
    };
    fetchAnn();

    // Auto-advance hero carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  // Ticket form handlers
  const handleTicketInputChange = (e) => {
    const { name, value } = e.target;
    setTicketData({ ...ticketData, [name]: value });
    if (ticketErrors[name]) {
      setTicketErrors({ ...ticketErrors, [name]: '' });
    }
  };

  const validateTicketForm = () => {
    const errors = {};
    if (!ticketData.fullName.trim()) errors.fullName = 'Ad soyad zorunludur.';
    if (!ticketData.phone.trim()) errors.phone = 'Telefon zorunludur.';
    if (!ticketData.aptNo.trim()) errors.aptNo = 'Daire numarası zorunludur.';
    if (!ticketData.title.trim()) errors.title = 'Konu/Başlık zorunludur.';
    if (!ticketData.detail.trim()) errors.detail = 'Talep detayı zorunludur.';
    else if (ticketData.detail.length < 10) errors.detail = 'Lütfen en az 10 karakterlik açıklama yazın.';

    setTicketErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (validateTicketForm()) {
      const newTicket = await db.addTicket(ticketData);
      if (newTicket) {
        setSubmittedTicketId(newTicket.id);
        // Reset form
        setTicketData({
          fullName: '',
          phone: '',
          block: 'A Blok',
          aptNo: '',
          category: 'Teknik',
          title: '',
          detail: ''
        });
      }
    }
  };

  return (
    <div className="home-page fade-in">
      {/* Dynamic Hero Slider */}
      <section className="hero-slider">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`slide ${idx === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(${slide.image})` }}
          >
            <div className="slide-content container">
              <h1 className="slide-title">{slide.title}</h1>
              <p className="slide-subtitle">{slide.subtitle}</p>
              <div className="slide-actions">
                <Link to="/hakkimizda" className="btn btn-primary">Hakkımızda</Link>
                <Link to="/iletisim" className="btn btn-outline-white">İletişim</Link>
              </div>
            </div>
          </div>
        ))}
        <button className="slider-control prev" onClick={prevSlide} aria-label="Previous Slide">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button className="slider-control next" onClick={nextSlide} aria-label="Next Slide">
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="container stats-container">
          <div className="stat-item">
            <i className="fa-solid fa-building"></i>
            <div>
              <h3>4 Blok</h3>
              <p>Site Yerleşimi</p>
            </div>
          </div>
          <div className="stat-item">
            <i className="fa-solid fa-door-open"></i>
            <div>
              <h3>400 Daire</h3>
              <p>Bağımsız Bölüm</p>
            </div>
          </div>
          <div className="stat-item">
            <i className="fa-solid fa-person-shelter"></i>
            <div>
              <h3>1500+ Sakin</h3>
              <p>Mutlu Aile</p>
            </div>
          </div>
          <div className="stat-item">
            <i className="fa-solid fa-tree-city"></i>
            <div>
              <h3>%60 Yeşil Alan</h3>
              <p>Doğa Dostu Peyzaj</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privileges (Ayrıcalıklar) Section */}
      <section className="section-padding privileges-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Yaşam Ayrıcalıkları</h2>
            <p className="section-subtitle-text">5. Levent Bayramoğlu Sitesi sakinleri için sunulan benzersiz olanaklar.</p>
          </div>
          <div className="privileges-grid">
            {PRIVILEGES.map((item, idx) => (
              <div key={idx} className="privilege-card">
                <div className="privilege-icon-wrapper">
                  <i className={item.icon}></i>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Ticket / Incident Form Section */}
      <section className="section-padding ticket-form-section">
        <div className="container">
          <div className="ticket-section-layout">
            <div className="ticket-text-info">
              <h2 className="section-title text-left">Hızlı Talep & Arıza Bildirimi</h2>
              <p className="ticket-desc-p">
                Sitemiz içerisindeki ortak alanlarda karşılaştığınız teknik arızaları, temizlik ihtiyaçlarını veya yönetim ile ilgili her türlü talebinizi bu ekran üzerinden anında bildirebilirsiniz. 
              </p>
              <p className="ticket-desc-p">
                Gönderdiğiniz talepler doğrudan yönetim panelimize düşecek ve yöneticilerimiz tarafından ilgili teknik/temizlik personeline atanarak hızlıca çözülecektir.
              </p>
              <div className="ticket-features-badge-list">
                <div className="badge-item"><i className="fa-solid fa-bolt-lightning text-primary"></i> Hızlı İş Ataması</div>
                <div className="badge-item"><i className="fa-solid fa-circle-check text-primary"></i> Süreç Takibi</div>
                <div className="badge-item"><i className="fa-solid fa-users-gear text-primary"></i> Uzman Kadro</div>
              </div>
            </div>

            <div className="ticket-form-card">
              {submittedTicketId ? (
                <div className="ticket-success-view">
                  <div className="success-icon-check"><i className="fa-solid fa-circle-check"></i></div>
                  <h3>Talebiniz Alındı!</h3>
                  <p>Talebiniz başarıyla kaydedilmiş ve site yönetimine iletilmiştir.</p>
                  
                  <div className="ticket-id-badge">
                    <span>Talep Numarası</span>
                    <h2>#T-{submittedTicketId}</h2>
                  </div>
                  
                  <p className="notice-subtext">
                    Yöneticilerimiz talebinizi inceleyip en kısa sürede ilgili personele yönlendirecektir. Bu numarayı gerektiğinde sorgulama için saklayabilirsiniz.
                  </p>
                  <button className="btn btn-secondary mt-3" onClick={() => setSubmittedTicketId('')}>
                    Yeni Talep Oluştur
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="home-ticket-form">
                  <div className="form-row-two">
                    <div className="form-group">
                      <label className="form-label" htmlFor="fullName">Ad Soyad</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={ticketData.fullName}
                        onChange={handleTicketInputChange}
                        className={`form-control ${ticketErrors.fullName ? 'is-invalid' : ''}`}
                        placeholder="Adınız Soyadınız"
                      />
                      {ticketErrors.fullName && <span className="error-text">{ticketErrors.fullName}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Telefon</label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={ticketData.phone}
                        onChange={handleTicketInputChange}
                        className={`form-control ${ticketErrors.phone ? 'is-invalid' : ''}`}
                        placeholder="05xx xxx xx xx"
                      />
                      {ticketErrors.phone && <span className="error-text">{ticketErrors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-row-two">
                    <div className="form-group">
                      <label className="form-label" htmlFor="block">Blok</label>
                      <select
                        id="block"
                        name="block"
                        value={ticketData.block}
                        onChange={handleTicketInputChange}
                        className="form-control"
                      >
                        <option value="A Blok">A Blok</option>
                        <option value="B Blok">B Blok</option>
                        <option value="C Blok">C Blok</option>
                        <option value="D Blok">D Blok</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="aptNo">Daire No</label>
                      <input
                        type="text"
                        id="aptNo"
                        name="aptNo"
                        value={ticketData.aptNo}
                        onChange={handleTicketInputChange}
                        className={`form-control ${ticketErrors.aptNo ? 'is-invalid' : ''}`}
                        placeholder="Örn: Daire 12"
                      />
                      {ticketErrors.aptNo && <span className="error-text">{ticketErrors.aptNo}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="category">Talep Kategorisi</label>
                    <select
                      id="category"
                      name="category"
                      value={ticketData.category}
                      onChange={handleTicketInputChange}
                      className="form-control"
                    >
                      <option value="Teknik">Teknik (Arıza, Onarım)</option>
                      <option value="Temizlik">Temizlik (Blok, Ortak Alan)</option>
                      <option value="Güvenlik">Güvenlik (Giriş, Güvenlik İhlali)</option>
                      <option value="Peyzaj">Peyzaj (Bahçe, Sulama)</option>
                      <option value="Diğer">Diğer Talepler</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="title">Talep Konusu</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={ticketData.title}
                      onChange={handleTicketInputChange}
                      className={`form-control ${ticketErrors.title ? 'is-invalid' : ''}`}
                      placeholder="Kısa başlık girin"
                    />
                    {ticketErrors.title && <span className="error-text">{ticketErrors.title}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="detail">Açıklama / Detay</label>
                    <textarea
                      id="detail"
                      name="detail"
                      rows="4"
                      value={ticketData.detail}
                      onChange={handleTicketInputChange}
                      className={`form-control ${ticketErrors.detail ? 'is-invalid' : ''}`}
                      placeholder="Lütfen talebinizi detaylıca açıklayın..."
                    ></textarea>
                    {ticketErrors.detail && <span className="error-text">{ticketErrors.detail}</span>}
                  </div>

                  <button type="submit" className="btn btn-primary btn-submit-ticket">
                    Talebi İlet <i className="fa-regular fa-paper-plane"></i>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="section-padding latest-news-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Güncel Duyurular</h2>
            <p className="section-subtitle-text">Yönetimden en son haberler ve duyurular.</p>
          </div>
          <div className="announcements-grid">
            {latestAnnouncements.length > 0 ? (
              latestAnnouncements.map((ann) => (
                <div key={ann.id} className="ann-card">
                  <div className="ann-card-img" style={{ backgroundImage: `url(${ann.imageUrl})` }}>
                    <div className="ann-card-date">{ann.date}</div>
                  </div>
                  <div className="ann-card-body">
                    <h3>{ann.title}</h3>
                    <p>{ann.content.substring(0, 120)}...</p>
                    <Link to="/duyurular" className="ann-card-link">
                      Devamını Oku <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center" style={{ gridColumn: 'span 3' }}>Kayıtlı duyuru bulunmuyor.</p>
            )}
          </div>
          <div className="text-center mt-5">
            <Link to="/duyurular" className="btn btn-secondary">
              Tüm Duyuruları Gör <i className="fa-solid fa-list"></i>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
