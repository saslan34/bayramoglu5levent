import './About.css';

const QUICK_FACTS = [
  { icon: 'fa-solid fa-hotel', text: 'Modern Site Yerleşimi' },
  { icon: 'fa-solid fa-map-location-dot', text: 'Merkezi ve Stratejik Konum' },
  { icon: 'fa-solid fa-house-chimney', text: '400 Bağımsız Bölüm' },
  { icon: 'fa-solid fa-square-parking', text: 'Geniş Açık & Kapalı Otopark' },
  { icon: 'fa-solid fa-shield-halved', text: '7/24 Kesintisiz Güvenlik' },
  { icon: 'fa-solid fa-tree', text: 'Zengin Peyzaj ve Yeşil Alanlar' },
  { icon: 'fa-solid fa-child-reaching', text: 'Güvenli Çocuk Oyun Parkları' },
  { icon: 'fa-solid fa-dumbbell', text: 'Tam Donanımlı Spor Salonu' },
  { icon: 'fa-solid fa-briefcase', text: 'Profesyonel Site Yönetimi' }
];

export default function About() {
  return (
    <div className="about-page fade-in">
      {/* Page Hero Header */}
      <section className="page-hero">
        <div className="container">
          <h1>Hakkımızda</h1>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Anasayfa</a></li>
            <li className="breadcrumb-item active">Hakkımızda</li>
          </ul>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="section-padding content-section">
        <div className="container about-container">
          <div className="about-grid-content">
            <div className="about-text-content">
              <h2>Modern Yaşamın ve Huzurun Adresi</h2>
              <div className="about-divider"></div>
              <p>
                <strong>5. Levent Bayramoğlu Sitesi</strong>, İstanbul'un Eyüpsultan ilçesinin hızla gelişen 5. Levent Mahallesi'nde yer alan modern bir konut yerleşimidir. Proje, KİPTAŞ öncülüğünde yürütülen kentsel dönüşüm süreci kapsamında, Türkiye'nin önde gelen gayrimenkul yatırım ortaklıklarından biri olan <strong>Torunlar GYO</strong> tarafından 2016 yılında hayata geçirilmiştir.
              </p>
              <p>
                4 blok ve 400 bağımsız daireden oluşan site yerleşimimiz, planlı mimari yapısı, geniş sosyal alanları ve sağlam teknik altyapısı ile sakinlerimize güvenli, düzenli ve konforlu bir yaşam alanı sunmayı hedeflemektedir.
              </p>
              <p>
                Sitemizde yaşamı kolaylaştıran ve sosyal ilişkileri güçlendiren pek çok ortak kullanım alanı bulunmaktadır. Peyzaj düzenlemeleri, çocuk oyun alanları, dinlenme kamelyaları ve spor alanları, site içerisinde huzurlu ve dinamik bir sosyal yaşam ortamı oluşturmak üzere tasarlanmıştır.
              </p>
            </div>

            <div className="about-image-showcase">
              <div className="main-showcase-img" style={{ backgroundImage: `url('/hero-1.jpg')` }}></div>
              <div className="side-showcase-imgs">
                <div className="side-img" style={{ backgroundImage: `url('/hero-2.jpg')` }}></div>
                <div className="side-img" style={{ backgroundImage: `url('/hero-3.jpg')` }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Facts Section */}
      <section className="section-padding facts-section">
        <div className="container text-center">
          <h2 className="section-title">Sitemiz Hakkında Kısa Bilgiler</h2>
          <p className="section-subtitle-text mb-5">5. Levent Bayramoğlu Sitesi'ni benzersiz kılan temel nicelikler.</p>
          
          <div className="facts-grid">
            {QUICK_FACTS.map((fact, idx) => (
              <div key={idx} className="fact-badge">
                <div className="fact-icon-wrapper">
                  <i className={fact.icon}></i>
                </div>
                <span>{fact.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
