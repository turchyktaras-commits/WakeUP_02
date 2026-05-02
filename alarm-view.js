'use strict';

class AlarmView {
  #DAY_NAMES = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  #MONTHS = [
    'січня','лютого','березня','квітня','травня','червня',
    'липня','серпня','вересня','жовтня','листопада','грудня',
  ];
  #WEEKDAYS = ['Неділя','Понеділок','Вівторок','Середа','Четвер','П\'ятниця','Субота'];

  constructor() {
    this.$clockHM   = document.getElementById('clockHM');
    this.$clockS    = document.getElementById('clockS');
    this.$clockDate = document.getElementById('clockDate');
    this.$alarmList = document.getElementById('alarmList');
    this.$alarmCount = document.getElementById('alarmCount');
    this.$timeInput = document.getElementById('alarmTime');
    this.$nameInput = document.getElementById('alarmName');
    this.$addBtn    = document.getElementById('addAlarmBtn');
    this.$dayBtns   = document.querySelectorAll('.day-btn');
    this.$ringOverlay = document.getElementById('ringOverlay');
    this.$ringTime  = document.getElementById('ringTime');
    this.$ringName  = document.getElementById('ringName');
    this.$dismissBtn = document.getElementById('dismissBtn');
    this.$snoozeBtn  = document.getElementById('snoozeBtn');
    this.$userName  = document.getElementById('userNameDisplay');
  }

  renderClock(h, m, s, date) {
    this.$clockHM.textContent   = `${h}:${m}`;
    this.$clockS.textContent    = s;
    this.$clockDate.textContent = date;
  }

  renderAlarms(alarms) {
    const count = alarms.length;
    const word = count === 1 ? 'будильник' : count < 5 ? 'будильники' : 'будильників';
    this.$alarmCount.textContent = `${count} ${word}`;

    if (!count) {
      this.$alarmList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⏰</div>
          <div class="empty-text">Будильників ще немає<br>Додайте перший вище</div>
        </div>`;
      return;
    }

    this.$alarmList.innerHTML = alarms.map((a) => this.#alarmTemplate(a)).join('');
  }

  #alarmTemplate(alarm) {
    const daysLabel = this.#formatDays(alarm.days);
    return `
      <div class="alarm-item${alarm.enabled ? '' : ' inactive'}" data-id="${alarm.id}">
        <div class="alarm-time-big">${alarm.time}</div>
        <div class="alarm-details">
          <div class="alarm-name">${this.#escape(alarm.name)}</div>
          <div class="alarm-days">${daysLabel}</div>
        </div>
        <div class="alarm-toggle${alarm.enabled ? ' on' : ''}"
             data-action="toggle" data-id="${alarm.id}"
             title="${alarm.enabled ? 'Вимкнути' : 'Увімкнути'}">
        </div>
        <button class="alarm-del" data-action="delete" data-id="${alarm.id}" title="Видалити">✕</button>
      </div>`;
  }

  #formatDays(days) {
    if (!days || !days.length) return 'Одноразово';
    if (days.length === 7) return 'Щодня';
    const sorted = [...days].sort((a, b) => a - b);
    if (JSON.stringify(sorted) === JSON.stringify([1, 2, 3, 4, 5])) return 'Будні';
    if (JSON.stringify(sorted) === JSON.stringify([0, 6])) return 'Вихідні';
    return sorted.map((d) => this.#DAY_NAMES[d]).join(', ');
  }

  #escape(str) {
    return str.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  showRing(alarm) {
    this.$ringTime.textContent = alarm.time;
    this.$ringName.textContent = alarm.name;
    this.$ringOverlay.classList.add('show');
  }

  hideRing() {
    this.$ringOverlay.classList.remove('show');
  }

  renderUserName(name) {
    if (this.$userName && name) {
      this.$userName.textContent = name;
    }
  }

  showError(msg) {
    let el = document.getElementById('addError');
    if (!el) {
      el = document.createElement('p');
      el.id = 'addError';
      el.style.cssText = 'color:var(--danger);font-size:.85rem;margin-top:.5rem;';
      this.$addBtn.parentNode.appendChild(el);
    }
    el.textContent = msg;
    setTimeout(() => { el.textContent = ''; }, 3000);
  }

  getSelectedDays() {
    return [...this.$dayBtns]
      .filter((b) => b.classList.contains('active'))
      .map((b) => parseInt(b.dataset.d, 10));
  }

  getFormData() {
    const time = this.$timeInput.value;
    const name = this.$nameInput.value;
    const days = this.getSelectedDays();
    this.$nameInput.value = '';
    return { time, name, days };
  }

  bindAdd(handler) {
    this.$addBtn.addEventListener('click', handler);
  }

  bindListActions(onToggle, onDelete) {
    this.$alarmList.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const id = parseInt(el.dataset.id, 10);
      if (el.dataset.action === 'toggle') onToggle(id);
      if (el.dataset.action === 'delete') onDelete(id);
    });
  }

  bindDayButtons() {
    this.$dayBtns.forEach((btn) => {
      btn.addEventListener('click', () => btn.classList.toggle('active'));
    });
  }

  bindRingButtons(onDismiss, onSnooze) {
    this.$dismissBtn.addEventListener('click', onDismiss);
    this.$snoozeBtn.addEventListener('click', onSnooze);
  }

  buildDateString(now) {
    const d   = now.getDate();
    const mo  = this.#MONTHS[now.getMonth()];
    const wd  = this.#WEEKDAYS[now.getDay()];
    return `${wd}, ${d} ${mo} ${now.getFullYear()}`;
  }
}