'use strict';

const Auth = (() => {
  const USERS_KEY = 'wakeup_users';
  const SESSION_KEY = 'wakeup_session';

  function getUsers() {
    return Storage.get(USERS_KEY) || [];
  }

  function saveUsers(users) {
    Storage.set(USERS_KEY, users);
  }

  function getCurrentUser() {
    return Storage.get(SESSION_KEY);
  }

  function setCurrentUser(user) {
    Storage.set(SESSION_KEY, user);
  }

  function register({ name, email, gender, dob, password }) {
    if (!name || !email || !gender || !dob || !password) {
      return { ok: false, error: 'Заповніть усі поля' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Пароль має бути не менше 6 символів' };
    }
    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      return { ok: false, error: 'Користувач з таким email вже існує' };
    }
    const user = {
      id: Date.now(),
      name,
      email,
      gender,
      dob,
      password,
      createdAt: new Date().toLocaleDateString('uk-UA'),
    };
    users.push(user);
    saveUsers(users);
    return { ok: true, user };
  }

  function login({ email, password }) {
    if (!email || !password) {
      return { ok: false, error: 'Введіть email та пароль' };
    }
    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return { ok: false, error: 'Невірний email або пароль' };
    }
    setCurrentUser(user);
    return { ok: true, user };
  }

  function updateUser({ name, email, gender, dob }) {
    const current = getCurrentUser();
    if (!current) return { ok: false, error: 'Не авторизований' };
    if (!name || !email || !gender || !dob) {
      return { ok: false, error: 'Заповніть усі поля' };
    }

    const users = getUsers();
    const conflict = users.find((u) => u.email === email && u.id !== current.id);
    if (conflict) return { ok: false, error: 'Цей email вже використовується' };

    const idx = users.findIndex((u) => u.id === current.id);
    if (idx === -1) return { ok: false, error: 'Користувача не знайдено' };

    users[idx] = { ...users[idx], name, email, gender, dob };
    saveUsers(users);
    setCurrentUser(users[idx]);
    return { ok: true, user: users[idx] };
  }

  function logout() {
    Storage.remove(SESSION_KEY);
  }

  function requireAuth() {
    if (!getCurrentUser()) {
      window.location.href = 'login.html';
    }
  }

  return { register, login, logout, getCurrentUser, requireAuth, updateUser };
})();