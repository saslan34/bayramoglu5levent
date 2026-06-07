import { useState, useEffect } from 'react';
import { db } from '../services/db';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // all, ongoing, planned

  useEffect(() => {
    // Fetch projects dynamically
    const fetchProj = async () => {
      const data = await db.getProjects();
      setProjects(data);
    };
    fetchProj();
  }, []);

  const ongoingProjects = projects.filter(p => p.status === 'ongoing');
  const plannedProjects = projects.filter(p => p.status === 'planned');

  // Categories helper
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Peyzaj': return 'fa-solid fa-seedling';
      case 'Otopark': return 'fa-solid fa-car';
      case 'Sosyal Tesis': return 'fa-solid fa-dumbbell';
      case 'Teknik/Güvenlik': return 'fa-solid fa-shield-halved';
      case 'Dekorasyon': return 'fa-solid fa-paint-roller';
      case 'Düzen/Hijyen': return 'fa-solid fa-soap';
      case 'Yönetim': return 'fa-solid fa-users-gear';
      default: return 'fa-solid fa-list-check';
    }
  };

  return (
    <div className="projects-page fade-in">
      {/* Page Hero Header */}
      <section className="page-hero">
        <div className="container">
          <h1>Projeler</h1>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Anasayfa</a></li>
            <li className="breadcrumb-item active">Projeler</li>
          </ul>
        </div>
      </section>

      {/* Intro Description */}
      <section className="intro-section container mt-5">
        <div className="intro-card">
          <p>
            Sitemizde yaşam kalitesini artırmak, ortak alanları iyileştirmek ve teknik altyapıyı güçlendirmek amacıyla çeşitli çalışmalar planlanmakta ve etaplar halinde hayata geçirilmektedir. Bu sayfada, sitemizde <strong>devam eden çalışmalar</strong> ile <strong>önümüzdeki dönemde değerlendirilmesi planlanan projeler</strong> hakkında genel bilgilere yer verilmektedir. Amacımız, site sakinlerinin yaşam alanlarını daha güvenli, düzenli ve konforlu hale getirecek iyileştirmeleri planlı ve sürdürülebilir bir şekilde gerçekleştirmektir.
          </p>
        </div>
      </section>

      {/* Tab Filter Navigation */}
      <section className="tab-navigation container">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          Tüm Projeler ({projects.length})
        </button>
        <button className={`tab-btn ongoing ${activeTab === 'ongoing' ? 'active' : ''}`} onClick={() => setActiveTab('ongoing')}>
          Devam Edenler ({ongoingProjects.length})
        </button>
        <button className={`tab-btn planned ${activeTab === 'planned' ? 'active' : ''}`} onClick={() => setActiveTab('planned')}>
          Planlananlar ({plannedProjects.length})
        </button>
      </section>

      {/* Board Layout */}
      <section className="section-padding board-section">
        <div className="container">
          <div className="boards-grid">
            {/* Ongoing Board */}
            {(activeTab === 'all' || activeTab === 'ongoing') && (
              <div className="board-column ongoing-column">
                <div className="board-header">
                  <span className="dot dot-ongoing"></span>
                  <h2>Devam Eden Projeler</h2>
                  <span className="count-badge">{ongoingProjects.length}</span>
                </div>
                <div className="board-content">
                  {ongoingProjects.map((p) => (
                    <div key={p.id} className="project-card-item ongoing">
                      <div className="proj-category">
                        <i className={getCategoryIcon(p.category)}></i>
                        <span>{p.category}</span>
                      </div>
                      <h3>{p.title}</h3>
                      <div className="progress-bar-wrapper">
                        <div className="progress-bar-fill animated-bar"></div>
                        <span className="progress-text">Yapım Aşamasında</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Planned Board */}
            {(activeTab === 'all' || activeTab === 'planned') && (
              <div className="board-column planned-column">
                <div className="board-header">
                  <span className="dot dot-planned"></span>
                  <h2>Planlanan Projeler</h2>
                  <span className="count-badge">{plannedProjects.length}</span>
                </div>
                <div className="board-content">
                  {plannedProjects.map((p) => (
                    <div key={p.id} className="project-card-item planned">
                      <div className="proj-category">
                        <i className={getCategoryIcon(p.category)}></i>
                        <span>{p.category}</span>
                      </div>
                      <h3>{p.title}</h3>
                      <div className="progress-bar-wrapper">
                        <div className="progress-bar-empty"></div>
                        <span className="progress-text planned">Planlama Aşamasında</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
