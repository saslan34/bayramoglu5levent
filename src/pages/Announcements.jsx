import { useState, useEffect } from 'react';
import { db } from '../services/db';
import './Announcements.css';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnn, setSelectedAnn] = useState(null);

  useEffect(() => {
    // Load announcements dynamically
    const fetchAnn = async () => {
      const data = await db.getAnnouncements();
      setAnnouncements(data);
    };
    fetchAnn();
  }, []);

  useEffect(() => {
    if (selectedAnn) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedAnn]);

  const filteredAnnouncements = announcements.filter(ann =>
    ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ann.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDetails = (ann) => {
    setSelectedAnn(ann);
  };

  const closeDetails = () => {
    setSelectedAnn(null);
  };

  return (
    <div className="announcements-page fade-in">
      {/* Page Hero Header */}
      <section className="page-hero">
        <div className="container">
          <h1>Duyurular</h1>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Anasayfa</a></li>
            <li className="breadcrumb-item active">Duyurular</li>
          </ul>
        </div>
      </section>

      {/* Filter and Search Section */}
      <section className="search-section container">
        <div className="search-bar-wrapper">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="Duyurularda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control search-input"
          />
        </div>
      </section>

      {/* Announcements List Grid */}
      <section className="section-padding list-section">
        <div className="container">
          <div className="announcements-grid-full">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((ann) => (
                <div key={ann.id} className="ann-item-card" onClick={() => openDetails(ann)}>
                  <div className="ann-item-img-wrapper">
                    <img src={ann.imageUrl} alt={ann.title} className="ann-item-img" />
                    <span className="ann-item-date"><i className="fa-regular fa-calendar-days"></i> {ann.date}</span>
                  </div>
                  <div className="ann-item-content">
                    <h2 className="ann-item-title">{ann.title}</h2>
                    <p className="ann-item-excerpt">
                      {ann.content.length > 150 ? `${ann.content.substring(0, 150)}...` : ann.content}
                    </p>
                    <button className="btn-readmore">
                      Detayları Gör <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <i className="fa-regular fa-circle-question"></i>
                <p>Aramanızla eşleşen bir duyuru bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Detailed Modal Overlay */}
      {selectedAnn && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeDetails} aria-label="Close modal">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="modal-hero-img" style={{ backgroundImage: `url(${selectedAnn.imageUrl})` }}>
              <div className="modal-date-badge">
                <i className="fa-regular fa-calendar-days"></i> {selectedAnn.date}
              </div>
            </div>
            <div className="modal-body-content">
              <h2 className="modal-title">{selectedAnn.title}</h2>
              <div className="modal-divider"></div>
              <p className="modal-text">{selectedAnn.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
