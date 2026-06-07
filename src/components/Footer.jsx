import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col brand-col">
              <h3 className="footer-logo-title">5. Levent</h3>
              <p className="footer-logo-subtitle">Bayramoğlu Sitesi</p>
              <p className="footer-desc">
                4 blokta 400 dairelik büyük bir aile sıcaklığı ve güven dolu bir yaşam alanı sunuyoruz.
              </p>
              <div className="social-links">
                <a href="#!" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#!" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                <a href="#!" aria-label="Twitter"><i className="fa-brands fa-twitter"></i></a>
              </div>
            </div>

            <div className="footer-col links-col">
              <h4 className="footer-title">Hızlı Bağlantılar</h4>
              <ul className="footer-links">
                <li><Link to="/">Anasayfa</Link></li>
                <li><Link to="/duyurular">Duyurular</Link></li>
                <li><Link to="/projeler">Projeler</Link></li>
                <li><Link to="/hakkimizda">Hakkımızda</Link></li>
                <li><Link to="/iletisim">İletişim</Link></li>
              </ul>
            </div>

            <div className="footer-col contact-col">
              <h4 className="footer-title">İletişim Bilgileri</h4>
              <ul className="footer-contact">
                <li>
                  <i className="fa-solid fa-map-location-dot"></i>
                  <span>5. Levent, Fatih Sultan Mehmet Blv 20-1, 34060 Eyüpsultan/İstanbul</span>
                </li>
                <li>
                  <i className="fa-solid fa-phone"></i>
                  <a href="tel:08502250627">0 (850) 225 06 27</a>
                </li>
                <li>
                  <i className="fa-solid fa-envelope"></i>
                  <a href="mailto:info@5leventbayramoglu.com">info@5leventbayramoglu.com</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container bottom-container">
          <p className="copyright">
            &copy; {new Date().getFullYear()} <strong>5. Levent Bayramoğlu Sitesi</strong>. Tüm Hakları Saklıdır.
          </p>
          <div className="footer-legal-links">
            <a href="#!">KVKK Aydınlatma Metni</a>
            <a href="#!">Kullanım Koşulları</a>
            <a href="#!">Gizlilik Politikası</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
