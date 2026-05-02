'use strict';


document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  renderProfile();
  const alarms = Storage.get('wakeup_alarms') || [];
  const totalEl  = document.getElementById('statTotal');
  const activeEl = document.getElementById('statActive');
  if (totalEl)  totalEl.textContent  = alarms.length;
  if (activeEl) activeEl.textContent = alarms.filter((a) => a.enabled).length;

  document.getElementById('editProfileBtn').addEventListener('click', openModal);

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
  document.getElementById('editOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.getElementById('editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleSave();
  });

  document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    if (confirm('Видалити акаунт? Цю дію не можна скасувати.')) {
      Auth.logout();
      window.location.href = 'login.html';
    }
  });
});

function renderProfile() {
  const user = Auth.getCurrentUser();

  const avatar = document.getElementById('profileAvatar');
  if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();

  setText('profileName',      user.name);
  setText('profileEmail',     user.email);
  setText('profileCreatedAt', user.createdAt);
  setText('profileNameT',     user.name);
  setText('profileEmailT',    user.email);
  setText('profileGender',    formatGender(user.gender));
  setText('profileDob',       formatDate(user.dob));
  setText('profileAge',       calcAge(user.dob) + ' років');
  setText('profileCreatedAtT', user.createdAt);
}

function openModal() {
  const user = Auth.getCurrentUser();

  document.getElementById('editName').value   = user.name;
  document.getElementById('editEmail').value  = user.email;
  document.getElementById('editDob').value    = user.dob;

  const genderRadio = document.querySelector(`input[name="editGender"][value="${user.gender}"]`);
  if (genderRadio) genderRadio.checked = true;

  clearEditError();
  document.getElementById('editOverlay').classList.add('show');
  document.getElementById('editName').focus();
}

function closeModal() {
  document.getElementById('editOverlay').classList.remove('show');
}

function handleSave() {
  const name   = document.getElementById('editName').value.trim();
  const email  = document.getElementById('editEmail').value.trim();
  const dob    = document.getElementById('editDob').value;
  const gender = document.querySelector('input[name="editGender"]:checked')?.value || '';

  const result = Auth.updateUser({ name, email, gender, dob });

  if (!result.ok) {
    showEditError(result.error);
    return;
  }

  closeModal();
  renderProfile();
  showToast('Профіль збережено ✓');
}

function showEditError(msg) {
  const el = document.getElementById('editError');
  el.textContent = msg;
  el.style.display = 'block';
}

function clearEditError() {
  const el = document.getElementById('editError');
  el.textContent = '';
  el.style.display = 'none';
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed; bottom:2rem; left:50%; transform:translateX(-50%);
      background:var(--success); color:#fff; padding:10px 24px;
      border-radius:8px; font-size:.9rem; font-weight:600;
      z-index:9999; opacity:0; transition:opacity .3s;
      white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '—';
}

function formatGender(g) {
  return { male: 'Чоловік', female: 'Жінка', other: 'Інше' }[g] || g;
}

function formatDate(dob) {
  if (!dob) return '—';
  const [y, m, d] = dob.split('-');
  const months = [
    'січня','лютого','березня','квітня','травня','червня',
    'липня','серпня','вересня','жовтня','листопада','грудня',
  ];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function calcAge(dob) {
  if (!dob) return '—';
  const birth = new Date(dob);
  const now   = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}