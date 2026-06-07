import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview'); // overview, announcements, projects, tickets, inbox, users, purchases, finances
  const [announcements, setAnnouncements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [finances, setFinances] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Logged-in User State
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = sessionStorage.getItem('adminUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // CMS States
  const [annForm, setAnnForm] = useState({ id: '', title: '', content: '', imageUrl: '' });
  const [projForm, setProjForm] = useState({ id: '', title: '', status: 'planned', category: 'Peyzaj' });
  const [userForm, setUserForm] = useState({ id: '', username: '', fullName: '', email: '', password: '', role: 'moderator' });
  const [staffForm, setStaffForm] = useState({ id: '', name: '', role: 'Teknik Şef' });
  const [purchForm, setPurchForm] = useState({ id: '', title: '', amount: '', date: '', description: '', invoiceUrl: '', offers: '' });
  const [finForm, setFinForm] = useState({ id: '', period: '', income: '', expense: '', description: '' });
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showPurchModal, setShowPurchModal] = useState(false);
  const [showFinModal, setShowFinModal] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  // Ticket Filter States
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [ticketCatFilter, setTicketCatFilter] = useState('all');

  const navigate = useNavigate();

  // Access check helper
  const hasAccess = (section) => {
    if (!currentUser) return false;
    const role = currentUser.role;
    if (role === 'super_admin') return true;
    
    if (section === 'overview') return true;
    if (section === 'tickets') return role === 'technical_admin';
    if (section === 'announcements' || section === 'projects' || section === 'inbox') return role === 'moderator';
    if (section === 'staff') return role === 'technical_admin';
    if (section === 'purchases' || section === 'finances') return role === 'super_admin';
    return false;
  };

  const refreshData = async () => {
    try {
      const [annData, projData, msgData, ticketData, userData, staffData, purchasesData, financesData] = await Promise.all([
        db.getAnnouncements(),
        db.getProjects(),
        db.getMessages(),
        db.getTickets(),
        db.getUsers(),
        db.getStaff(),
        db.getPurchases(),
        db.getFinances()
      ]);
      setAnnouncements(annData);
      setProjects(projData);
      setMessages(msgData);
      setTickets(ticketData);
      setUsers(userData);
      setStaff(staffData);
      setPurchases(purchasesData);
      setFinances(financesData);
    } catch (err) {
      console.error("Dashboard veri yenileme hatası:", err);
    }
  };

  // Load initial data
  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
      return;
    }
    if (currentUser.role === 'resident') {
      navigate('/sakin/portal');
      return;
    }
    Promise.resolve().then(() => {
      refreshData();
    });
  }, [currentUser, navigate]);

  const handleSignOut = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    sessionStorage.removeItem('adminUser');
    navigate('/');
  };

  // --- Announcement Actions ---
  const handleOpenAddAnn = () => {
    setAnnForm({ id: '', title: '', content: '', imageUrl: '' });
    setShowAnnModal(true);
  };

  const handleOpenEditAnn = (ann) => {
    setAnnForm({ ...ann });
    setShowAnnModal(true);
  };

  const handleSaveAnn = async (e) => {
    e.preventDefault();
    const finalImageUrl = annForm.imageUrl.trim() || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800';
    if (annForm.id) {
      await db.updateAnnouncement(annForm.id, { ...annForm, imageUrl: finalImageUrl });
    } else {
      await db.addAnnouncement({ ...annForm, imageUrl: finalImageUrl });
    }
    setShowAnnModal(false);
    await refreshData();
  };

  const handleDeleteAnn = async (id) => {
    if (window.confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
      await db.deleteAnnouncement(id);
      await refreshData();
    }
  };

  // --- Project Actions ---
  const handleOpenAddProj = () => {
    setProjForm({ id: '', title: '', status: 'planned', category: 'Peyzaj' });
    setShowProjModal(true);
  };

  const handleSaveProj = async (e) => {
    e.preventDefault();
    if (projForm.id) {
      await db.updateProject(projForm.id, projForm);
    } else {
      await db.addProject(projForm);
    }
    setShowProjModal(false);
    await refreshData();
  };

  const handleToggleProjStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'planned' ? 'ongoing' : 'planned';
    await db.updateProject(id, { status: nextStatus });
    await refreshData();
  };

  const handleDeleteProj = async (id) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      await db.deleteProject(id);
      await refreshData();
    }
  };

  // --- Ticket Actions ---
  const handleAssignStaff = async (ticketId, staffName) => {
    const ticket = tickets.find(t => t.id === ticketId);
    const updates = { assignedStaff: staffName };
    if (ticket && ticket.status === 'new' && staffName !== '') {
      updates.status = 'ongoing';
    }
    await db.updateTicket(ticketId, updates);
    await refreshData();
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    await db.updateTicket(ticketId, { status });
    await refreshData();
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
      await db.deleteTicket(ticketId);
      await refreshData();
    }
  };

  // --- Inbox Actions ---
  const handleReadMessage = async (msg) => {
    await db.markMessageRead(msg.id);
    setSelectedMsg({ ...msg, isRead: true });
    await refreshData();
  };

  const handleDeleteMessage = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      await db.deleteMessage(id);
      if (selectedMsg && selectedMsg.id === id) {
        setSelectedMsg(null);
      }
      await refreshData();
    }
  };

  // --- User Management Actions ---
  const handleOpenAddUser = () => {
    setUserForm({ id: '', username: '', fullName: '', email: '', password: '', role: 'moderator' });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user) => {
    setUserForm({ ...user, password: '' });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (userForm.id) {
      const originalUser = users.find(u => u.id === userForm.id);
      const finalPassword = userForm.password ? userForm.password : originalUser.password;
      
      const updatedUser = { ...userForm, password: finalPassword };
      await db.updateUser(userForm.id, updatedUser);
      
      if (currentUser && currentUser.id === userForm.id) {
        sessionStorage.setItem('adminUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    } else {
      await db.addUser(userForm);
    }
    setShowUserModal(false);
    await refreshData();
  };

  const handleDeleteUser = async (id) => {
    if (currentUser && currentUser.id === id) {
      alert('Kendi kullanıcınızı silemezsiniz!');
      return;
    }
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      await db.deleteUser(id);
      await refreshData();
    }
  };

  // --- Staff Actions ---
  const handleOpenAddStaff = () => {
    setStaffForm({ id: '', name: '', role: 'Teknik Şef' });
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (member) => {
    setStaffForm({ ...member });
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (staffForm.id) {
      await db.updateStaff(staffForm.id, staffForm);
    } else {
      await db.addStaff(staffForm);
    }
    setShowStaffModal(false);
    await refreshData();
  };

  const handleDeleteStaff = async (id) => {
    if (String(id).startsWith('static-')) {
      alert('Varsayılan (statik) personeller silinemez. Lütfen önce veritabanınızda site_staff tablosunu oluşturun.');
      return;
    }
    if (window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      await db.deleteStaff(id);
      await refreshData();
    }
  };

  // --- Purchase Actions ---
  const handleOpenAddPurchase = () => {
    setPurchForm({ id: '', title: '', amount: '', date: new Date().toLocaleDateString("tr-TR"), description: '', invoiceUrl: '', offers: '' });
    setShowPurchModal(true);
  };

  const handleOpenEditPurchase = (purchase) => {
    setPurchForm({ ...purchase });
    setShowPurchModal(true);
  };

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (purchForm.id) {
      await db.updatePurchase(purchForm.id, purchForm);
    } else {
      await db.addPurchase(purchForm);
    }
    setShowPurchModal(false);
    await refreshData();
  };

  const handleDeletePurchase = async (id) => {
    if (window.confirm('Bu satın alma kaydını silmek istediğinizden emin misiniz?')) {
      await db.deletePurchase(id);
      await refreshData();
    }
  };

  // --- Finance Actions ---
  const handleOpenAddFinance = () => {
    setFinForm({ id: '', period: '', income: '', expense: '', description: '' });
    setShowFinModal(true);
  };

  const handleOpenEditFinance = (finance) => {
    setFinForm({ ...finance });
    setShowFinModal(true);
  };

  const handleSaveFinance = async (e) => {
    e.preventDefault();
    if (finForm.id) {
      await db.updateFinance(finForm.id, finForm);
    } else {
      await db.addFinance(finForm);
    }
    setShowFinModal(false);
    await refreshData();
  };

  const handleDeleteFinance = async (id) => {
    if (window.confirm('Bu gelir-gider raporunu silmek istediğinizden emin misiniz?')) {
      await db.deleteFinance(id);
      await refreshData();
    }
  };

  const unreadMessagesCount = messages.filter(m => !m.isRead).length;
  const newTicketsCount = tickets.filter(t => t.status === 'new').length;

  // Filtered Tickets computation
  const filteredTickets = tickets.filter(t => {
    const statusMatch = ticketStatusFilter === 'all' || t.status === ticketStatusFilter;
    const catMatch = ticketCatFilter === 'all' || t.category === ticketCatFilter;
    return statusMatch && catMatch;
  });

  return (
    <div className="admin-layout">
      {/* Mobile Admin Header */}
      <div className="admin-mobile-header">
        <button className="admin-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle Sidebar">
          <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
        <div className="mobile-header-brand">
          <img src="/logo.png" alt="Logo" className="mobile-brand-logo" />
          <h3>Yönetim Paneli</h3>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Sidebar Panel */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Logo" className="sidebar-logo" />
          <div>
            <h3>Yönetim</h3>
            <span>Kontrol Paneli</span>
          </div>
        </div>

        {currentUser && (
          <div className="sidebar-user-profile">
            <div className="user-profile-avatar">
              <i className="fa-solid fa-circle-user"></i>
            </div>
            <div className="user-profile-info">
              <span className="user-name">{currentUser.fullName}</span>
              <span className="user-role-badge">
                {currentUser.role === 'super_admin' && 'Süper Yönetici'}
                {currentUser.role === 'technical_admin' && 'Teknik Yönetici'}
                {currentUser.role === 'moderator' && 'Halkla İlişkiler'}
              </span>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveSection('overview'); setIsSidebarOpen(false); }}
          >
            <i className="fa-solid fa-chart-pie"></i> Özet Panel
          </button>
          
          {hasAccess('tickets') && (
            <button
              className={`sidebar-link ${activeSection === 'tickets' ? 'active' : ''}`}
              onClick={() => { setActiveSection('tickets'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-ticket"></i> Talep Yönetimi
              {newTicketsCount > 0 && <span className="inbox-badge-count bg-red">{newTicketsCount}</span>}
            </button>
          )}

          {hasAccess('announcements') && (
            <button
              className={`sidebar-link ${activeSection === 'announcements' ? 'active' : ''}`}
              onClick={() => { setActiveSection('announcements'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-bullhorn"></i> Duyuru Yönetimi
            </button>
          )}

          {hasAccess('projects') && (
            <button
              className={`sidebar-link ${activeSection === 'projects' ? 'active' : ''}`}
              onClick={() => { setActiveSection('projects'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-list-check"></i> Proje Yönetimi
            </button>
          )}

          {hasAccess('inbox') && (
            <button
              className={`sidebar-link ${activeSection === 'inbox' ? 'active' : ''}`}
              onClick={() => { setActiveSection('inbox'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-envelope"></i> Gelen Kutusu
              {unreadMessagesCount > 0 && <span className="inbox-badge-count">{unreadMessagesCount}</span>}
            </button>
          )}

          {hasAccess('users') && (
            <button
              className={`sidebar-link ${activeSection === 'users' ? 'active' : ''}`}
              onClick={() => { setActiveSection('users'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-users-gear"></i> Kullanıcı Yönetimi
            </button>
          )}

          {hasAccess('staff') && (
            <button
              className={`sidebar-link ${activeSection === 'staff' ? 'active' : ''}`}
              onClick={() => { setActiveSection('staff'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-user-tie"></i> Personel Yönetimi
            </button>
          )}

          {hasAccess('purchases') && (
            <button
              className={`sidebar-link ${activeSection === 'purchases' ? 'active' : ''}`}
              onClick={() => { setActiveSection('purchases'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-cart-shopping"></i> Satın Alma Yönetimi
            </button>
          )}

          {hasAccess('finances') && (
            <button
              className={`sidebar-link ${activeSection === 'finances' ? 'active' : ''}`}
              onClick={() => { setActiveSection('finances'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-scale-balanced"></i> Gelir-Gider Yönetimi
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-secondary btn-sidebar-out" onClick={() => navigate('/')}>
            <i className="fa-solid fa-house"></i> Siteye Dön
          </button>
          <button className="btn btn-danger btn-sidebar-out" onClick={handleSignOut}>
            <i className="fa-solid fa-power-off"></i> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Admin Section */}
      <main className="admin-main">
        {/* SECTION: OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="admin-section fade-in">
            <h1 className="admin-section-title">Genel Bakış</h1>
            
            <div className="stats-grid-admin">
              {/* Tickets Stats */}
              {hasAccess('tickets') && (
                <div className="stat-admin-card card-envelope" onClick={() => setActiveSection('tickets')} style={{ cursor: 'pointer' }}>
                  <div className="stat-admin-icon"><i className="fa-solid fa-ticket"></i></div>
                  <div className="stat-admin-info">
                    <h3>{newTicketsCount}</h3>
                    <p>Yeni Bekleyen Talep</p>
                  </div>
                </div>
              )}

              {hasAccess('announcements') && (
                <div className="stat-admin-card card-primary" onClick={() => setActiveSection('announcements')} style={{ cursor: 'pointer' }}>
                  <div className="stat-admin-icon"><i className="fa-solid fa-bullhorn"></i></div>
                  <div className="stat-admin-info">
                    <h3>{announcements.length}</h3>
                    <p>Toplam Duyuru</p>
                  </div>
                </div>
              )}

              {hasAccess('projects') && (
                <div className="stat-admin-card card-teal" onClick={() => setActiveSection('projects')} style={{ cursor: 'pointer' }}>
                  <div className="stat-admin-icon"><i className="fa-solid fa-spinner"></i></div>
                  <div className="stat-admin-info">
                    <h3>{projects.filter(p => p.status === 'ongoing').length}</h3>
                    <p>Devam Eden Proje</p>
                  </div>
                </div>
              )}

              {hasAccess('inbox') && (
                <div className="stat-admin-card card-yellow" onClick={() => setActiveSection('inbox')} style={{ cursor: 'pointer' }}>
                  <div className="stat-admin-icon"><i className="fa-solid fa-envelope-open"></i></div>
                  <div className="stat-admin-info">
                    <h3>{unreadMessagesCount}</h3>
                    <p>Okunmamış Mesaj</p>
                  </div>
                </div>
              )}
            </div>

            <div className="overview-recent-grid">
              {/* Recent Tickets Overview */}
              {hasAccess('tickets') && (
                <div className="overview-card">
                  <h3>Son Gelen Sakin Talepleri</h3>
                  <div className="recent-list">
                    {tickets.slice(0, 3).map(t => (
                      <div key={t.id} className={`recent-item ${t.status === 'new' ? 'unread' : ''}`} onClick={() => setActiveSection('tickets')}>
                        <div className="recent-header">
                          <strong>{t.fullName} ({t.block} - {t.aptNo})</strong>
                          <span>{t.date}</span>
                        </div>
                        <p><strong>[{t.category}]</strong> {t.title}</p>
                      </div>
                    ))}
                    {tickets.length === 0 && <p className="empty-text">Henüz gelen talep yok.</p>}
                  </div>
                </div>
              )}

              {(hasAccess('announcements') || hasAccess('projects') || hasAccess('inbox')) && (
                <div className="overview-card">
                  <h3>Aktif Projeler</h3>
                  <div className="recent-list">
                    {projects.filter(p => p.status === 'ongoing').slice(0, 4).map(p => (
                      <div key={p.id} className="recent-project-item">
                        <i className="fa-solid fa-circle-notch fa-spin text-teal"></i>
                        <span>{p.title}</span>
                      </div>
                    ))}
                    {projects.filter(p => p.status === 'ongoing').length === 0 && <p className="empty-text">Devam eden proje yok.</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NEW SECTION: TICKETS MANAGEMENT */}
        {activeSection === 'tickets' && (
          <div className="admin-section fade-in">
            <div className="section-header-row">
              <h1 className="admin-section-title">Sakin Talepleri Yönetimi</h1>
            </div>

            {/* Filters Row */}
            <div className="ticket-filters-row">
              <div className="filter-group-item">
                <label className="form-label">Durum Filtresi</label>
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                  className="form-control"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="new">Yeni Bildirilenler</option>
                  <option value="ongoing">İşlemde Olanlar</option>
                  <option value="resolved">Çözülenler</option>
                  <option value="cancelled">İptal Edilenler</option>
                </select>
              </div>

              <div className="filter-group-item">
                <label className="form-label">Kategori Filtresi</label>
                <select
                  value={ticketCatFilter}
                  onChange={(e) => setTicketCatFilter(e.target.value)}
                  className="form-control"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="Teknik">Teknik</option>
                  <option value="Temizlik">Temizlik</option>
                  <option value="Güvenlik">Güvenlik</option>
                  <option value="Peyzaj">Peyzaj</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Talep ID</th>
                    <th>Tarih</th>
                    <th>Sakin Bilgisi</th>
                    <th>Kategori</th>
                    <th>Talep Konusu ve Detayı</th>
                    <th>Görevli Personel Ata</th>
                    <th>Durum</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <span className="ticket-id-tag">#T-{t.id}</span>
                      </td>
                      <td className="small-date">{t.date}</td>
                      <td>
                        <div className="table-resident-info">
                          <strong>{t.fullName}</strong>
                          <span>{t.block} - {t.aptNo}</span>
                          <span className="resident-phone">{t.phone}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-category cat-${t.category.toLowerCase()}`}>{t.category}</span>
                      </td>
                      <td>
                        <div className="table-ticket-content">
                          <strong>{t.title}</strong>
                          <p>{t.detail}</p>
                        </div>
                      </td>
                      <td>
                        <select
                          value={t.assignedStaff}
                          onChange={(e) => handleAssignStaff(t.id, e.target.value)}
                          className="form-control table-dropdown"
                        >
                          <option value="">-- Personel Seçin --</option>
                          {staff.map((s, idx) => {
                            const staffStr = `${s.name} (${s.role})`;
                            return (
                              <option key={s.id || idx} value={staffStr}>{staffStr}</option>
                            );
                          })}
                        </select>
                      </td>
                      <td>
                        <select
                          value={t.status}
                          onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value)}
                          className={`form-control table-dropdown status-dropdown ${t.status}`}
                        >
                          <option value="new">Yeni</option>
                          <option value="ongoing">İşlemde</option>
                          <option value="resolved">Çözüldü</option>
                          <option value="cancelled">İptal Edildi</option>
                        </select>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-table delete" onClick={() => handleDeleteTicket(t.id)} title="Sil">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center empty-row">Arama kriterlerinize uyan talep bulunamadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION: ANNOUNCEMENTS */}
        {activeSection === 'announcements' && (
          <div className="admin-section fade-in">
            <div className="section-header-row">
              <h1 className="admin-section-title">Duyuru Yönetimi</h1>
              <button className="btn btn-primary" onClick={handleOpenAddAnn}>
                <i className="fa-solid fa-plus"></i> Yeni Duyuru Ekle
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Görsel</th>
                    <th>Tarih</th>
                    <th>Başlık</th>
                    <th>İçerik Özeti</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((ann) => (
                    <tr key={ann.id}>
                      <td>
                        <img src={ann.imageUrl} alt={ann.title} className="table-thumbnail" />
                      </td>
                      <td>{ann.date}</td>
                      <td><strong>{ann.title}</strong></td>
                      <td>{ann.content.substring(0, 80)}...</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-table edit" onClick={() => handleOpenEditAnn(ann)} title="Düzenle">
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button className="btn-table delete" onClick={() => handleDeleteAnn(ann.id)} title="Sil">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {announcements.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center empty-row">Kayıtlı duyuru bulunamadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION: PROJECTS */}
        {activeSection === 'projects' && (
          <div className="admin-section fade-in">
            <div className="section-header-row">
              <h1 className="admin-section-title">Proje Yönetimi</h1>
              <button className="btn btn-primary" onClick={handleOpenAddProj}>
                <i className="fa-solid fa-plus"></i> Yeni Proje Ekle
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Proje Açıklaması</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="badge-category">{p.category}</span>
                      </td>
                      <td><strong>{p.title}</strong></td>
                      <td>
                        <button
                          onClick={() => handleToggleProjStatus(p.id, p.status)}
                          className={`badge-status ${p.status === 'ongoing' ? 'ongoing' : 'planned'}`}
                          title="Durumu Değiştir"
                        >
                          {p.status === 'ongoing' ? 'Devam Ediyor' : 'Planlandı'}
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-table delete" onClick={() => handleDeleteProj(p.id)} title="Sil">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center empty-row">Kayıtlı proje bulunamadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION: INBOX */}
        {activeSection === 'inbox' && (
          <div className="admin-section inbox-section fade-in">
            <h1 className="admin-section-title">Gelen Kutusu</h1>
            
            <div className="inbox-layout">
              {/* Messages list */}
              <div className="messages-list-wrapper">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`inbox-message-item ${!m.isRead ? 'unread' : ''} ${selectedMsg && selectedMsg.id === m.id ? 'active' : ''}`}
                    onClick={() => handleReadMessage(m)}
                  >
                    <div className="inbox-msg-meta">
                      <strong>{m.fullName}</strong>
                      <span>{m.date}</span>
                    </div>
                    <div className="inbox-msg-sub">
                      <span>{m.subject}</span>
                      <button className="inbox-delete-icon" onClick={(e) => handleDeleteMessage(m.id, e)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && <p className="empty-text p-4 text-center">Gelen kutusu boş.</p>}
              </div>

              {/* Message Details */}
              <div className="message-detail-view">
                {selectedMsg ? (
                  <div className="message-detail-card">
                    <div className="msg-detail-header">
                      <h2>{selectedMsg.subject}</h2>
                      <span><i className="fa-regular fa-clock"></i> {selectedMsg.date}</span>
                    </div>
                    
                    <div className="msg-sender-info">
                      <p><strong>Gönderen:</strong> {selectedMsg.fullName}</p>
                      <p><strong>E-Posta:</strong> <a href={`mailto:${selectedMsg.email}`}>{selectedMsg.email}</a></p>
                      <p><strong>Telefon:</strong> <a href={`tel:${selectedMsg.phone}`}>{selectedMsg.phone}</a></p>
                    </div>

                    <div className="msg-body-text">
                      {selectedMsg.message}
                    </div>
                  </div>
                ) : (
                  <div className="message-empty-detail">
                    <i className="fa-regular fa-envelope-open"></i>
                    <p>Görüntülemek için sol listeden bir mesaj seçin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NEW SECTION: USER MANAGEMENT */}
        {activeSection === 'users' && hasAccess('users') && (
          <div className="admin-section fade-in">
            <div className="section-header-row">
              <h1 className="admin-section-title">Kullanıcı Yönetimi</h1>
              <button className="btn btn-primary" onClick={handleOpenAddUser}>
                <i className="fa-solid fa-user-plus"></i> Yeni Kullanıcı Ekle
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kullanıcı Bilgisi</th>
                    <th>E-Posta</th>
                    <th>Kullanıcı Adı</th>
                    <th>Yetki Rolü</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="table-user-info-detail">
                          <div className="user-avatar-circle">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{u.fullName}</strong>
                            {currentUser && currentUser.id === u.id && <span className="current-user-tag">(Siz)</span>}
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td><code>{u.username}</code></td>
                      <td>
                        <span className={`badge-role role-${u.role}`}>
                          {u.role === 'super_admin' && 'Süper Yönetici'}
                          {u.role === 'technical_admin' && 'Teknik Yönetici'}
                          {u.role === 'moderator' && 'Halkla İlişkiler'}
                          {u.role === 'resident' && 'Site Sakini'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-table edit" onClick={() => handleOpenEditUser(u)} title="Düzenle">
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button 
                            className="btn-table delete" 
                            onClick={() => handleDeleteUser(u.id)} 
                            title="Sil"
                            disabled={currentUser && currentUser.id === u.id}
                            style={currentUser && currentUser.id === u.id ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center empty-row">Kayıtlı kullanıcı bulunamadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION: STAFF */}
        {activeSection === 'staff' && (
          <div className="admin-section fade-in">
            <div className="section-header-row">
              <h1 className="admin-section-title">Personel Yönetimi</h1>
              <button className="btn btn-primary" onClick={handleOpenAddStaff}>
                <i className="fa-solid fa-user-plus"></i> Yeni Personel Ekle
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Personel Bilgisi</th>
                    <th>Görevi / Rolü</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s, idx) => (
                    <tr key={s.id || idx}>
                      <td>
                        <div className="table-user-info-detail">
                          <div className="user-avatar-circle">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{s.name}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-category">{s.role}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-table edit" onClick={() => handleOpenEditStaff(s)} title="Düzenle">
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button 
                            className="btn-table delete" 
                            onClick={() => handleDeleteStaff(s.id)} 
                            title="Sil"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center empty-row">Kayıtlı personel bulunamadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION: PURCHASES */}
        {activeSection === 'purchases' && (
          <div className="admin-section fade-in">
            <div className="section-header-row">
              <h1 className="admin-section-title">Satın Alma Yönetimi</h1>
              <button className="btn btn-primary" onClick={handleOpenAddPurchase}>
                <i className="fa-solid fa-cart-plus"></i> Yeni Satın Alma Ekle
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Başlık / Hizmet Adı</th>
                    <th>Tutar</th>
                    <th>Tarih</th>
                    <th>Açıklama</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '700', color: 'var(--primary-hover)' }}>{p.title}</td>
                      <td style={{ fontWeight: '700', color: '#dc3545' }}>
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.amount)}
                      </td>
                      <td>{p.date}</td>
                      <td>{p.description || '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-table edit" onClick={() => handleOpenEditPurchase(p)} title="Düzenle">
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button className="btn-table delete" onClick={() => handleDeletePurchase(p.id)} title="Sil">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {purchases.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center empty-row">Kayıtlı satın alma bulunamadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION: FINANCES */}
        {activeSection === 'finances' && (
          <div className="admin-section fade-in">
            <div className="section-header-row">
              <h1 className="admin-section-title">Gelir-Gider Yönetimi</h1>
              <button className="btn btn-primary" onClick={handleOpenAddFinance}>
                <i className="fa-solid fa-file-invoice-dollar"></i> Yeni Rapor Ekle
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Dönem / Ay</th>
                    <th>Gelir</th>
                    <th>Gider</th>
                    <th>Bakiye</th>
                    <th>Açıklama</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {finances.map((f) => {
                    const balance = f.income - f.expense;
                    return (
                      <tr key={f.id}>
                        <td style={{ fontWeight: '700', color: 'var(--primary-hover)' }}>{f.period}</td>
                        <td style={{ fontWeight: '700', color: '#2e7d32' }}>
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(f.income)}
                        </td>
                        <td style={{ fontWeight: '700', color: '#d32f2f' }}>
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(f.expense)}
                        </td>
                        <td style={{ fontWeight: '700', color: balance >= 0 ? '#2e7d32' : '#d32f2f' }}>
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(balance)}
                        </td>
                        <td>{f.description || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-table edit" onClick={() => handleOpenEditFinance(f)} title="Düzenle">
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button className="btn-table delete" onClick={() => handleDeleteFinance(f.id)} title="Sil">
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {finances.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center empty-row">Kayıtlı bütçe raporu bulunamadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD/EDIT ANNOUNCEMENT */}
      {showAnnModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAnnModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{annForm.id ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Ekle'}</h2>
              <button className="close-btn" onClick={() => setShowAnnModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSaveAnn} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Başlık</label>
                <input
                  type="text"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Görsel URL (Boş bırakılırsa varsayılan atanır)</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={annForm.imageUrl}
                  onChange={(e) => setAnnForm({ ...annForm, imageUrl: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">İçerik</label>
                <textarea
                  required
                  rows="6"
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  className="form-control"
                ></textarea>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAnnModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      {showProjModal && (
        <div className="admin-modal-overlay" onClick={() => setShowProjModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Yeni Proje Ekle</h2>
              <button className="close-btn" onClick={() => setShowProjModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSaveProj} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Proje Açıklaması</label>
                <input
                  type="text"
                  required
                  value={projForm.title}
                  onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  value={projForm.category}
                  onChange={(e) => setProjForm({ ...projForm, category: e.target.value })}
                  className="form-control"
                >
                  <option value="Peyzaj">Peyzaj</option>
                  <option value="Otopark">Otopark</option>
                  <option value="Sosyal Tesis">Sosyal Tesis</option>
                  <option value="Teknik/Güvenlik">Teknik/Güvenlik</option>
                  <option value="Dekorasyon">Dekorasyon</option>
                  <option value="Düzen/Hijyen">Düzen/Hijyen</option>
                  <option value="Yönetim">Yönetim</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Durum</label>
                <select
                  value={projForm.status}
                  onChange={(e) => setProjForm({ ...projForm, status: e.target.value })}
                  className="form-control"
                >
                  <option value="planned">Planlama Aşamasında</option>
                  <option value="ongoing">Devam Eden Proje</option>
                </select>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProjModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT USER */}
      {showUserModal && (
        <div className="admin-modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{userForm.id ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}</h2>
              <button className="close-btn" onClick={() => setShowUserModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSaveUser} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Adı Soyadı</label>
                <input
                  type="text"
                  required
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="form-control"
                  placeholder="Örn. Ahmet Yılmaz"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kullanıcı Adı</label>
                <input
                  type="text"
                  required
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="form-control"
                  placeholder="Örn. ahmet.yilmaz"
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-Posta</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="form-control"
                  placeholder="Örn. ahmet@5leventbayramoglu.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Şifre</label>
                <input
                  type="password"
                  required={!userForm.id}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="form-control"
                  placeholder={userForm.id ? "Şifreyi değiştirmek istemiyorsanız boş bırakın" : "Şifre belirleyin"}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Yetki Rolü</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="form-control"
                >
                  <option value="super_admin">Süper Yönetici</option>
                  <option value="technical_admin">Teknik Yönetici</option>
                  <option value="moderator">Halkla İlişkiler</option>
                  <option value="resident">Site Sakini</option>
                </select>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT STAFF */}
      {showStaffModal && (
        <div className="admin-modal-overlay" onClick={() => setShowStaffModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{staffForm.id ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}</h2>
              <button className="close-btn" onClick={() => setShowStaffModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSaveStaff} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Adı Soyadı</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="form-control"
                  placeholder="Örn. Ahmet Yılmaz"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Görevi / Rolü</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  className="form-control"
                >
                  <option value="Teknik Şef">Teknik Şef</option>
                  <option value="Elektrik Teknisyeni">Elektrik Teknisyeni</option>
                  <option value="Tesisatçı">Tesisatçı</option>
                  <option value="Temizlik Görevlisi">Temizlik Görevlisi</option>
                  <option value="Güvenlik Görevlisi">Güvenlik Görevlisi</option>
                  <option value="Peyzaj Görevlisi">Peyzaj Görevlisi</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStaffModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT PURCHASE */}
      {showPurchModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPurchModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{purchForm.id ? 'Satın Almayı Düzenle' : 'Yeni Satın Alma Ekle'}</h2>
              <button className="close-btn" onClick={() => setShowPurchModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSavePurchase} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Başlık / Malzeme Adı</label>
                <input
                  type="text"
                  required
                  value={purchForm.title}
                  onChange={(e) => setPurchForm({ ...purchForm, title: e.target.value })}
                  className="form-control"
                  placeholder="Örn. Jeneratör Akü Değişimi"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tutar (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={purchForm.amount}
                  onChange={(e) => setPurchForm({ ...purchForm, amount: e.target.value })}
                  className="form-control"
                  placeholder="Örn. 18500"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tarih</label>
                <input
                  type="text"
                  required
                  value={purchForm.date}
                  onChange={(e) => setPurchForm({ ...purchForm, date: e.target.value })}
                  className="form-control"
                  placeholder="Örn. 15.05.2026"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <textarea
                  rows="3"
                  value={purchForm.description}
                  onChange={(e) => setPurchForm({ ...purchForm, description: e.target.value })}
                  className="form-control"
                  placeholder="Hizmet/Harcama hakkında detaylar..."
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Fatura Dosyası / Bağlantı URL'i</label>
                <input
                  type="text"
                  value={purchForm.invoiceUrl || ''}
                  onChange={(e) => setPurchForm({ ...purchForm, invoiceUrl: e.target.value })}
                  className="form-control"
                  placeholder="Örn. https://drive.google.com/file/... veya fatura adresi"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alınan Fiyat Teklifleri</label>
                <textarea
                  rows="4"
                  value={purchForm.offers || ''}
                  onChange={(e) => setPurchForm({ ...purchForm, offers: e.target.value })}
                  className="form-control"
                  placeholder="Örn. A Firması: 20.000 TL, B Firması: 18.500 TL (Seçildi), C Firması: 22.000 TL"
                ></textarea>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPurchModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT FINANCE */}
      {showFinModal && (
        <div className="admin-modal-overlay" onClick={() => setShowFinModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{finForm.id ? 'Raporu Düzenle' : 'Yeni Gelir-Gider Raporu Ekle'}</h2>
              <button className="close-btn" onClick={() => setShowFinModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSaveFinance} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Dönem / Ay</label>
                <input
                  type="text"
                  required
                  value={finForm.period}
                  onChange={(e) => setFinForm({ ...finForm, period: e.target.value })}
                  className="form-control"
                  placeholder="Örn. Mayıs 2026"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Aylık Toplam Gelir (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={finForm.income}
                  onChange={(e) => setFinForm({ ...finForm, income: e.target.value })}
                  className="form-control"
                  placeholder="Örn. 155000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Aylık Toplam Gider (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={finForm.expense}
                  onChange={(e) => setFinForm({ ...finForm, expense: e.target.value })}
                  className="form-control"
                  placeholder="Örn. 148500"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Genel Açıklama</label>
                <textarea
                  rows="3"
                  value={finForm.description}
                  onChange={(e) => setFinForm({ ...finForm, description: e.target.value })}
                  className="form-control"
                  placeholder="Dönem özeti veya ek bilgiler..."
                ></textarea>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFinModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
