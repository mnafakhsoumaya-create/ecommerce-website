/* ============================================================
   DZ DÉPANNAGE — main.js
   Système complet : Données, Auth, Music, Animations
   Développé par : dz.depanneur
   ============================================================ */

'use strict';

/* ============================================================
   BASE DE DONNÉES (localStorage)
   ============================================================ */
const DZ = {

  /* --- COMMANDES --- */
  getOrders() {
    return JSON.parse(localStorage.getItem('dz_orders') || '[]');
  },
  saveOrders(orders) {
    localStorage.setItem('dz_orders', JSON.stringify(orders));
  },
  addOrder(o) {
    const orders = this.getOrders();
    o.id   = 'CMD-' + Date.now();
    o.date = new Date().toLocaleDateString('fr-FR');
    o.status = 'pending';
    orders.push(o);
    this.saveOrders(orders);
    return o.id;
  },
  updateOrder(id, updates) {
    const orders = this.getOrders();
    const i = orders.findIndex(o => o.id === id);
    if (i !== -1) { orders[i] = { ...orders[i], ...updates }; this.saveOrders(orders); return true; }
    return false;
  },
  deleteOrder(id) {
    this.saveOrders(this.getOrders().filter(o => o.id !== id));
  },
  clientOrders(email) {
    return this.getOrders().filter(o => o.email === email);
  },

  /* --- CLIENTS --- */
  getClients() {
    return JSON.parse(localStorage.getItem('dz_clients') || '[]');
  },
  saveClients(c) {
    localStorage.setItem('dz_clients', JSON.stringify(c));
  },
  registerClient(c) {
    const clients = this.getClients();
    if (clients.find(x => x.email === c.email)) return false;
    c.id   = 'CLI-' + Date.now();
    c.date = new Date().toLocaleDateString('fr-FR');
    clients.push(c);
    this.saveClients(clients);
    return true;
  },
  loginClient(email, pwd) {
    return this.getClients().find(c => c.email === email && c.password === pwd) || null;
  },
  currentClient() {
    return JSON.parse(sessionStorage.getItem('dz_client') || 'null');
  },
  setClient(c) { sessionStorage.setItem('dz_client', JSON.stringify(c)); },
  logoutClient() { sessionStorage.removeItem('dz_client'); },

  /* --- ADMINS --- */
  ADMINS: [
    { username: 'admin1', password: 'dzdepannage@2024', name: 'Admin Principal',   role: 'Super Admin' },
    { username: 'admin2', password: 'depannage@2024',   name: 'Admin Secondaire',  role: 'Manager'     }
  ],
  loginAdmin(u, p) {
    return this.ADMINS.find(a => a.username === u && a.password === p) || null;
  },
  currentAdmin() {
    return JSON.parse(sessionStorage.getItem('dz_admin') || 'null');
  },
  setAdmin(a) { sessionStorage.setItem('dz_admin', JSON.stringify(a)); },
  logoutAdmin() { sessionStorage.removeItem('dz_admin'); }
};

/* Seed demo data */
if (!DZ.getOrders().length) {
  DZ.saveOrders([
    { id:'CMD-001', name:'Ahmed Benali',  email:'ahmed@test.com', phone:'0555123456', service:'Remorquage Voiture', vehicle:'Peugeot 208',   location:'Alger Centre', message:'En panne sur la route',  date:'12/01/2024', status:'confirmed' },
    { id:'CMD-002', name:'Karim Hadj',    email:'karim@test.com', phone:'0661234567', service:'Intervention Route', vehicle:'Moto Yamaha',   location:'Oran',          message:'Crevaison urgente',     date:'13/01/2024', status:'pending'   },
    { id:'CMD-003', name:'Sara Meziane',  email:'sara@test.com',  phone:'0771234567', service:'Remorquage Quad',   vehicle:'Quad 250cc',    location:'Constantine',   message:'Panne moteur',          date:'14/01/2024', status:'done'      }
  ]);
}
if (!DZ.getClients().length) {
  DZ.registerClient({ name: 'Ahmed Benali', email: 'ahmed@test.com', password: '1234', phone: '0555123456' });
}

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function toggleMenu() {
  const nl = document.querySelector('.nav-links');
  const na = document.querySelector('.nav-actions');
  if (nl) nl.style.display = nl.style.display === 'flex' ? 'none' : 'flex';
  if (na) na.style.display = na.style.display === 'flex' ? 'none' : 'flex';
}

/* ============================================================
   PARTICLES
   ============================================================ */
function initParticles() {
  const wrap = document.getElementById('particles');
  if (!wrap) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px; height: ${size}px;
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 12}s;
    `;
    wrap.appendChild(p);
  }
}

/* ============================================================
   MUSIC (Web Audio API)
   ============================================================ */
let audioCtx = null;
let musicPlaying = false;

function toggleMusic() {
  const btn = document.getElementById('musicBtn');
  if (musicPlaying) {
    stopMusic();
    if (btn) btn.textContent = '♪';
    musicPlaying = false;
  } else {
    startMusic();
    if (btn) btn.textContent = '⏸';
    musicPlaying = true;
  }
}

function startMusic() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
  (function playNote() {
    if (!audioCtx) return;
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 700;
    osc.type = 'sine';
    osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 1.5);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 4.5);
    osc.connect(filt); filt.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 5);
    setTimeout(playNote, 2200 + Math.random() * 3000);
  })();
}

function stopMusic() {
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ============================================================
   STATUS LABELS
   ============================================================ */
const STATUS_LABELS = {
  pending:   'En Attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  done:      'Terminée'
};

/* ============================================================
   MODAL (EDIT)
   ============================================================ */
function openEditModal(id) {
  const o = DZ.getOrders().find(x => x.id === id);
  if (!o) return;
  document.getElementById('editId').value       = o.id;
  document.getElementById('editName').value     = o.name || '';
  document.getElementById('editPhone').value    = o.phone || '';
  document.getElementById('editService').value  = o.service || '';
  document.getElementById('editVehicle').value  = o.vehicle || '';
  document.getElementById('editLocation').value = o.location || '';
  document.getElementById('editStatus').value   = o.status || 'pending';
  document.getElementById('editMessage').value  = o.message || '';
  document.getElementById('editModal').classList.add('open');
}

function closeModal() {
  const m = document.getElementById('editModal');
  if (m) m.classList.remove('open');
}

function saveEdit() {
  DZ.updateOrder(document.getElementById('editId').value, {
    name:     document.getElementById('editName').value,
    phone:    document.getElementById('editPhone').value,
    service:  document.getElementById('editService').value,
    vehicle:  document.getElementById('editVehicle').value,
    location: document.getElementById('editLocation').value,
    status:   document.getElementById('editStatus').value,
    message:  document.getElementById('editMessage').value
  });
  closeModal();
  if (typeof renderAdminOrders === 'function') renderAdminOrders();
  if (typeof loadAdminStats   === 'function') loadAdminStats();
  showToast('✏️ Commande modifiée !');
}

/* ============================================================
   SCROLL ANIMATIONS
   ============================================================ */
function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.service-card, .why-item, .social-card, .admin-stat-card').forEach(el => {
    observer.observe(el);
  });
}

/* ============================================================
   INIT (runs on every page)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initParticles();
  initScrollAnimations();
  // ESC closes modal
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

/* expose globally */
window.DZ           = DZ;
window.toggleMusic  = toggleMusic;
window.toggleMenu   = toggleMenu;
window.openEditModal= openEditModal;
window.closeModal   = closeModal;
window.saveEdit     = saveEdit;
window.showToast    = showToast;
window.STATUS_LABELS= STATUS_LABELS;
