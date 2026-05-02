'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (Auth.getCurrentUser()) {
    window.location.href = 'index.html';
    return;
  }

  const form       = document.getElementById('registerForm');
  const errorBox   = document.getElementById('registerError');
  const successBox = document.getElementById('registerSuccess');

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
    successBox.style.display = 'none';
  }

  function showSuccess(msg) {
    successBox.textContent = msg;
    successBox.style.display = 'block';
    errorBox.style.display = 'none';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const gender   = document.querySelector('input[name="gender"]:checked')?.value || '';
    const dob      = document.getElementById('dob').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    if (password !== password2) {
      showError('Паролі не співпадають');
      return;
    }

    const result = Auth.register({ name, email, gender, dob, password });

    if (!result.ok) {
      showError(result.error);
      return;
    }

    showSuccess('Акаунт створено! Переходимо до входу...');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  });
});