// Shared interactivity for Stethescope
(function () {
  const STORAGE_KEY = 'stethescope_state';
  const defaultState = {
    signedIn: false,
    user: { name: 'Dr. Sanjana Bhat', role: 'Physician', clinic: 'General Hospital', email: '' },
    plan: 'Trial Plan',
    planEnd: '14-05-2026',
    patients: [],
    appointments: [],
    prescriptions: [],
    notifications: []
  };
  const state = Object.assign({}, defaultState, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  window.App = { state, save };

  // ---- Toast ----
  function ensureToastContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
      document.body.appendChild(c);
    }
    return c;
  }
  window.toast = function (msg, type = 'info') {
    const c = ensureToastContainer();
    const colors = {
      info: { bg: '#0b1c30', fg: '#fff', icon: 'info' },
      success: { bg: '#006c48', fg: '#fff', icon: 'check_circle' },
      error: { bg: '#ba1a1a', fg: '#fff', icon: 'error' },
      warn: { bg: '#b45309', fg: '#fff', icon: 'warning' }
    };
    const col = colors[type] || colors.info;
    const el = document.createElement('div');
    el.style.cssText = `background:${col.bg};color:${col.fg};padding:12px 18px;border-radius:12px;box-shadow:0 8px 32px rgba(8,0,94,0.18);display:flex;align-items:center;gap:10px;font-family:Inter,sans-serif;font-size:14px;font-weight:500;pointer-events:auto;min-width:240px;max-width:420px;animation:toastIn .28s ease;`;
    el.innerHTML = `<span class="material-symbols-outlined" style="font-size:20px">${col.icon}</span><span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; el.style.transition = 'all .25s'; setTimeout(() => el.remove(), 260); }, 2600);
  };
  const styleTag = document.createElement('style');
  styleTag.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`;
  document.head.appendChild(styleTag);

  // ---- Modal ----
  window.openModal = function (html, opts = {}) {
    const existing = document.getElementById('app-modal');
    if (existing) existing.remove();
    const wrap = document.createElement('div');
    wrap.id = 'app-modal';
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(11,28,48,0.55);backdrop-filter:blur(6px);z-index:9998;display:flex;align-items:center;justify-content:center;padding:16px;animation:toastIn .2s ease;';
    wrap.innerHTML = `
      <div style="background:#fff;border-radius:16px;max-width:${opts.maxWidth || '480px'};width:100%;max-height:90vh;overflow:auto;box-shadow:0 24px 64px rgba(8,0,94,0.25);font-family:Inter,sans-serif">
        <div style="padding:20px 24px;border-bottom:1px solid #e5eeff;display:flex;justify-content:space-between;align-items:center">
          <h3 style="font-family:Manrope,sans-serif;font-weight:700;font-size:18px;color:#0b1c30;margin:0">${opts.title || 'Stethescope'}</h3>
          <button id="modal-close" style="background:none;border:none;cursor:pointer;color:#464651;display:flex"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div style="padding:20px 24px">${html}</div>
      </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e => { if (e.target === wrap) wrap.remove(); });
    document.getElementById('modal-close').onclick = () => wrap.remove();
    return wrap;
  };
  window.closeModal = function () { const m = document.getElementById('app-modal'); if (m) m.remove(); };

  // ---- Confirm ----
  window.confirmAction = function (msg, onYes, yesLabel = 'Confirm') {
    openModal(
      `<p style="color:#464651;margin:0 0 20px;line-height:1.5">${msg}</p>
       <div style="display:flex;gap:10px;justify-content:flex-end">
         <button id="cf-no" style="padding:10px 18px;border-radius:8px;border:1.5px solid #c7c5d3;background:#fff;cursor:pointer;font-weight:600;color:#0b1c30">Cancel</button>
         <button id="cf-yes" style="padding:10px 18px;border-radius:8px;border:none;background:linear-gradient(135deg,#1A237E,#08005E);color:#fff;cursor:pointer;font-weight:600">${yesLabel}</button>
       </div>`,
      { title: 'Please confirm' }
    );
    document.getElementById('cf-no').onclick = closeModal;
    document.getElementById('cf-yes').onclick = () => { closeModal(); onYes && onYes(); };
  };

  // ---- Universal click handler: data-action ----
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const payload = el.dataset.payload || '';
    switch (action) {
      case 'toast': e.preventDefault(); toast(payload || 'Action completed', el.dataset.type || 'success'); break;
      case 'signout':
        e.preventDefault();
        confirmAction('Are you sure you want to sign out?', () => {
          state.signedIn = false; save();
          toast('Signed out successfully', 'success');
          setTimeout(() => location.href = 'signin.html', 600);
        }, 'Sign out');
        break;
      case 'subscribe':
        e.preventDefault();
        const plan = el.dataset.plan || 'Premium';
        const price = el.dataset.price || '';
        openModal(
          `<div style="text-align:center">
            <div style="width:64px;height:64px;border-radius:50%;background:#62fdb9;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
              <span class="material-symbols-outlined" style="font-size:36px;color:#00734d">workspace_premium</span>
            </div>
            <h4 style="font-family:Manrope;font-weight:700;font-size:20px;margin:0 0 6px">Upgrade to ${plan}</h4>
            <p style="color:#464651;margin:0 0 20px">Total with GST: <strong style="color:#0b1c30">${price}</strong></p>
            <div style="background:#eff4ff;border-radius:12px;padding:16px;margin-bottom:20px;text-align:left">
              <div style="font-size:12px;font-weight:600;color:#464651;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">Select payment method</div>
              <label style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;background:#fff;margin-bottom:6px;cursor:pointer;border:2px solid #006c48">
                <input type="radio" name="pm" checked style="accent-color:#006c48"> <span>UPI (GPay / PhonePe / Paytm)</span>
              </label>
              <label style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;background:#fff;margin-bottom:6px;cursor:pointer;border:1px solid #c7c5d3">
                <input type="radio" name="pm" style="accent-color:#006c48"> <span>Credit / Debit Card</span>
              </label>
              <label style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;background:#fff;cursor:pointer;border:1px solid #c7c5d3">
                <input type="radio" name="pm" style="accent-color:#006c48"> <span>Net Banking</span>
              </label>
            </div>
            <button id="pay-now" style="width:100%;padding:14px;border-radius:10px;border:none;background:linear-gradient(135deg,#1A237E,#08005E);color:#fff;font-weight:700;cursor:pointer;font-size:15px">Pay ${price} securely</button>
            <p style="font-size:11px;color:#777682;margin-top:10px">HSN:997331 · Secured by Razorpay</p>
          </div>`,
          { title: 'Complete your subscription', maxWidth: '420px' }
        );
        document.getElementById('pay-now').onclick = () => {
          closeModal();
          toast('Processing payment...', 'info');
          setTimeout(() => {
            state.plan = plan; save();
            toast(`Welcome to ${plan}! Payment successful.`, 'success');
          }, 1400);
        };
        break;
      case 'navigate': e.preventDefault(); if (payload) location.href = payload; break;
      case 'back': e.preventDefault(); history.length > 1 ? history.back() : (location.href = 'dashboard.html'); break;
      case 'share-whatsapp':
        e.preventDefault();
        const msg = encodeURIComponent(payload || 'Check out my Stethescope digital clinic');
        window.open(`https://wa.me/?text=${msg}`, '_blank');
        toast('Opening WhatsApp...', 'info');
        break;
      case 'share-copy':
        e.preventDefault();
        navigator.clipboard.writeText(payload || location.href).then(() => toast('Link copied to clipboard', 'success'));
        break;
      case 'call':
        e.preventDefault();
        location.href = `tel:${payload || '+919876543210'}`;
        break;
      case 'email':
        e.preventDefault();
        location.href = `mailto:${payload || 'support@stethescope.biz'}`;
        break;
      case 'play-video':
        e.preventDefault();
        const vid = el.dataset.video || 'dQw4w9WgXcQ';
        openModal(
          `<div style="position:relative;padding-bottom:56.25%;height:0;border-radius:12px;overflow:hidden;background:#000">
            <iframe src="https://www.youtube.com/embed/${vid}?autoplay=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>`,
          { title: el.dataset.title || 'Video', maxWidth: '720px' }
        );
        break;
      case 'add-patient':
        e.preventDefault();
        openModal(
          `<form id="patient-form" style="display:grid;gap:12px">
            <label style="display:grid;gap:4px"><span style="font-size:12px;font-weight:600;color:#464651">Full name</span><input required name="name" style="padding:10px;border:1px solid #c7c5d3;border-radius:8px;font-family:Inter"/></label>
            <label style="display:grid;gap:4px"><span style="font-size:12px;font-weight:600;color:#464651">Phone</span><input required name="phone" type="tel" style="padding:10px;border:1px solid #c7c5d3;border-radius:8px;font-family:Inter"/></label>
            <label style="display:grid;gap:4px"><span style="font-size:12px;font-weight:600;color:#464651">Age</span><input name="age" type="number" style="padding:10px;border:1px solid #c7c5d3;border-radius:8px;font-family:Inter"/></label>
            <label style="display:grid;gap:4px"><span style="font-size:12px;font-weight:600;color:#464651">Complaint</span><textarea name="complaint" rows="2" style="padding:10px;border:1px solid #c7c5d3;border-radius:8px;font-family:Inter;resize:vertical"></textarea></label>
            <button type="submit" style="padding:12px;border-radius:8px;border:none;background:linear-gradient(135deg,#1A237E,#08005E);color:#fff;font-weight:700;cursor:pointer">Register patient</button>
          </form>`,
          { title: 'Add new patient' }
        );
        document.getElementById('patient-form').onsubmit = ev => {
          ev.preventDefault();
          const fd = new FormData(ev.target);
          state.patients.push({ id: Date.now(), name: fd.get('name'), phone: fd.get('phone'), age: fd.get('age'), complaint: fd.get('complaint') });
          save(); closeModal(); toast('Patient registered successfully', 'success');
        };
        break;
      case 'new-prescription':
        e.preventDefault();
        location.href = 'prescription.html';
        break;
      case 'save-prescription':
        e.preventDefault();
        toast('Prescription saved and sent to patient', 'success');
        setTimeout(() => location.href = 'dashboard.html', 900);
        break;
      case 'start-call':
        e.preventDefault();
        toast('Connecting to patient...', 'info');
        setTimeout(() => location.href = 'teleconsult.html', 700);
        break;
      case 'end-call':
        e.preventDefault();
        confirmAction('End the consultation?', () => {
          toast('Call ended. Duration: 12:34', 'success');
          setTimeout(() => location.href = 'dashboard.html', 800);
        }, 'End call');
        break;
      case 'schedule-appointment':
        e.preventDefault();
        openModal(
          `<form id="appt-form" style="display:grid;gap:12px">
            <label style="display:grid;gap:4px"><span style="font-size:12px;font-weight:600;color:#464651">Patient name</span><input required name="name" style="padding:10px;border:1px solid #c7c5d3;border-radius:8px;font-family:Inter"/></label>
            <label style="display:grid;gap:4px"><span style="font-size:12px;font-weight:600;color:#464651">Date & time</span><input required name="dt" type="datetime-local" style="padding:10px;border:1px solid #c7c5d3;border-radius:8px;font-family:Inter"/></label>
            <label style="display:grid;gap:4px"><span style="font-size:12px;font-weight:600;color:#464651">Type</span>
              <select name="type" style="padding:10px;border:1px solid #c7c5d3;border-radius:8px;font-family:Inter">
                <option>In-clinic</option><option>Tele-consultation</option>
              </select>
            </label>
            <button type="submit" style="padding:12px;border-radius:8px;border:none;background:linear-gradient(135deg,#1A237E,#08005E);color:#fff;font-weight:700;cursor:pointer">Schedule</button>
          </form>`,
          { title: 'Schedule appointment' }
        );
        document.getElementById('appt-form').onsubmit = ev => {
          ev.preventDefault();
          closeModal();
          toast('Appointment scheduled. Reminder will be sent via WhatsApp.', 'success');
        };
        break;
      case 'contact-submit':
        e.preventDefault();
        const form = el.closest('form');
        if (form && !form.checkValidity()) { form.reportValidity(); return; }
        toast('Message sent. We\'ll reply within 24 hours.', 'success');
        if (form) form.reset();
        break;
      case 'signin-submit':
        e.preventDefault();
        const sf = el.closest('form');
        if (sf && !sf.checkValidity()) { sf.reportValidity(); return; }
        state.signedIn = true;
        if (sf) state.user.email = sf.querySelector('[name=email]')?.value || state.user.email;
        save();
        toast('Signed in successfully', 'success');
        setTimeout(() => location.href = 'dashboard.html', 700);
        break;
      case 'signup-submit':
        e.preventDefault();
        const uf = el.closest('form');
        if (uf && !uf.checkValidity()) { uf.reportValidity(); return; }
        toast('Account created! Check your email to verify.', 'success');
        setTimeout(() => location.href = 'onboarding.html', 900);
        break;
      case 'google-auth':
      case 'apple-auth':
        e.preventDefault();
        toast(`${action === 'google-auth' ? 'Google' : 'Apple'} sign-in coming soon`, 'info');
        break;
      case 'send-rx-whatsapp':
        e.preventDefault();
        toast('Prescription sent to patient on WhatsApp', 'success');
        break;
      case 'send-rx-email':
        e.preventDefault();
        toast('Prescription emailed to patient', 'success');
        break;
      case 'print-rx':
        e.preventDefault();
        toast('Opening print dialog...', 'info');
        setTimeout(() => window.print(), 500);
        break;
      case 'blog-post':
        e.preventDefault();
        toast('Post editor opening...', 'info');
        setTimeout(() => location.href = 'blog.html#new', 500);
        break;
      case 'search':
        e.preventDefault();
        const term = prompt('Search Stethescope');
        if (term) toast(`Searching for "${term}"...`, 'info');
        break;
      case 'notifications':
        e.preventDefault();
        openModal(
          `<div style="display:flex;flex-direction:column;gap:10px">
            <div style="padding:12px;background:#eff4ff;border-radius:10px;border-left:3px solid #006c48">
              <div style="font-weight:600;font-size:14px">Sarah Jenkins arrived for 10:30 appointment</div>
              <div style="font-size:12px;color:#464651;margin-top:2px">2 mins ago</div>
            </div>
            <div style="padding:12px;background:#eff4ff;border-radius:10px;border-left:3px solid #b45309">
              <div style="font-weight:600;font-size:14px">Mr. Kumar's BP above threshold (158/102)</div>
              <div style="font-size:12px;color:#464651;margin-top:2px">18 mins ago</div>
            </div>
            <div style="padding:12px;background:#eff4ff;border-radius:10px;border-left:3px solid #33d7fe">
              <div style="font-weight:600;font-size:14px">Payment of ₹850 received from Emma Watson</div>
              <div style="font-size:12px;color:#464651;margin-top:2px">1 hr ago</div>
            </div>
          </div>`,
          { title: 'Notifications' }
        );
        break;
      case 'menu':
        e.preventDefault();
        const links = [
          ['home','Home','index.html'],['dashboard','Dashboard','dashboard.html'],
          ['group','Patients','patients.html'],['edit_note','Prescriptions','prescription.html'],
          ['videocam','Tele-Consult','teleconsult.html'],['monitor_heart','Chronic Care','chronic-care.html'],
          ['calendar_month','Calendar','calendar.html'],['payments','Revenue','revenue.html'],
          ['account_circle','Profile','profile.html'],['subscriptions','Subscriptions','subscriptions.html'],
          ['medical_services','Services','services.html'],['play_circle','Videos','videos.html'],
          ['article','Blog','blog.html'],['mail','Contact','contact.html']
        ];
        openModal(
          `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">
            ${links.map(([i,l,h]) => `<a href="${h}" style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:10px;background:#eff4ff;color:#0b1c30;text-decoration:none;font-weight:600;font-size:14px"><span class="material-symbols-outlined" style="color:#006c48">${i}</span>${l}</a>`).join('')}
          </div>`,
          { title: 'Menu' }
        );
        break;
    }
  });

  // Make bare href="#" buttons give a gentle toast instead of doing nothing
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href="#"]');
    if (!a || a.dataset.action) return;
    e.preventDefault();
    toast('Feature coming up', 'info');
  });

  // Auto-init search inputs
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('input[type=search], input[placeholder*="Search" i]').forEach(inp => {
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); toast(`Searching for "${inp.value}"...`, 'info'); }
      });
    });
    // Form submit fallback
    document.querySelectorAll('form').forEach(f => {
      if (f.dataset.handled) return;
      f.addEventListener('submit', e => {
        if (!f.querySelector('[data-action]')) {
          e.preventDefault();
          toast('Saved successfully', 'success');
          f.reset();
        }
      });
    });
  });
})();
