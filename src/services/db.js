import { createClient } from '@supabase/supabase-js';
import { sendTelegramNotification, sendEmailNotification } from './notification';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SEED_STAFF = [
  "Ahmet Yılmaz (Teknik Şef)",
  "Mehmet Kaya (Elektrik Teknisyeni)",
  "Mustafa Demir (Tesisatçı)",
  "Fatma Çelik (Temizlik Görevlisi)",
  "Ali Öztürk (Güvenlik Görevlisi)"
];

export const db = {
  // Staff (Personel)
  getStaff: async () => {
    const { data, error } = await supabase
      .from('site_staff')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.warn("getStaff error, falling back to static seed data:", error);
      // Fallback
      return SEED_STAFF.map((s, idx) => {
        const parts = s.split(' (');
        const name = parts[0];
        const role = parts[1] ? parts[1].replace(')', '') : '';
        return { id: `static-${idx}`, name, role };
      });
    }
    return data || [];
  },

  addStaff: async (staff) => {
    const { data, error } = await supabase
      .from('site_staff')
      .insert({
        name: staff.name,
        role: staff.role
      })
      .select();
    if (error) console.error("addStaff error:", error);
    return data ? data[0] : null;
  },

  updateStaff: async (id, updatedData) => {
    const { data, error } = await supabase
      .from('site_staff')
      .update({
        name: updatedData.name,
        role: updatedData.role
      })
      .eq('id', id)
      .select();
    if (error) console.error("updateStaff error:", error);
    return data ? data[0] : null;
  },

  deleteStaff: async (id) => {
    const { error } = await supabase
      .from('site_staff')
      .delete()
      .eq('id', id);
    if (error) console.error("deleteStaff error:", error);
    return !error;
  },


  // Announcements (Duyurular)
  getAnnouncements: async () => {
    const { data, error } = await supabase
      .from('site_announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error("getAnnouncements error:", error);
    
    // Map db fields to front-end fields (image_url -> imageUrl)
    return (data || []).map(ann => ({
      id: ann.id,
      title: ann.title,
      content: ann.content,
      imageUrl: ann.image_url,
      date: ann.date
    }));
  },
  
  addAnnouncement: async (announcement) => {
    const { data, error } = await supabase
      .from('site_announcements')
      .insert({
        title: announcement.title,
        content: announcement.content,
        image_url: announcement.imageUrl,
        date: announcement.date || new Date().toLocaleDateString("tr-TR")
      })
      .select();
    if (error) console.error("addAnnouncement error:", error);
    
    if (data && data[0]) {
      const ann = data[0];
      return {
        id: ann.id,
        title: ann.title,
        content: ann.content,
        imageUrl: ann.image_url,
        date: ann.date
      };
    }
    return null;
  },
  
  updateAnnouncement: async (id, updatedData) => {
    const { data, error } = await supabase
      .from('site_announcements')
      .update({
        title: updatedData.title,
        content: updatedData.content,
        image_url: updatedData.imageUrl,
        date: updatedData.date
      })
      .eq('id', id)
      .select();
    if (error) console.error("updateAnnouncement error:", error);
    
    if (data && data[0]) {
      const ann = data[0];
      return {
        id: ann.id,
        title: ann.title,
        content: ann.content,
        imageUrl: ann.image_url,
        date: ann.date
      };
    }
    return null;
  },
  
  deleteAnnouncement: async (id) => {
    const { error } = await supabase
      .from('site_announcements')
      .delete()
      .eq('id', id);
    if (error) console.error("deleteAnnouncement error:", error);
    return !error;
  },

  // Projects (Projeler)
  getProjects: async () => {
    const { data, error } = await supabase
      .from('site_projects')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) console.error("getProjects error:", error);
    return data || [];
  },
  
  addProject: async (project) => {
    const { data, error } = await supabase
      .from('site_projects')
      .insert({
        title: project.title,
        status: project.status,
        category: project.category
      })
      .select();
    if (error) console.error("addProject error:", error);
    return data ? data[0] : null;
  },
  
  updateProject: async (id, updatedData) => {
    const { data, error } = await supabase
      .from('site_projects')
      .update(updatedData)
      .eq('id', id)
      .select();
    if (error) console.error("updateProject error:", error);
    return data ? data[0] : null;
  },
  
  deleteProject: async (id) => {
    const { error } = await supabase
      .from('site_projects')
      .delete()
      .eq('id', id);
    if (error) console.error("deleteProject error:", error);
    return !error;
  },

  // Messages (İletişim Mesajları)
  getMessages: async () => {
    const { data, error } = await supabase
      .from('site_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error("getMessages error:", error);
    
    return (data || []).map(m => ({
      id: m.id,
      fullName: m.full_name,
      email: m.email,
      phone: m.phone,
      subject: m.subject,
      message: m.message,
      isRead: m.is_read,
      date: m.date
    }));
  },
  
  addMessage: async (message) => {
    const { data, error } = await supabase
      .from('site_messages')
      .insert({
        full_name: message.fullName,
        email: message.email,
        phone: message.phone,
        subject: message.subject,
        message: message.message,
        is_read: false,
        date: new Date().toLocaleString("tr-TR")
      })
      .select();
    if (error) console.error("addMessage error:", error);
    
    if (data && data[0]) {
      const m = data[0];
      
      // Trigger notifications asynchronously
      Promise.resolve().then(() => {
        const tgMsg = `<b>✉️ Yeni Mesaj Alındı (İletişim Formu)</b>\n\n` +
          `<b>Gönderen:</b> ${m.full_name}\n` +
          `<b>E-Posta:</b> ${m.email}\n` +
          `<b>Telefon:</b> ${m.phone || 'Girilmedi'}\n` +
          `<b>Konu:</b> ${m.subject}\n` +
          `<b>Mesaj:</b> ${m.message}`;
        sendTelegramNotification(tgMsg);

        const emailParams = {
          to_name: "Yönetici",
          from_name: m.full_name,
          subject: `Yeni İletişim Formu Mesajı: ${m.subject}`,
          message: `Sayın Yönetici,\n\nİletişim formundan yeni bir mesaj alınmıştır:\n\n` +
                   `Gönderen: ${m.full_name}\n` +
                   `E-Posta: ${m.email}\n` +
                   `Telefon: ${m.phone || 'Girilmedi'}\n` +
                   `Konu: ${m.subject}\n\n` +
                   `Mesaj:\n${m.message}\n\n` +
                   `Lütfen en kısa sürede dönüş sağlayınız.`
        };
        sendEmailNotification(emailParams);
      });

      return {
        id: m.id,
        fullName: m.full_name,
        email: m.email,
        phone: m.phone,
        subject: m.subject,
        message: m.message,
        isRead: m.is_read,
        date: m.date
      };
    }
    return null;
  },
  
  markMessageRead: async (id) => {
    const { data, error } = await supabase
      .from('site_messages')
      .update({ is_read: true })
      .eq('id', id)
      .select();
    if (error) console.error("markMessageRead error:", error);
    
    if (data && data[0]) {
      const m = data[0];
      return {
        id: m.id,
        fullName: m.full_name,
        email: m.email,
        phone: m.phone,
        subject: m.subject,
        message: m.message,
        isRead: m.is_read,
        date: m.date
      };
    }
    return null;
  },
  
  deleteMessage: async (id) => {
    const { error } = await supabase
      .from('site_messages')
      .delete()
      .eq('id', id);
    if (error) console.error("deleteMessage error:", error);
    return !error;
  },

  // Tickets (Talep / Destek Mesajları)
  getTickets: async () => {
    const { data, error } = await supabase
      .from('site_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error("getTickets error:", error);
    
    return (data || []).map(t => ({
      id: t.id,
      fullName: t.full_name,
      phone: t.phone,
      block: t.block,
      aptNo: t.apt_no,
      category: t.category,
      priority: t.priority || 'Normal',
      title: t.title,
      detail: t.detail,
      status: t.status,
      assignedStaff: t.assigned_staff,
      date: t.date
    }));
  },

  addTicket: async (ticket) => {
    const customId = Math.floor(1000 + Math.random() * 9000).toString();
    const payload = {
      id: customId,
      full_name: ticket.fullName,
      phone: ticket.phone,
      block: ticket.block,
      apt_no: ticket.aptNo,
      category: ticket.category,
      priority: ticket.priority || 'Normal',
      title: ticket.title,
      detail: ticket.detail,
      status: "new",
      assigned_staff: "",
      date: new Date().toLocaleString("tr-TR")
    };

    let { data, error } = await supabase
      .from('site_tickets')
      .insert(payload)
      .select();
    
    if (error && error.message && error.message.includes('column') && error.message.includes('does not exist')) {
      console.warn("Priority column doesn't exist yet, retrying without it:", error.message);
      const cleanPayload = { ...payload };
      delete cleanPayload.priority;
      const retryResult = await supabase
        .from('site_tickets')
        .insert(cleanPayload)
        .select();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) console.error("addTicket error:", error);
    
    if (data && data[0]) {
      const t = data[0];
      
      // Calculate queue rank based on priority and age
      let queueRank = 1;
      let totalActive = 1;
      try {
        const { data: activeTickets } = await supabase
          .from('site_tickets')
          .select('id, priority, created_at')
          .in('status', ['new', 'ongoing']);
        
        if (activeTickets && activeTickets.length > 0) {
          totalActive = activeTickets.length;
          const priorityWeight = { 'Acil': 3, 'Normal': 2, 'Düşük': 1 };
          const sorted = [...activeTickets].sort((a, b) => {
            const weightA = priorityWeight[a.priority] || 2;
            const weightB = priorityWeight[b.priority] || 2;
            
            if (weightA !== weightB) {
              return weightB - weightA; // Higher priority first
            }
            
            const timeA = a.created_at ? new Date(a.created_at).getTime() : parseFloat(a.id) || 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : parseFloat(b.id) || 0;
            return timeA - timeB; // Oldest first
          });
          
          const idx = sorted.findIndex(item => item.id === t.id);
          if (idx !== -1) {
            queueRank = idx + 1;
          }
        }
      } catch (err) {
        console.warn("Queue calculation error:", err.message);
      }
      
      // Trigger notifications asynchronously
      Promise.resolve().then(() => {
        const priorityLabel = t.priority === 'Acil' ? '🚨 ACİL (Öncelikli)' : t.priority || 'Normal';
        const tgMessage = `<b>🔔 Yeni Talep Oluşturuldu (#T-${t.id})</b>\n\n` +
          `<b>Gönderen:</b> ${t.full_name}\n` +
          `<b>Telefon:</b> ${t.phone}\n` +
          `<b>Konum:</b> ${t.block} - Daire ${t.apt_no}\n` +
          `<b>Kategori:</b> ${t.category}\n` +
          `<b>Öncelik:</b> ${priorityLabel}\n` +
          `<b>İş Sırası:</b> ${queueRank}. Sırada (Toplam ${totalActive} aktif talep)\n\n` +
          `<b>Konu:</b> ${t.title}\n` +
          `<b>Detay:</b> ${t.detail}`;
        sendTelegramNotification(tgMessage);

        const emailParams = {
          to_name: "Yönetici",
          from_name: t.full_name,
          subject: `Yeni Talep Alındı [${t.priority || 'Normal'}]: #T-${t.id}`,
          message: `Sayın Yönetici,\n\nSiteden yeni bir talep/arıza kaydı oluşturulmuştur:\n\n` +
                   `Talep No: #T-${t.id}\n` +
                   `Sakin: ${t.full_name}\n` +
                   `Telefon: ${t.phone}\n` +
                   `Blok/Daire: ${t.block} - Daire ${t.apt_no}\n` +
                   `Kategori: ${t.category}\n` +
                   `Öncelik: ${t.priority || 'Normal'}\n` +
                   `İş Sırası: ${queueRank}. Sırada (Toplam ${totalActive} aktif talep)\n` +
                   `Konu: ${t.title}\n` +
                   `Detay: ${t.detail}\n\n` +
                   `Lütfen yönetim panelinden talebi inceleyerek ilgili personeli atayın.`
        };
        sendEmailNotification(emailParams);
      });

      return {
        id: t.id,
        fullName: t.full_name,
        phone: t.phone,
        block: t.block,
        aptNo: t.apt_no,
        category: t.category,
        priority: t.priority || 'Normal',
        title: t.title,
        detail: t.detail,
        status: t.status,
        assignedStaff: t.assigned_staff,
        date: t.date,
        queueRank: queueRank
      };
    }
    return null;
  },

  updateTicket: async (id, updatedData) => {
    const payload = {};
    if ('fullName' in updatedData) payload.full_name = updatedData.fullName;
    if ('phone' in updatedData) payload.phone = updatedData.phone;
    if ('block' in updatedData) payload.block = updatedData.block;
    if ('aptNo' in updatedData) payload.apt_no = updatedData.aptNo;
    if ('category' in updatedData) payload.category = updatedData.category;
    if ('title' in updatedData) payload.title = updatedData.title;
    if ('detail' in updatedData) payload.detail = updatedData.detail;
    if ('status' in updatedData) payload.status = updatedData.status;
    if ('assignedStaff' in updatedData) payload.assigned_staff = updatedData.assignedStaff;
    if ('date' in updatedData) payload.date = updatedData.date;
    if ('priority' in updatedData) payload.priority = updatedData.priority;

    const { data, error } = await supabase
      .from('site_tickets')
      .update(payload)
      .eq('id', id)
      .select();
    if (error) console.error("updateTicket error:", error);
    
    if (data && data[0]) {
      const t = data[0];
      
      // Trigger notifications asynchronously
      Promise.resolve().then(() => {
        // If assignedStaff is updated and not empty
        if (updatedData.assignedStaff) {
          const tgAssignedMsg = `<b>📋 İş Ataması Yapıldı (#T-${t.id})</b>\n\n` +
            `<b>Talep:</b> ${t.title}\n` +
            `<b>Konum:</b> ${t.block} - Daire ${t.apt_no}\n` +
            `<b>Görevlendirilen Personel:</b> ${t.assigned_staff}\n` +
            `<b>Durum:</b> Devam Ediyor`;
          sendTelegramNotification(tgAssignedMsg);
        }
        
        // If status is updated
        if (updatedData.status) {
          let statusText = t.status;
          if (t.status === 'resolved') statusText = '✅ Çözüldü';
          if (t.status === 'ongoing') statusText = '⏳ Devam Ediyor';
          if (t.status === 'cancelled') statusText = '❌ İptal Edildi';
          if (t.status === 'new') statusText = '🆕 Yeni';

          const tgStatusMsg = `<b>🔄 Talep Durumu Güncellendi (#T-${t.id})</b>\n\n` +
            `<b>Talep:</b> ${t.title}\n` +
            `<b>Yeni Durum:</b> ${statusText}`;
          sendTelegramNotification(tgStatusMsg);
          
          const emailParams = {
            to_name: "Yönetici",
            from_name: "Sistem",
            subject: `Talep Güncellendi: #T-${t.id} - ${statusText}`,
            message: `Talep durumu güncellendi:\n\n` +
                     `Talep No: #T-${t.id}\n` +
                     `Başlık: ${t.title}\n` +
                     `Yeni Durum: ${statusText}\n` +
                     `Atanan Personel: ${t.assigned_staff || 'Atanmadı'}`
          };
          sendEmailNotification(emailParams);
        }
      });

      return {
        id: t.id,
        fullName: t.full_name,
        phone: t.phone,
        block: t.block,
        aptNo: t.apt_no,
        category: t.category,
        title: t.title,
        detail: t.detail,
        status: t.status,
        assignedStaff: t.assigned_staff,
        date: t.date
      };
    }
    return null;
  },

  deleteTicket: async (id) => {
    const { error } = await supabase
      .from('site_tickets')
      .delete()
      .eq('id', id);
    if (error) console.error("deleteTicket error:", error);
    return !error;
  },

  // Users (Kullanıcılar)
  getUsers: async () => {
    const { data, error } = await supabase
      .from('site_users')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) console.error("getUsers error:", error);
    
    return (data || []).map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.full_name,
      email: u.email,
      role: u.role,
      password: u.password
    }));
  },

  addUser: async (user) => {
    const { data, error } = await supabase
      .from('site_users')
      .insert({
        username: user.username,
        full_name: user.fullName,
        email: user.email,
        role: user.role,
        password: user.password
      })
      .select();
    if (error) console.error("addUser error:", error);
    
    if (data && data[0]) {
      const u = data[0];
      return {
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        password: u.password
      };
    }
    return null;
  },

  updateUser: async (id, updatedData) => {
    const payload = {
      username: updatedData.username,
      full_name: updatedData.fullName,
      email: updatedData.email,
      role: updatedData.role
    };
    if (updatedData.password) {
      payload.password = updatedData.password;
    }

    const { data, error } = await supabase
      .from('site_users')
      .update(payload)
      .eq('id', id)
      .select();
    if (error) console.error("updateUser error:", error);
    
    if (data && data[0]) {
      const u = data[0];
      return {
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        password: u.password
      };
    }
    return null;
  },

  deleteUser: async (id) => {
    const { error } = await supabase
      .from('site_users')
      .delete()
      .eq('id', id);
    if (error) console.error("deleteUser error:", error);
    return !error;
  },

  authenticateUser: async (username, password) => {
    const { data, error } = await supabase
      .from('site_users')
      .select('*')
      .eq('username', username)
      .eq('password', password);
    if (error) console.error("authenticateUser error:", error);
    
    if (data && data.length > 0) {
      const u = data[0];
      return {
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        email: u.email,
        role: u.role
      };
    }
    return null;
  },

  // Purchases (Satın Almalar)
  getPurchases: async () => {
    try {
      const { data, error } = await supabase
        .from('site_purchases')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        title: p.title,
        amount: p.amount,
        date: p.date,
        description: p.description,
        invoiceUrl: p.invoice_url,
        offers: p.offers
      }));
    } catch (err) {
      console.warn("getPurchases error, table might not exist yet:", err.message);
      return [];
    }
  },

  addPurchase: async (purchase) => {
    try {
      const { data, error } = await supabase
        .from('site_purchases')
        .insert({
          title: purchase.title,
          amount: parseFloat(purchase.amount),
          date: purchase.date || new Date().toLocaleDateString("tr-TR"),
          description: purchase.description,
          invoice_url: purchase.invoiceUrl || '',
          offers: purchase.offers || ''
        })
        .select();
      if (error) throw error;
      return data ? data[0] : null;
    } catch (err) {
      console.error("addPurchase error:", err.message);
      return null;
    }
  },

  updatePurchase: async (id, updatedData) => {
    try {
      const { data, error } = await supabase
        .from('site_purchases')
        .update({
          title: updatedData.title,
          amount: parseFloat(updatedData.amount),
          date: updatedData.date,
          description: updatedData.description,
          invoice_url: updatedData.invoiceUrl || '',
          offers: updatedData.offers || ''
        })
        .eq('id', id)
        .select();
      if (error) throw error;
      return data ? data[0] : null;
    } catch (err) {
      console.error("updatePurchase error:", err.message);
      return null;
    }
  },

  deletePurchase: async (id) => {
    try {
      const { error } = await supabase
        .from('site_purchases')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("deletePurchase error:", err.message);
      return false;
    }
  },

  // Finances (Gelir-Gider)
  getFinances: async () => {
    try {
      const { data, error } = await supabase
        .from('site_finances')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("getFinances error, table might not exist yet:", err.message);
      return [];
    }
  },

  addFinance: async (finance) => {
    try {
      const { data, error } = await supabase
        .from('site_finances')
        .insert({
          period: finance.period,
          income: parseFloat(finance.income),
          expense: parseFloat(finance.expense),
          description: finance.description
        })
        .select();
      if (error) throw error;
      return data ? data[0] : null;
    } catch (err) {
      console.error("addFinance error:", err.message);
      return null;
    }
  },

  updateFinance: async (id, updatedData) => {
    try {
      const { data, error } = await supabase
        .from('site_finances')
        .update({
          period: updatedData.period,
          income: parseFloat(updatedData.income),
          expense: parseFloat(updatedData.expense),
          description: updatedData.description
        })
        .eq('id', id)
        .select();
      if (error) throw error;
      return data ? data[0] : null;
    } catch (err) {
      console.error("updateFinance error:", err.message);
      return null;
    }
  },

  deleteFinance: async (id) => {
    try {
      const { error } = await supabase
        .from('site_finances')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("deleteFinance error:", err.message);
      return false;
    }
  },

  // Dues (Aidat Yönetimi)
  getDuesForUser: async (userId, username) => {
    try {
      const { data, error } = await supabase
        .from('site_dues')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("getDuesForUser error, falling back to localStorage mock data:", err.message);
      const key = `mock_dues_${userId || username}`;
      let mockData = localStorage.getItem(key);
      if (!mockData) {
        mockData = [
          {
            id: `mock-due-1`,
            user_id: userId || 'mock-user-id',
            period: 'Haziran 2026',
            amount: 1500.00,
            status: 'unpaid',
            due_date: '15.06.2026',
            payment_date: null
          },
          {
            id: `mock-due-2`,
            user_id: userId || 'mock-user-id',
            period: 'Mayıs 2026',
            amount: 1500.00,
            status: 'paid',
            due_date: '15.05.2026',
            payment_date: '10.05.2026 18:24'
          },
          {
            id: `mock-due-3`,
            user_id: userId || 'mock-user-id',
            period: 'Nisan 2026',
            amount: 1500.00,
            status: 'paid',
            due_date: '15.04.2026',
            payment_date: '12.04.2026 10:15'
          }
        ];
        localStorage.setItem(key, JSON.stringify(mockData));
      } else {
        mockData = JSON.parse(mockData);
      }
      return mockData;
    }
  },

  payDue: async (dueId, userId, username, fullName) => {
    const paymentDateStr = new Date().toLocaleString("tr-TR");
    
    if (dueId && !String(dueId).startsWith('mock-')) {
      try {
        const { data, error } = await supabase
          .from('site_dues')
          .update({
            status: 'paid',
            payment_date: paymentDateStr
          })
          .eq('id', dueId)
          .select();
        
        if (error) throw error;
        
        if (data && data[0]) {
          const d = data[0];
          Promise.resolve().then(async () => {
            let name = fullName || 'Sakin';
            if (userId && !fullName) {
              const { data: userData } = await supabase
                .from('site_users')
                .select('full_name')
                .eq('id', userId)
                .single();
              if (userData) name = userData.full_name;
            }
            
            const tgMsg = `<b>💳 Aidat Tahsilat Bildirimi</b>\n\n` +
              `<b>Sakin:</b> ${name}\n` +
              `<b>Dönem:</b> ${d.period}\n` +
              `<b>Tutar:</b> ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(d.amount)}\n` +
              `<b>Ödeme Tarihi:</b> ${paymentDateStr}\n` +
              `<b>Yöntem:</b> Kredi Kartı (Online)`;
            sendTelegramNotification(tgMsg);
          });
          return data[0];
        }
      } catch (err) {
        console.error("payDue database error:", err.message);
      }
    }

    const key = `mock_dues_${userId || username}`;
    let mockData = localStorage.getItem(key);
    if (mockData) {
      const parsed = JSON.parse(mockData);
      const idx = parsed.findIndex(d => d.id === dueId);
      if (idx !== -1) {
        parsed[idx].status = 'paid';
        parsed[idx].payment_date = paymentDateStr;
        localStorage.setItem(key, JSON.stringify(parsed));
        
        const d = parsed[idx];
        const name = fullName || username || 'Site Sakini';
        const tgMsg = `<b>💳 [MOCK] Aidat Tahsilat Bildirimi</b>\n\n` +
          `<b>Sakin:</b> ${name}\n` +
          `<b>Dönem:</b> ${d.period}\n` +
          `<b>Tutar:</b> ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(d.amount)}\n` +
          `<b>Ödeme Tarihi:</b> ${paymentDateStr}\n` +
          `<b>Yöntem:</b> Kredi Kartı (Simüle)`;
        sendTelegramNotification(tgMsg);

        return parsed[idx];
      }
    }
    return null;
  },

  getDues: async () => {
    try {
      const { data, error } = await supabase
        .from('site_dues')
        .select(`
          id,
          user_id,
          period,
          amount,
          status,
          due_date,
          payment_date,
          site_users (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(d => ({
        id: d.id,
        user_id: d.user_id,
        username: d.site_users?.username || 'Bilinmiyor',
        fullName: d.site_users?.full_name || 'Bilinmeyen Sakin',
        period: d.period,
        amount: d.amount,
        status: d.status,
        due_date: d.due_date,
        payment_date: d.payment_date
      }));
    } catch (err) {
      console.warn("getDues error, falling back to mock dashboard dues:", err.message);
      try {
        const { data: users } = await supabase
          .from('site_users')
          .select('*')
          .eq('role', 'resident');
        
        if (users && users.length > 0) {
          const list = [];
          users.slice(0, 30).forEach((u, index) => {
            list.push({
              id: `mock-all-${index}-1`,
              user_id: u.id,
              username: u.username,
              fullName: u.full_name,
              period: 'Haziran 2026',
              amount: 1500.00,
              status: index % 3 === 0 ? 'unpaid' : 'paid',
              due_date: '15.06.2026',
              payment_date: index % 3 === 0 ? null : '05.06.2026 11:32'
            });
            list.push({
              id: `mock-all-${index}-2`,
              user_id: u.id,
              username: u.username,
              fullName: u.full_name,
              period: 'Mayıs 2026',
              amount: 1500.00,
              status: 'paid',
              due_date: '15.05.2026',
              payment_date: '12.05.2026 17:40'
            });
          });
          return list;
        }
      } catch (inner) {
        console.error(inner);
      }
      return [];
    }
  },

  addDue: async (due) => {
    try {
      const { data, error } = await supabase
        .from('site_dues')
        .insert({
          user_id: due.user_id,
          period: due.period,
          amount: parseFloat(due.amount),
          due_date: due.due_date,
          status: due.status || 'unpaid',
          payment_date: due.payment_date || null
        })
        .select();
      if (error) throw error;
      return data ? data[0] : null;
    } catch (err) {
      console.error("addDue error:", err.message);
      return null;
    }
  },

  deleteDue: async (id) => {
    try {
      const { error } = await supabase
        .from('site_dues')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("deleteDue error:", err.message);
      return false;
    }
  },

  bulkAddDues: async (period, amount, dueDate) => {
    try {
      const { data: users, error: userError } = await supabase
        .from('site_users')
        .select('id')
        .eq('role', 'resident');
      
      if (userError) throw userError;
      
      if (users && users.length > 0) {
        const duesRecords = users.map(u => ({
          user_id: u.id,
          period: period,
          amount: parseFloat(amount),
          due_date: dueDate,
          status: 'unpaid',
          payment_date: null
        }));

        const chunkSize = 100;
        for (let i = 0; i < duesRecords.length; i += chunkSize) {
          const chunk = duesRecords.slice(i, i + chunkSize);
          const { error } = await supabase
            .from('site_dues')
            .insert(chunk);
          if (error) throw error;
        }
        return { success: true, count: duesRecords.length };
      }
      return { success: false, count: 0 };
    } catch (err) {
      console.error("bulkAddDues error:", err.message);
      return { success: false, error: err.message };
    }
  }
};

