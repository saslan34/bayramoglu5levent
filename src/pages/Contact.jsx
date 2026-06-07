import { useState } from 'react';
import { db } from '../services/db';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'Ad soyad zorunludur.';
    else if (formData.fullName.length > 100) tempErrors.fullName = 'Ad soyad en fazla 100 karakter olabilir.';

    if (!formData.phone.trim()) tempErrors.phone = 'Telefon zorunludur.';
    else if (formData.phone.length > 20) tempErrors.phone = 'Telefon en fazla 20 karakter olabilir.';

    if (!formData.email.trim()) tempErrors.email = 'E-posta zorunludur.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = 'Geçerli bir e-posta adresi giriniz.';
    else if (formData.email.length > 150) tempErrors.email = 'E-posta en fazla 150 karakter olabilir.';

    if (!formData.subject.trim()) tempErrors.subject = 'Konu zorunludur.';
    else if (formData.subject.length < 3) tempErrors.subject = 'Konu en az 3 karakter olmalıdır.';
    else if (formData.subject.length > 150) tempErrors.subject = 'Konu en fazla 150 karakter olabilir.';

    if (!formData.message.trim()) tempErrors.message = 'Mesaj zorunludur.';
    else if (formData.message.length < 10) tempErrors.message = 'Mesaj en az 10 karakter olmalıdır.';
    else if (formData.message.length > 2000) tempErrors.message = 'Mesaj en fazla 2000 karakter olabilir.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      // Save message to Supabase inbox
      await db.addMessage(formData);
      setSuccess(true);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
      });
      // Clear success notification after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <div className="contact-page fade-in">
      {/* Page Hero Header */}
      <section className="page-hero">
        <div className="container">
          <h1>İletişim</h1>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Anasayfa</a></li>
            <li className="breadcrumb-item active">İletişim</li>
          </ul>
        </div>
      </section>

      {/* Contact Cards Section */}
      <section className="section-padding contact-info-cards container">
        <div className="contact-grid-info">
          <div className="info-card">
            <div className="info-card-icon-wrapper">
              <i className="fa-solid fa-map-location-dot"></i>
            </div>
            <h3>Adres</h3>
            <p>5. Levent, Fatih Sultan Mehmet Blv 20-1, 34060 Eyüpsultan/İstanbul</p>
          </div>

          <div className="info-card">
            <div className="info-card-icon-wrapper">
              <i className="fa-solid fa-phone"></i>
            </div>
            <h3>Telefon</h3>
            <p><a href="tel:08502250627">0 (850) 225 06 27</a></p>
            <span className="subtext">Hafta içi mesai saatlerinde ulaşabilirsiniz.</span>
          </div>

          <div className="info-card">
            <div className="info-card-icon-wrapper">
              <i className="fa-solid fa-envelope"></i>
            </div>
            <h3>E-Posta</h3>
            <p><a href="mailto:info@5leventbayramoglu.com">info@5leventbayramoglu.com</a></p>
            <span className="subtext">Genel bilgi ve talepleriniz için mail gönderebilirsiniz.</span>
          </div>
        </div>
      </section>

      {/* Form and Map Layout */}
      <section className="section-padding form-map-section">
        <div className="container form-map-grid">
          {/* Contact Form */}
          <div className="contact-form-wrapper">
            <h2>İletişim Formu</h2>
            <p className="form-intro-desc">Sitemiz ile ilgili her türlü talep, öneri ve bilgilendirme için formu doldurarak bizimle iletişime geçebilirsiniz.</p>
            
            {success && (
              <div className="alert alert-success">
                <i className="fa-solid fa-circle-check"></i> Mesajınız başarıyla iletildi! En kısa sürede dönüş sağlanacaktır.
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row-two">
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Ad Soyad</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Telefon</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">E-Posta</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subject">Konu</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                />
                {errors.subject && <span className="error-text">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Mesaj</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                ></textarea>
                {errors.message && <span className="error-text">{errors.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-submit-form">
                Gönder <i className="fa-regular fa-paper-plane"></i>
              </button>
            </form>
          </div>

          {/* Sidebar Hours and Maps */}
          <div className="contact-sidebar">
            <div className="working-hours-card">
              <h3>Çalışma Saatleri</h3>
              <ul className="hours-list">
                <li><span>Pazartesi - Cuma</span> <strong>08:30 - 17:30</strong></li>
                <li><span>Cumartesi</span> <strong>10:00 - 15:00</strong></li>
                <li><span>Pazar</span> <strong className="closed-text">Kapalı</strong></li>
                <li className="break-row"><span>Öğle Arası</span> <strong>12:00 - 13:00</strong></li>
              </ul>
              <p className="notice-text">* Resmî tatiller ve bayram günlerinde yönetim ofisimiz kapalıdır.</p>
            </div>

            <div className="map-card">
              <iframe
                title="5. Levent Bayramoğlu Sitesi Haritası"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3007.1048418307964!2d28.939137976739236!3d41.08855587133952!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab1148969f1f5%3A0x1a0828b4a3b47afd!2s5.%20Levent%20Bayramo%C4%9Flu%20Sitesi!5e0!3m2!1str!2str!4v1773157985427!5m2!1str!2str"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
