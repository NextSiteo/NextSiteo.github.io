/* ==================================================================
   AUTOSCUOLE CROCEVIA · SITO (demo di Next Siteo)
   Menu mobile, tabellone delle guide libere, stato delle sedi,
   candidatura "Lavora con noi". Nessun dato viene inviato.
   ================================================================== */
(function () {
  'use strict';

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
  var C = window.Crocevia;

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

  /* ---------- Home: tabellone delle prossime guide libere (dati finti) ---------- */
  var board = $('[data-next-slots]');
  if (board && C) {
    var slots = C.prossimiLiberi(3);
    board.innerHTML = '';
    slots.forEach(function (s) {
      var li = el('li');
      var t = el('span', null, 'board__time');
      t.appendChild(el('b', s.ora + ':00'));
      t.appendChild(el('span', C.GIORNI_BREVI[s.date.getDay()] + ' ' + s.date.getDate() + ' ' + C.MESI[s.date.getMonth()].slice(0, 3)));
      var where = el('span', null, 'board__where');
      var st = el('strong');
      var b = el('span', s.sede.sigla, 'line');
      b.dataset.line = s.sede.sigla;
      b.setAttribute('aria-hidden', 'true');
      st.appendChild(b);
      st.appendChild(document.createTextNode(s.sede.nome));
      where.appendChild(st);
      where.appendChild(el('small', C.auto(s.sede.id, s.date, s.ora)));
      var a = el('a', 'Prenota', 'btn btn--sm');
      a.href = 'area-allievi.html?sede=' + s.sede.id + '#prenota';
      a.setAttribute('aria-label', 'Prenota la guida di ' + C.dataLunga(s.date) + ' alle ' + s.ora + ':00, sede ' + s.sede.nome);
      li.appendChild(t);
      li.appendChild(where);
      li.appendChild(a);
      board.appendChild(li);
    });
    if (!slots.length) {
      board.appendChild(el('li', 'Nessun orario libero nei prossimi giorni.'));
    }
  }

  /* ---------- Home: sedi aperte o chiuse adesso ---------- */
  var aggiornaSedi = function () {
    $$('[data-sede]').forEach(function (card) {
      var out = $('[data-sede-status]', card);
      if (!out || !C) return;
      var s = C.statoSede(card.dataset.sede, new Date());
      out.textContent = s.text;
      out.classList.toggle('is-open', s.open);
    });
  };
  aggiornaSedi();
  setInterval(aggiornaSedi, 60000);

  /* ---------- Lavora con noi: candidatura ---------- */
  var job = $('[data-job]');
  if (job) {
    var box = $('[data-errors]');
    var boxList = $('[data-errors-list]');
    var success = $('[data-success]');
    var submit = $('[data-submit]');
    var MAX_MB = 5;

    var RULES = {
      nome: function (f) {
        return f.nome.value.trim().length < 2 ? 'Scrivi nome e cognome.' : '';
      },
      telefono: function (f) {
        var v = f.telefono.value.trim();
        if (!v) return 'Scrivi un numero di telefono.';
        var cifre = v.replace(/\D/g, '').length;
        return !/^\+?[\d\s./-]+$/.test(v) || cifre < 6 || cifre > 15 ? 'Il numero non sembra valido: usa solo cifre, spazi o il + iniziale.' : '';
      },
      email: function (f) {
        var v = f.email.value.trim();
        return !v ? 'Scrivi la tua email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'L\'email non sembra corretta: controlla la @ e il punto.' : '';
      },
      ruolo: function (f) {
        return f.ruolo.value ? '' : 'Scegli il ruolo che ti interessa.';
      },
      sedi: function () {
        return $$('[name="sedi"]:checked', job).length ? '' : 'Scegli almeno una sede.';
      },
      cv: function (f) {
        var file = f.cv.files && f.cv.files[0];
        if (!file) return '';
        if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') return 'Il curriculum deve essere un file PDF.';
        if (file.size > MAX_MB * 1024 * 1024) return 'Il file supera ' + MAX_MB + ' MB: prova a salvarlo più leggero.';
        return '';
      },
      privacy: function (f) {
        return f.privacy.checked ? '' : 'Serve il tuo ok all\'informativa privacy.';
      }
    };
    // Campo da evidenziare e su cui portare il focus per ogni regola
    var target = function (name) {
      return name === 'sedi' ? $('[name="sedi"]', job) : job.elements[name];
    };
    var wrapOf = function (name) {
      return name === 'sedi' ? $('[data-sedi-group]', job) : job.elements[name];
    };

    var check = function (name) {
      var msg = RULES[name](job.elements);
      var err = document.getElementById('j-' + name + '-err');
      err.textContent = msg;
      err.hidden = !msg;
      var w = wrapOf(name);
      if (msg) w.setAttribute('aria-invalid', 'true');
      else w.removeAttribute('aria-invalid');
      return msg;
    };

    // Controllo all'uscita dal campo (solo se è stato toccato) e mentre si corregge
    ['nome', 'telefono', 'email'].forEach(function (name) {
      var f = job.elements[name];
      f.addEventListener('blur', function () {
        if (f.value.trim() || f.hasAttribute('aria-invalid')) check(name);
      });
      f.addEventListener('input', function () {
        if (f.hasAttribute('aria-invalid')) check(name);
      });
    });
    job.elements.ruolo.addEventListener('change', function () {
      check('ruolo');
    });
    $$('[name="sedi"]', job).forEach(function (c) {
      c.addEventListener('change', function () {
        if ($('[data-sedi-group]', job).hasAttribute('aria-invalid')) check('sedi');
      });
    });
    job.elements.privacy.addEventListener('change', function () {
      check('privacy');
    });

    // Curriculum: nome del file scelto e controllo immediato
    var cvName = $('[data-cv-name]');
    job.elements.cv.addEventListener('change', function () {
      var file = job.elements.cv.files[0];
      cvName.textContent = file ? 'Scelto: ' + file.name : 'Nessun file scelto.';
      check('cv');
    });

    // Conteggio caratteri del messaggio
    var msg = job.elements.messaggio;
    var counter = $('[data-counter]');
    var updateCounter = function () {
      counter.textContent = msg.value.length + ' / ' + msg.maxLength;
    };
    msg.addEventListener('input', updateCounter);
    updateCounter();

    job.addEventListener('submit', function (e) {
      e.preventDefault();
      var errors = [];
      Object.keys(RULES).forEach(function (name) {
        var m = check(name);
        if (m) errors.push([name, m]);
      });
      if (errors.length) {
        boxList.innerHTML = '';
        errors.forEach(function (er) {
          var li = el('li');
          var t = target(er[0]);
          var a = el('a', er[1]);
          a.href = '#' + t.id;
          a.addEventListener('click', function (ev) {
            ev.preventDefault();
            t.focus();
          });
          li.appendChild(a);
          boxList.appendChild(li);
        });
        box.hidden = false;
        box.focus();
        return;
      }
      box.hidden = true;
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      submit.textContent = 'Un attimo…';
      setTimeout(function () {
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
        submit.textContent = 'Invia la candidatura';
        job.hidden = true;
        success.hidden = false;
        success.focus();
        if (window.NextSiteoDemo) window.NextSiteoDemo.avviso('La candidatura non è stata inviata a nessuno.');
      }, 500);
    });

    $('[data-again]').addEventListener('click', function () {
      job.reset();
      $$('[aria-invalid]', job).forEach(function (n) {
        n.removeAttribute('aria-invalid');
      });
      $$('.field__error', job).forEach(function (n) {
        n.hidden = true;
      });
      cvName.textContent = 'Nessun file scelto.';
      updateCounter();
      success.hidden = true;
      job.hidden = false;
      job.elements.nome.focus();
    });
  }
})();
