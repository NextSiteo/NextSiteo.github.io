/* ==================================================================
   AUTOSCUOLE CROCEVIA · AREA ALLIEVI (demo di Next Siteo)
   Prenotazione in tre passi (sede e tipo, giorno, orario), guide
   prenotate con disdetta annullabile, percorso dalla teoria all'esame.
   Tutto vive in memoria: nessun dato viene inviato o salvato,
   ricaricando la pagina si riparte da capo.
   ================================================================== */
(function () {
  'use strict';

  var C = window.Crocevia;
  if (!C) return;

  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var el = function (tag, text, cls) {
    var n = document.createElement(tag);
    if (text != null) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  };
  var badge = function (sede) {
    var b = el('span', sede.sigla, 'line');
    b.dataset.line = sede.sigla;
    b.setAttribute('aria-hidden', 'true');
    return b;
  };
  var avviso = function (msg) {
    if (window.NextSiteoDemo) window.NextSiteoDemo.avviso(msg);
  };
  var hh = function (h) {
    return h + ':00';
  };
  var tipoNome = function (id) {
    return C.TIPI.filter(function (t) { return t.id === id; })[0].nome;
  };
  var oggi = new Date();
  oggi = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate());

  /* ---------- Dati dell'allievo di prova ---------- */
  var ALLIEVO = {
    iscrizione: C.addDays(oggi, -70),
    lezioni: 18,
    lezioniTot: 20,
    schede: [2, 1, 0, 1, 0],
    esameTeoria: C.addDays(oggi, -21),
    // Guide obbligatorie già fatte (ne servono 2 per tipo)
    obbligatorie: { extraurbana: 2, autostrada: 1, notturna: 0 },
    guideFatte: 5
  };

  // Sede iniziale: dal link "Prenota una guida qui" della home (?sede=...)
  var param = (location.search.match(/[?&]sede=([a-z-]+)/) || [])[1];
  var sedeIniziale = param && C.sede(param) ? param : 'vallefinta';

  // Una guida già prenotata: il prossimo giorno feriale alle 10
  var primo = C.addDays(oggi, 1);
  while (primo.getDay() === 0 || primo.getDay() === 6) primo = C.addDays(primo, 1);
  var state = {
    sede: sedeIniziale,
    tipo: 'citta',
    week: 0,
    day: null,
    bookings: [{ sede: 'vallefinta', date: C.iso(primo), ora: 10, tipo: 'autostrada', auto: C.auto('vallefinta', primo, 10) }],
    undo: null
  };

  var mine = function (date, ora) {
    return state.bookings.filter(function (b) {
      return b.date === C.iso(date) && b.ora === ora;
    })[0];
  };

  var slotState = function (date, ora) {
    var b = mine(date, ora);
    if (b && b.sede === state.sede) return 'mine';
    if (b) return 'conflict';
    if (C.passato(date, ora)) return 'past';
    if (C.occupato(state.sede, date, ora)) return 'busy';
    return 'free';
  };

  var weekDays = function (w) {
    var mon = C.addDays(C.monday(oggi), 7 * w);
    var out = [];
    for (var i = 0; i < 6; i++) out.push(C.addDays(mon, i));
    return out;
  };

  var freeCount = function (date) {
    return C.ore(date, state.tipo).filter(function (h) {
      return slotState(date, h) === 'free';
    }).length;
  };

  var selectable = function (date) {
    return date >= oggi && C.ore(date, state.tipo).length > 0;
  };

  // Primo giorno utile con posti liberi (anche nelle settimane successive)
  var pickDefault = function () {
    for (var w = 0; w < 3; w++) {
      var days = weekDays(w);
      for (var i = 0; i < days.length; i++) {
        if (selectable(days[i]) && freeCount(days[i]) > 0) {
          state.week = w;
          state.day = C.iso(days[i]);
          return;
        }
      }
    }
    state.day = null;
  };

  /* ---------- Passo 1: sede e tipo ---------- */
  var boxSedi = $('[data-sedi]');
  var boxTipi = $('[data-tipi]');
  C.SEDI.forEach(function (s) {
    var lab = el('label', null, 'option');
    var input = el('input');
    input.type = 'radio';
    input.name = 'sede';
    input.value = s.id;
    input.checked = s.id === state.sede;
    var txt = el('span', null, 'option__text');
    txt.appendChild(el('strong', s.nome));
    txt.appendChild(el('small', s.indirizzo));
    var check = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    check.setAttribute('class', 'icon option__check');
    check.setAttribute('aria-hidden', 'true');
    check.innerHTML = '<use href="#i-check"/>';
    lab.appendChild(input);
    lab.appendChild(badge(s));
    lab.appendChild(txt);
    lab.appendChild(check);
    boxSedi.appendChild(lab);
  });
  C.TIPI.forEach(function (t) {
    var lab = el('label', null, 'option');
    var input = el('input');
    input.type = 'radio';
    input.name = 'tipo';
    input.value = t.id;
    input.checked = t.id === state.tipo;
    lab.appendChild(input);
    lab.appendChild(document.createTextNode(t.nome));
    boxTipi.appendChild(lab);
  });
  boxSedi.addEventListener('change', function (e) {
    state.sede = e.target.value;
    clearBooked();
    var d = state.day ? C.fromIso(state.day) : null;
    if (!d || freeCount(d) === 0) pickDefault();
    renderCalendar();
  });
  boxTipi.addEventListener('change', function (e) {
    state.tipo = e.target.value;
    clearBooked();
    var d = state.day ? C.fromIso(state.day) : null;
    if (!d || !selectable(d)) pickDefault();
    renderCalendar();
  });

  /* ---------- Passo 2 e 3: calendario e orari ---------- */
  var label = $('[data-week-label]');
  var daysBox = $('[data-days]');
  var slotsBox = $('[data-slots]');
  var slotsTitle = $('[data-slots-title]');
  var prev = $('[data-week-prev]');
  var next = $('[data-week-next]');
  var steps = $$('[data-steps] li');
  var booked = $('[data-booked]');

  var clearBooked = function () {
    booked.innerHTML = '';
  };

  prev.addEventListener('click', function () {
    state.week = Math.max(0, state.week - 1);
    var d = weekDays(state.week).filter(selectable)[0];
    state.day = d ? C.iso(d) : null;
    renderCalendar();
  });
  next.addEventListener('click', function () {
    state.week = Math.min(2, state.week + 1);
    var d = weekDays(state.week).filter(selectable)[0];
    state.day = d ? C.iso(d) : null;
    renderCalendar();
  });

  function renderSteps() {
    var current = state.day ? 2 : 1;
    steps.forEach(function (li, i) {
      li.classList.toggle('is-done', i < current);
      li.classList.toggle('is-current', i === current);
      if (i === current) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
  }

  function renderCalendar() {
    var days = weekDays(state.week);
    var a = days[0];
    var b = days[days.length - 1];
    label.textContent =
      a.getMonth() === b.getMonth()
        ? a.getDate() + '-' + b.getDate() + ' ' + C.MESI[b.getMonth()]
        : a.getDate() + ' ' + C.MESI[a.getMonth()].slice(0, 3) + ' - ' + b.getDate() + ' ' + C.MESI[b.getMonth()].slice(0, 3);
    prev.disabled = state.week === 0;
    next.disabled = state.week === 2;

    daysBox.innerHTML = '';
    days.forEach(function (d) {
      var btn = el('button', null, 'day');
      btn.type = 'button';
      var ok = selectable(d);
      var free = ok ? freeCount(d) : 0;
      btn.disabled = !ok;
      btn.setAttribute('aria-pressed', String(C.iso(d) === state.day));
      // Il nome accessibile nasce dal testo visibile, completato da parti solo per i lettori di schermo
      btn.appendChild(el('span', C.GIORNI_BREVI[d.getDay()], 'day__name'));
      btn.appendChild(el('span', String(d.getDate()), 'day__num'));
      btn.appendChild(el('span', ' ' + C.MESI[d.getMonth()] + ', ', 'sr-only'));
      if (ok) {
        btn.appendChild(el('span', free + (free === 1 ? ' libero' : ' liberi'), 'day__free'));
      } else {
        var dash = el('span', '—', 'day__free');
        dash.setAttribute('aria-hidden', 'true');
        btn.appendChild(dash);
        btn.appendChild(el('span', 'non disponibile', 'sr-only'));
      }
      btn.addEventListener('click', function () {
        state.day = C.iso(d);
        clearBooked();
        renderCalendar();
      });
      daysBox.appendChild(btn);
    });
    renderSlots();
    renderSteps();
  }

  function renderSlots() {
    slotsBox.innerHTML = '';
    if (!state.day) {
      slotsTitle.textContent = 'Orario';
      slotsBox.appendChild(el('p', 'Nessun giorno disponibile in questa settimana: prova con la successiva.', 'empty'));
      return;
    }
    var d = C.fromIso(state.day);
    slotsTitle.textContent = 'Orari di ' + C.dataLunga(d);
    var hours = C.ore(d, state.tipo);
    if (!hours.length) {
      slotsBox.appendChild(el('p', 'In questo giorno non ci sono guide di questo tipo. Scegli un altro giorno.', 'empty'));
      return;
    }
    var txt = { free: 'Libero', busy: 'Occupato', mine: 'La tua guida', past: 'Passato', conflict: 'Hai già una guida' };
    hours.forEach(function (h) {
      var s = slotState(d, h);
      var btn = el('button', null, 'slot');
      btn.type = 'button';
      btn.dataset.state = s === 'conflict' ? 'busy' : s;
      btn.appendChild(el('span', hh(h), 'slot__time'));
      btn.appendChild(el('small', txt[s]));
      if (s === 'free') {
        btn.addEventListener('click', function () {
          ask(d, h);
        });
      } else {
        btn.setAttribute('aria-disabled', 'true');
      }
      slotsBox.appendChild(btn);
    });
  }

  /* ---------- Conferma prenotazione ---------- */
  var dlg = $('[data-confirm]');
  var dlgList = $('[data-confirm-list]');
  var pending = null;

  function ask(d, h) {
    pending = { sede: state.sede, date: C.iso(d), ora: h, tipo: state.tipo, auto: C.auto(state.sede, d, h) };
    var s = C.sede(state.sede);
    var rows = [
      ['Giorno', C.dataLunga(d)],
      ['Orario', hh(h) + '-' + hh(h + 1)],
      ['Sede', s.nome + ', ' + s.indirizzo],
      ['Guida', tipoNome(state.tipo)],
      ['Auto', pending.auto]
    ];
    dlgList.innerHTML = '';
    rows.forEach(function (r) {
      dlgList.appendChild(el('dt', r[0]));
      dlgList.appendChild(el('dd', r[1]));
    });
    if (typeof dlg.showModal === 'function') {
      dlg.returnValue = '';
      dlg.showModal();
    } else if (window.confirm('Confermi la guida di ' + C.dataLunga(d) + ' alle ' + hh(h) + '?')) {
      book();
    }
  }

  // La scelta si legge dall'invio del form (sincrono): non dipende dall'evento "close"
  $('form', dlg).addEventListener('submit', function (e) {
    var ok = e.submitter ? e.submitter.value === 'ok' : dlg.returnValue === 'ok';
    if (ok) book();
    pending = null;
  });

  function book() {
    if (!pending) return;
    var b = pending;
    state.bookings.push(b);
    avviso('Guida prenotata per finta: ' + C.dataLunga(C.fromIso(b.date)) + ' alle ' + hh(b.ora) + '. Nessun dato è stato inviato.');
    renderAll();
    booked.innerHTML = '';
    var msg = el('p', null, 'booked-msg');
    var ic = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ic.setAttribute('class', 'icon');
    ic.setAttribute('aria-hidden', 'true');
    ic.innerHTML = '<use href="#i-check"/>';
    msg.appendChild(ic);
    msg.appendChild(el('span', 'Guida prenotata: ' + C.dataLunga(C.fromIso(b.date)) + ' alle ' + hh(b.ora) + '.'));
    var go = el('button', 'Vedi le mie guide');
    go.type = 'button';
    go.addEventListener('click', function () {
      goTab('guide', true);
    });
    msg.appendChild(go);
    booked.appendChild(msg);
    // Il pulsante dell'orario è stato ridisegnato: il focus va sul messaggio di conferma
    msg.tabIndex = -1;
    setTimeout(function () {
      msg.focus();
    }, 0);
  }

  /* ---------- Prossima guida ---------- */
  var nextBox = $('[data-next]');
  function renderNext() {
    var future = state.bookings
      .filter(function (b) { return !C.passato(C.fromIso(b.date), b.ora); })
      .sort(function (a, b) { return a.date === b.date ? a.ora - b.ora : a.date < b.date ? -1 : 1; });
    var label = $('.next__label', nextBox);
    nextBox.innerHTML = '';
    nextBox.appendChild(label);
    if (!future.length) {
      var none = el('p', 'Nessuna guida prenotata.', 'next__what');
      nextBox.appendChild(none);
      var go = el('button', 'Prenota una guida', 'btn btn--sm');
      go.type = 'button';
      go.addEventListener('click', function () {
        goTab('prenota', true);
      });
      nextBox.appendChild(go);
      return;
    }
    var b = future[0];
    var d = C.fromIso(b.date);
    var s = C.sede(b.sede);
    var when = el('p', null, 'next__when');
    when.appendChild(el('b', hh(b.ora)));
    when.appendChild(el('span', C.GIORNI_BREVI[d.getDay()] + ' ' + d.getDate() + ' ' + C.MESI[d.getMonth()].slice(0, 3)));
    var what = el('p', null, 'next__what');
    var st = el('strong');
    st.appendChild(badge(s));
    st.appendChild(document.createTextNode('Sede ' + s.nome));
    what.appendChild(st);
    what.appendChild(el('span', 'Guida ' + tipoNome(b.tipo).toLowerCase() + ' – ' + b.auto));
    nextBox.appendChild(when);
    nextBox.appendChild(what);
    if (future.length > 1) {
      var all = el('button', 'Tutte le guide (' + future.length + ')', 'btn btn--sm');
      all.type = 'button';
      all.addEventListener('click', function () {
        goTab('guide', true);
      });
      nextBox.appendChild(all);
    }
  }

  /* ---------- Le mie guide, con disdetta annullabile ---------- */
  var list = $('[data-bookings]');
  var count = $('[data-count]');
  var countSr = $('[data-count-sr]');
  var undoLive = $('[data-undo-live]');

  function cancel(b) {
    state.bookings.splice(state.bookings.indexOf(b), 1);
    if (state.undo) clearTimeout(state.undo.timer);
    state.undo = {
      booking: b,
      timer: setTimeout(function () {
        state.undo = null;
        renderBookings();
      }, 8000)
    };
    undoLive.textContent = 'Guida disdetta. Puoi annullare per qualche secondo.';
    avviso('Guida disdetta per finta: il posto torna libero nel calendario.');
    renderAll();
    var btn = $('[data-undo-btn]', list);
    if (btn) btn.focus();
  }

  function restore() {
    if (!state.undo) return;
    clearTimeout(state.undo.timer);
    state.bookings.push(state.undo.booking);
    state.undo = null;
    undoLive.textContent = 'Disdetta annullata: la guida è di nuovo prenotata.';
    renderAll();
    list.focus();
  }

  function renderBookings() {
    var sorted = state.bookings.slice().sort(function (a, b) {
      return a.date === b.date ? a.ora - b.ora : a.date < b.date ? -1 : 1;
    });
    count.textContent = String(sorted.length);
    count.hidden = sorted.length === 0;
    countSr.textContent = sorted.length ? ', ' + sorted.length + (sorted.length === 1 ? ' guida' : ' guide') : '';
    list.innerHTML = '';

    if (state.undo) {
      var u = state.undo.booking;
      var ud = C.fromIso(u.date);
      var row = el('li', null, 'undo');
      row.appendChild(el('span', 'Guida di ' + C.dataLunga(ud) + ' alle ' + hh(u.ora) + ' disdetta.'));
      var ub = el('button', 'Annulla', 'btn btn--sm');
      ub.type = 'button';
      ub.dataset.undoBtn = '';
      ub.addEventListener('click', restore);
      row.appendChild(ub);
      list.appendChild(row);
    }

    if (!sorted.length) {
      var li = el('li', null, 'empty');
      li.appendChild(el('p', 'Nessuna guida prenotata.'));
      var go = el('button', 'Prenota una guida', 'btn btn--sm');
      go.type = 'button';
      go.style.marginTop = '10px';
      go.addEventListener('click', function () {
        goTab('prenota', true);
      });
      li.appendChild(go);
      list.appendChild(li);
      return;
    }
    sorted.forEach(function (b) {
      var d = C.fromIso(b.date);
      var s = C.sede(b.sede);
      var li = el('li', null, 'booking');
      li.dataset.line = s.sigla;
      var box = el('span', null, 'booking__date');
      box.setAttribute('aria-hidden', 'true');
      box.appendChild(el('small', C.GIORNI_BREVI[d.getDay()]));
      box.appendChild(el('b', String(d.getDate())));
      box.appendChild(el('small', C.MESI[d.getMonth()].slice(0, 3)));
      var body = el('div');
      body.appendChild(el('h3', 'Guida ' + tipoNome(b.tipo).toLowerCase() + ', ' + C.dataLunga(d) + ' alle ' + hh(b.ora)));
      var p = el('p');
      p.appendChild(badge(s));
      p.appendChild(document.createTextNode('Sede ' + s.nome + ' – ' + b.auto));
      body.appendChild(p);
      var del = el('button', 'Disdici', 'btn btn--danger-ghost btn--sm');
      del.type = 'button';
      del.setAttribute('aria-label', 'Disdici la guida di ' + C.dataLunga(d) + ' alle ' + hh(b.ora));
      del.addEventListener('click', function () {
        cancel(b);
      });
      li.appendChild(box);
      li.appendChild(body);
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  /* ---------- Il mio percorso ---------- */
  var summary = $('[data-summary]');
  var path = $('[data-path]');

  function data(d) {
    return d.getDate() + ' ' + C.MESI[d.getMonth()] + ' ' + d.getFullYear();
  }

  function renderPath() {
    var prenotate = { extraurbana: 0, autostrada: 0, notturna: 0, citta: 0 };
    state.bookings.forEach(function (b) {
      prenotate[b.tipo]++;
    });
    var daFare = ['extraurbana', 'autostrada', 'notturna'].reduce(function (n, t) {
      return n + Math.max(0, 2 - ALLIEVO.obbligatorie[t]);
    }, 0);
    var scadenza = C.addDays(ALLIEVO.esameTeoria, 365);

    summary.innerHTML = '';
    [
      [String(ALLIEVO.guideFatte), 'Guide fatte', ''],
      [String(state.bookings.length), 'Guide prenotate', ''],
      [String(daFare), 'Obbligatorie da fare', 'signal'],
      [scadenza.getDate() + '/' + (scadenza.getMonth() + 1) + '/' + String(scadenza.getFullYear()).slice(2), 'Foglio rosa valido fino al', '']
    ].forEach(function (s) {
      var box = el('div', null, 'stat' + (s[2] ? ' stat--' + s[2] : ''));
      box.appendChild(el('b', s[0]));
      box.appendChild(el('span', s[1]));
      summary.appendChild(box);
    });

    var steps = [
      { t: 'Iscrizione', st: 'done', chip: ['Fatto', 'ok'], body: 'Iscritto il ' + data(ALLIEVO.iscrizione) + '.' },
      { t: 'Lezioni di teoria', st: 'done', chip: ['Fatto', 'ok'], body: 'Ultime cinque schede d\'esame: ' + ALLIEVO.schede.join(', ') + ' errori.',
        meter: ['Lezioni seguite', ALLIEVO.lezioni, ALLIEVO.lezioniTot] },
      { t: 'Esame di teoria', st: 'done', chip: ['Superato', 'ok'], body: 'Superato il ' + data(ALLIEVO.esameTeoria) + '.' },
      { t: 'Foglio rosa', st: 'done', chip: ['Attivo', 'ok'], body: 'Ti permette di esercitarti alla guida fino al ' + data(scadenza) + '.' },
      { t: 'Guide pratiche', st: 'now', chip: ['In corso', 'signal'], body: 'Le guide obbligatorie sono sei: due extraurbane, due in autostrada e due di notte.', req: true },
      { t: 'Esame di guida', st: '', chip: ['Da prenotare', 'todo'], body: 'Si prenota quando hai finito le guide obbligatorie e l\'istruttore ti dà l\'ok.' }
    ];

    path.innerHTML = '';
    steps.forEach(function (s, i) {
      var li = el('li', null, 'path__step');
      li.dataset.state = s.st;
      var dot = el('span', null, 'path__dot');
      dot.setAttribute('aria-hidden', 'true');
      if (s.st === 'done') dot.innerHTML = '<svg class="icon"><use href="#i-check"/></svg>';
      else dot.textContent = String(i + 1);
      var head = el('div', null, 'path__head');
      head.appendChild(el('h3', s.t));
      head.appendChild(el('span', s.chip[0], 'chip chip--' + s.chip[1]));
      var body = el('div', null, 'path__body');
      body.appendChild(el('p', s.body));
      if (s.meter) {
        var m = el('div', null, 'meter');
        var row = el('div', null, 'meter__row');
        row.appendChild(el('span', s.meter[0]));
        row.appendChild(el('span', s.meter[1] + ' di ' + s.meter[2]));
        var pr = document.createElement('progress');
        pr.max = s.meter[2];
        pr.value = s.meter[1];
        pr.setAttribute('aria-label', s.meter[0]);
        m.appendChild(row);
        m.appendChild(pr);
        body.appendChild(m);
      }
      if (s.req) {
        var ul = el('ul', null, 'req');
        ul.setAttribute('role', 'list');
        [['extraurbana', 'Extraurbane'], ['autostrada', 'In autostrada'], ['notturna', 'Notturne']].forEach(function (r) {
          var done = ALLIEVO.obbligatorie[r[0]];
          var item = el('li');
          item.appendChild(el('span', r[1] + ': ' + done + ' di 2'));
          var chip;
          if (done >= 2) chip = el('span', 'Fatte', 'chip chip--ok');
          else if (prenotate[r[0]]) chip = el('span', prenotate[r[0]] + (prenotate[r[0]] === 1 ? ' prenotata' : ' prenotate'), 'chip chip--signal');
          else chip = el('span', 'Da prenotare', 'chip chip--todo');
          item.appendChild(chip);
          ul.appendChild(item);
        });
        body.appendChild(ul);
      }
      li.appendChild(dot);
      li.appendChild(head);
      li.appendChild(body);
      path.appendChild(li);
    });
  }

  /* ---------- Schede con indirizzo proprio (#prenota, #guide, #percorso) ---------- */
  var tabs = $$('[role="tab"]');
  var byHash = {};
  tabs.forEach(function (t) {
    byHash[t.dataset.hash] = t;
  });

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }

  // Cambia scheda e aggiorna l'indirizzo, così il tasto Indietro torna alla scheda precedente
  function goTab(hash, push) {
    var tab = byHash[hash];
    if (!tab) return;
    selectTab(tab, false);
    if (push && location.hash !== '#' + hash) history.pushState(null, '', '#' + hash);
    var panel = document.getElementById(tab.getAttribute('aria-controls'));
    var top = $('.app__top').getBoundingClientRect().bottom + window.pageYOffset - 140;
    if (window.pageYOffset > top) window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    panel.focus({ preventScroll: true });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      selectTab(t, false);
      if (location.hash !== '#' + t.dataset.hash) history.pushState(null, '', '#' + t.dataset.hash);
    });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) {
        e.preventDefault();
        selectTab(n, true);
        history.replaceState(null, '', '#' + n.dataset.hash);
      }
    });
  });

  function fromHash() {
    var tab = byHash[location.hash.slice(1)] || tabs[0];
    selectTab(tab, false);
  }
  window.addEventListener('popstate', fromHash);

  function renderAll() {
    renderCalendar();
    renderBookings();
    renderPath();
    renderNext();
  }

  pickDefault();
  renderAll();
  fromHash();

  // Anteprima nel sito di Next Siteo (?vista=calendario): la pagina parte già sul calendario.
  // window.scrollTo muove solo questa pagina, non quella che la contiene.
  if (/[?&]vista=calendario/.test(location.search)) {
    var cal = document.getElementById('calendario');
    var top = cal.getBoundingClientRect().top + window.pageYOffset - 130;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  }
})();
