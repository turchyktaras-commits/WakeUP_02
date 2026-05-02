'use strict';

class AlarmModel {
  #storageKey;
  #alarms;
  #listeners;

  constructor() {
    this.#storageKey = 'wakeup_alarms';
    this.#alarms = this.#load();
    this.#listeners = [];

    if (this.#alarms.length === 0) {
      this.#alarms = [
        {
          id: 1,
          time: '06:30',
          name: 'Ранкова зарядка',
          days: [1, 2, 3, 4, 5],
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: 2,
          time: '08:00',
          name: 'Робота',
          days: [1, 2, 3, 4, 5],
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: 3,
          time: '22:30',
          name: 'Час спати',
          days: [0, 1, 2, 3, 4, 5, 6],
          enabled: false,
          createdAt: Date.now(),
        },
      ];
      this.#save();
    }
  }

  #load() {
    return Storage.get(this.#storageKey) || [];
  }

  #save() {
    Storage.set(this.#storageKey, this.#alarms);
    this.#notify();
  }

  #nextId() {
    return this.#alarms.length
      ? Math.max(...this.#alarms.map((a) => a.id)) + 1
      : 1;
  }

  subscribe(listener) {
    this.#listeners.push(listener);
  }

  #notify() {
    this.#listeners.forEach((fn) => fn(this.getAll()));
  }

  getAll() {
    return [...this.#alarms].sort((a, b) => a.time.localeCompare(b.time));
  }

  getById(id) {
    return this.#alarms.find((a) => a.id === id) || null;
  }


  add({ time, name, days }) {
    if (!time) return { ok: false, error: 'Вкажіть час будильника' };
    const alarm = {
      id: this.#nextId(),
      time,
      name: name.trim() || 'Будильник',
      days: days.length ? days : [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
      createdAt: Date.now(),
    };
    this.#alarms.push(alarm);
    this.#save();
    return { ok: true, alarm };
  }

  toggle(id) {
    const alarm = this.#alarms.find((a) => a.id === id);
    if (!alarm) return;
    alarm.enabled = !alarm.enabled;
    this.#save();
  }

  remove(id) {
    this.#alarms = this.#alarms.filter((a) => a.id !== id);
    this.#save();
  }

  get activeCount() {
    return this.#alarms.filter((a) => a.enabled).length;
  }

  get totalCount() {
    return this.#alarms.length;
  }
}