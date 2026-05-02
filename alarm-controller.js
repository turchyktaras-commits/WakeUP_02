'use strict';

class AlarmController {
  #model;
  #view;
  #clockInterval;
  #snoozeTarget; 

  constructor(model, view) {
    this.#model = model;
    this.#view  = view;
    this.#snoozeTarget = null;
  }

  init() {
    Auth.requireAuth();

    const user = Auth.getCurrentUser();
    this.#view.renderUserName(user ? user.name : '');

    this.#model.subscribe((alarms) => this.#view.renderAlarms(alarms));

    this.#view.bindDayButtons();
    this.#view.bindAdd(() => this.#handleAdd());
    this.#view.bindListActions(
      (id) => this.#handleToggle(id),
      (id) => this.#handleDelete(id),
    );
    this.#view.bindRingButtons(
      () => this.#handleDismiss(),
      () => this.#handleSnooze(),
    );

    this.#view.renderAlarms(this.#model.getAll());
    this.#startClock();
  }

  #startClock() {
    const tick = () => {
      const now = new Date();
      const hh  = String(now.getHours()).padStart(2, '0');
      const mm  = String(now.getMinutes()).padStart(2, '0');
      const ss  = String(now.getSeconds()).padStart(2, '0');
      this.#view.renderClock(hh, mm, ss, this.#view.buildDateString(now));

      if (ss === '00') this.#checkAlarms(now, hh, mm);
    };
    tick();
    this.#clockInterval = setInterval(tick, 1000);
  }

  #checkAlarms(now, hh, mm) {
    const hhmm   = `${hh}:${mm}`;
    const dayIdx = now.getDay();

    if (
      this.#snoozeTarget
      && this.#snoozeTarget.hh === hh
      && this.#snoozeTarget.mm === mm
    ) {
      const alarm = this.#model.getById(this.#snoozeTarget.alarmId);
      if (alarm) this.#ring(alarm);
      this.#snoozeTarget = null;
      return;
    }

    this.#model.getAll().forEach((alarm) => {
      if (alarm.enabled && alarm.time === hhmm && alarm.days.includes(dayIdx)) {
        this.#ring(alarm);
      }
    });
  }

  #ring(alarm) {
    this.#view.showRing(alarm);
    if (Notification.permission === 'granted') {
      new Notification(`⏰ WakeUp: ${alarm.name}`, {
        body: `Час: ${alarm.time}`,
        icon: '',
      });
    }
  }

  #handleAdd() {
    const data = this.#view.getFormData();
    const result = this.#model.add(data);
    if (!result.ok) {
      this.#view.showError(result.error);
      return;
    }
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  #handleToggle(id) {
    this.#model.toggle(id);
  }

  #handleDelete(id) {
    this.#model.remove(id);
  }

  #handleDismiss() {
    this.#view.hideRing();
    this.#snoozeTarget = null;
  }

  #handleSnooze() {
    this.#view.hideRing();
    const snoozeTime = new Date(Date.now() + 5 * 60 * 1000);
    const hh = String(snoozeTime.getHours()).padStart(2, '0');
    const mm = String(snoozeTime.getMinutes()).padStart(2, '0');
    const ringing = this.#model.getAll().find((a) => a.enabled);
    if (ringing) {
      this.#snoozeTarget = { hh, mm, alarmId: ringing.id };
    }
  }

  destroy() {
    clearInterval(this.#clockInterval);
  }
}