/* ==================================================================
   AUTOSCUOLA ARDESIA · demo di Next Siteo (attività di fantasia)
   Menu mobile, stato "aperto ora", schede e checklist dei documenti,
   mappa "come arrivi", modulo di richiamata. Nessuna libreria,
   nessun dato inviato.
   ================================================================== */
(function () {
  'use strict';

  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---------- Anno nel footer ---------- */
  $$('[data-year]').forEach(function (n) {
    n.textContent = String(new Date().getFullYear());
  });

  /* ---------- Menu mobile ---------- */
  var toggle = $('[data-menu-toggle]');
  var menu = $('[data-menu]');
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
    };
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Orari: stato "aperto ora" calcolato sull'ora del visitatore ---------- */
  // Fasce di apertura in minuti dalla mezzanotte (0 = domenica)
  var ORARI = {
    0: [],
    1: [[540, 750], [930, 1140]],
    2: [[540, 750], [930, 1140]],
    3: [[540, 750], [930, 1140]],
    4: [[540, 750], [930, 1140]],
    5: [[540, 750], [930, 1140]],
    6: [[540, 720]]
  };
  var GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

  var hhmm = function (m) {
    return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
  };

  function stato(now) {
    var day = now.getDay();
    var min = now.getHours() * 60 + now.getMinutes();
    var oggi = ORARI[day];
    for (var i = 0; i < oggi.length; i++) {
      if (min >= oggi[i][0] && min < oggi[i][1]) {
        return { open: true, text: 'Aperto ora · chiude alle ' + hhmm(oggi[i][1]) };
      }
      if (min < oggi[i][0]) {
        return { open: false, text: 'Chiuso ora · riapre alle ' + hhmm(oggi[i][0]) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var next = ORARI[(day + d) % 7];
      if (next.length) {
        var quando = d === 1 ? 'domani' : GIORNI[(day + d) % 7];
        return { open: false, text: 'Chiuso · riapre ' + quando + ' alle ' + hhmm(next[0][0]) };
      }
    }
    return { open: false, text: 'Chiuso' };
  }

  function aggiornaOrari() {
    var now = new Date();
    var s = stato(now);
    $$('[data-status]').forEach(function (box) {
      box.classList.toggle('is-open', s.open);
      box.classList.toggle('is-closed', !s.open);
      var t = $('[data-status-text]', box);
      if (t) t.textContent = s.text;
    });
    var oggi = ORARI[now.getDay()];
    var hours = $('[data-today-hours]');
    if (hours) {
      hours.textContent = oggi.length
        ? 'Oggi: ' + oggi.map(function (f) { return hhmm(f[0]) + '-' + hhmm(f[1]); }).join(' e ')
        : 'Oggi la segreteria è chiusa.';
    }
    $$('[data-timetable] tr').forEach(function (row) {
      var on = Number(row.dataset.day) === now.getDay();
      row.classList.toggle('is-today', on);
      var tag = $('.today-tag', row);
      if (on && !tag) {
        tag = document.createElement('span');
        tag.className = 'today-tag';
        tag.textContent = 'Oggi';
        $('th', row).appendChild(tag);
      } else if (!on && tag) {
        tag.remove();
      }
    });
  }
  aggiornaOrari();
  setInterval(aggiornaOrari, 60000);

  /* ---------- Documenti: schede accessibili (frecce, Home, Fine) ---------- */
  $$('[data-tabs]').forEach(function (box) {
    var tabs = $$('[role="tab"]', box);
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        select(t, false);
      });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) {
          e.preventDefault();
          select(n, true);
        }
      });
    });
  });

  /* ---------- Documenti: checklist con avanzamento ---------- */
  $$('[data-checklist]').forEach(function (panel) {
    var boxes = $$('input[type="checkbox"]', panel);
    var bar = $('[data-progress-bar]', panel);
    var out = $('[data-progress]', panel);
    var wrap = out.parentNode;
    var update = function () {
      var done = boxes.filter(function (b) { return b.checked; }).length;
      var tot = boxes.length;
      bar.style.transform = 'scaleX(' + done / tot + ')';
      wrap.classList.toggle('is-done', done === tot);
      if (done === 0) out.textContent = 'Spunta i documenti che hai già.';
      else if (done === tot) out.textContent = 'Hai tutto: passa in segreteria negli orari di apertura.';
      else out.textContent = done + ' di ' + tot + ' pronti. ' + (tot - done === 1 ? 'Manca un documento.' : 'Mancano ' + (tot - done) + ' documenti.');
    };
    boxes.forEach(function (b) {
      b.addEventListener('change', update);
    });
  });
  var print = $('[data-print]');
  if (print) {
    print.addEventListener('click', function () {
      window.print();
    });
  }

  /* ---------- Dove siamo: come arrivi ---------- */
  var map = $('[data-map]');
  var modes = $('[data-modes]');
  if (map && modes) {
    var setMode = function (mode) {
      map.dataset.mode = mode;
      $$('[data-route-text]').forEach(function (p) {
        p.classList.toggle('is-active', p.dataset.routeText === mode);
      });
    };
    modes.addEventListener('change', function (e) {
      if (e.target.name === 'arrivo') setMode(e.target.value);
    });
    var checked = $('input[name="arrivo"]:checked', modes);
    setMode(checked ? checked.value : 'piedi');

    // Sul telefono la mappa si stringe sulla zona utile (stesse proporzioni: nessuno spostamento)
    var svg = $('[data-map-svg]', map);
    var narrow = window.matchMedia('(max-width: 599.98px)');
    var crop = function () {
      svg.setAttribute('viewBox', narrow.matches ? '88 70 480 300' : '0 0 640 400');
    };
    crop();
    if (narrow.addEventListener) narrow.addEventListener('change', crop);
  }

  /* ---------- Contatti: validazione, riepilogo errori, stato finale ---------- */
  var form = $('[data-form]');
  if (form) {
    var box = $('[data-errors]');
    var boxList = $('[data-errors-list]');
    var success = $('[data-success]');
    var submit = $('[data-submit]');

    var RULES = {
      nome: function (v) {
        return v.trim().length < 2 ? 'Scrivi nome e cognome.' : '';
      },
      telefono: function (v) {
        v = v.trim();
        if (!v) return 'Scrivi un numero di telefono: serve per richiamarti.';
        var cifre = v.replace(/\D/g, '').length;
        return !/^\+?[\d\s./-]+$/.test(v) || cifre < 6 || cifre > 15
          ? 'Il numero non sembra valido: usa solo cifre, spazi o il + iniziale.'
          : '';
      },
      privacy: function (v, el) {
        return el.checked ? '' : 'Serve il tuo ok all\'informativa privacy.';
      }
    };

    var check = function (name) {
      var el = form.elements[name];
      var msg = RULES[name](el.value, el);
      var err = document.getElementById(el.getAttribute('aria-describedby').split(' ').pop());
      err.textContent = msg;
      err.hidden = !msg;
      if (msg) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
      return msg;
    };

    // Controllo all'uscita dal campo, solo dopo che è stato toccato
    Object.keys(RULES).forEach(function (name) {
      var el = form.elements[name];
      el.addEventListener(el.type === 'checkbox' ? 'change' : 'blur', function () {
        if (el.type === 'checkbox' || el.value.trim() || el.hasAttribute('aria-invalid')) check(name);
      });
      el.addEventListener('input', function () {
        if (el.hasAttribute('aria-invalid')) check(name);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errors = [];
      Object.keys(RULES).forEach(function (name) {
        var msg = check(name);
        if (msg) errors.push([name, msg]);
      });
      if (errors.length) {
        boxList.innerHTML = '';
        errors.forEach(function (er) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          var target = form.elements[er[0]];
          a.href = '#' + target.id;
          a.textContent = er[1];
          a.addEventListener('click', function (ev) {
            ev.preventDefault();
            target.focus();
          });
          li.appendChild(a);
          boxList.appendChild(li);
        });
        box.hidden = false;
        box.focus();
        return;
      }
      box.hidden = true;
      submit.setAttribute('aria-busy', 'true');
      submit.disabled = true;
      submit.textContent = 'Un attimo…';
      setTimeout(function () {
        submit.removeAttribute('aria-busy');
        submit.disabled = false;
        submit.textContent = 'Chiedi di essere richiamato';
        form.hidden = true;
        success.hidden = false;
        success.focus();
        if (window.NextSiteoDemo) window.NextSiteoDemo.avviso('La richiesta non è stata inviata a nessuno: in un sito vero arriverebbe alla segreteria.');
      }, 500);
    });

    $('[data-again]').addEventListener('click', function () {
      form.reset();
      $$('[aria-invalid]', form).forEach(function (el) {
        el.removeAttribute('aria-invalid');
      });
      $$('.field__error', form).forEach(function (el) {
        el.hidden = true;
      });
      success.hidden = true;
      form.hidden = false;
      form.elements.nome.focus();
    });
  }
})();
