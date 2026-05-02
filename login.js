'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (Auth.getCurrentUser()) {
    window.location.href = 'index.html';
    return;
  }

  const form     = document.getElementById('loginForm');
  const errorBox = document.getElementById('loginError');

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const result = Auth.login({ email, password });

    if (!result.ok) {
      showError(result.error);
      return;
    }

    window.location.href = 'index.html';
  });

  const toggleBtn = document.getElementById('togglePassword');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const input = document.getElementById('password');
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  }
});