/* ==================================================================
   AUTOSCUOLA ARDESIA · demo di Next Siteo (attività di fantasia)
   Menu, schede dei servizi, documenti da stampare, orari con
   "Aperto ora", modulo "Chiedi informazioni". I contenuti arrivano
   da js/dati.js. Nessun dato viene inviato.
   ================================================================== */
(function () {
  'use strict';

  var D = window.ARDESIA;
  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  var icon = function (id) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'icon');
    s.setAttribute('aria-hidden', 'true');
    var u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', '#' + id);
    s.appendChild(u);
    return s;
  };
  var avviso = function (msg) {
    if (window.NextSiteoDemo) window.NextSiteoDemo.avviso(msg);
  };
  // Ora del dispositivo: tutta la logica degli orari passa da qui
  var adesso = function () {
    return new Date();
  };

  /* ---------- Anno nel footer ---------- */
  $$('[data-year]').forEach(function (n) {
    n.textContent = String(adesso().getFullYear());
  });

  /* ---------- Menu mobile ---------- */
  var toggle = $('[data-menu-toggle]');
  var menu = $('[data-menu]');
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

  /* ---------- Patenti e servizi: una scheda aperta alla volta ---------- */
  var servicesBox = $('[data-services]');
  D.servizi.forEach(function (s, i) {
    var n = i + 1;
    var id = 'servizio-' + n;
    var li = el('li', 'service');
    li.id = id;
    var num = el('span', 'service__num', (n < 10 ? '0' : '') + n);
    num.setAttribute('aria-hidden', 'true');
    li.appendChild(num);
    li.appendChild(el('h3', null, s.titolo));
    li.appendChild(el('p', null, s.breve));

    var btn = el('button', 'service__more');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id + '-dettaglio');
    btn.appendChild(document.createTextNode('Per saperne di più'));
    btn.appendChild(el('span', 'sr-only', ': ' + s.titolo));
    btn.appendChild(icon('i-chevron'));
    li.appendChild(btn);

    var detail = el('div', 'service__detail');
    detail.id = id + '-dettaglio';
    detail.hidden = true;
    var dl = el('dl');
    [['A chi serve', s.aChi], ['Come funziona', s.come], ['Cosa portare', s.portare]].forEach(function (row) {
      var d = el('div');
      d.appendChild(el('dt', null, row[0]));
      d.appendChild(el('dd', null, row[1]));
      dl.appendChild(d);
    });
    detail.appendChild(dl);
    if (s.documenti) {
      var link = el('a', 'link-arrow', 'Vedi l\'elenco dei documenti');
      link.href = '#documenti';
      link.dataset.doc = s.documenti;
      link.appendChild(icon('i-arrow'));
      detail.appendChild(link);
    }
    li.appendChild(detail);
    servicesBox.appendChild(li);
  });

  var moreBtns = $$('.service__more', servicesBox);
  moreBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      moreBtns.forEach(function (b) {
        var on = b === btn && open;
        b.setAttribute('aria-expanded', String(on));
        document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
      });
    });
  });

  /* ---------- Documenti per patente, con stampa ---------- */
  var picker = $('[data-doc-picker]');
  var listBox = $('[data-doc-list]');
  D.documenti.forEach(function (d, i) {
    var lab = el('label');
    var input = el('input');
    input.type = 'radio';
    input.name = 'documenti';
    input.value = d.id;
    input.checked = d.id === 'b';
    lab.appendChild(input);
    lab.appendChild(el('span', null, d.nome));
    picker.appendChild(lab);
  });

  function showDocs(id) {
    var d = D.documenti.filter(function (x) { return x.id === id; })[0] || D.documenti[0];
    $$('label', picker).forEach(function (l) {
      var input = $('input', l);
      input.checked = input.value === d.id;
      l.classList.toggle('is-checked', input.checked);
    });
    listBox.innerHTML = '';
    listBox.appendChild(el('h3', null, 'Documenti per: ' + d.nome));
    listBox.appendChild(el('p', 'print-only', 'Autoscuola Ardesia · Via del Mercato 3, 00000 Vallefinta (XX) · elenco indicativo, da verificare in segreteria.'));
    var ul = el('ul', 'checklist');
    ul.setAttribute('role', 'list');
    d.voci.forEach(function (v) {
      var li = el('li');
      li.appendChild(icon('i-box'));
      li.appendChild(el('span', null, v));
      ul.appendChild(li);
    });
    listBox.appendChild(ul);
  }
  picker.addEventListener('change', function (e) {
    if (e.target.name === 'documenti') showDocs(e.target.value);
  });
  // Dai dettagli dei servizi: apre i documenti giusti
  servicesBox.addEventListener('click', function (e) {
    var a = e.target.closest('[data-doc]');
    if (a) showDocs(a.dataset.doc);
  });
  $('[data-print]').addEventListener('click', function () {
    window.print();
  });
  showDocs('b');

  /* ---------- Orari: tabella, "Aperto ora" e footer leggono gli stessi dati ---------- */
  var ORDINE = [1, 2, 3, 4, 5, 6, 0];
  var hhmm = function (m) {
    return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
  };
  var fascia = function (f) {
    return hhmm(f[0]) + '-' + hhmm(f[1]);
  };

  function stato(now) {
    var day = now.getDay();
    var min = now.getHours() * 60 + now.getMinutes();
    var oggi = D.orari[day];
    for (var i = 0; i < oggi.length; i++) {
      if (min >= oggi[i][0] && min < oggi[i][1]) return { open: true, label: 'Aperto ora', resto: 'chiude alle ' + hhmm(oggi[i][1]) };
      if (min < oggi[i][0]) return { open: false, label: 'Chiuso', resto: 'riapre alle ' + hhmm(oggi[i][0]) };
    }
    for (var g = 1; g <= 7; g++) {
      var next = D.orari[(day + g) % 7];
      if (next.length) {
        var quando = g === 1 ? 'domani' : D.giorni[(day + g) % 7].toLowerCase();
        return { open: false, label: 'Chiuso', resto: 'riapre ' + quando + ' alle ' + hhmm(next[0][0]) };
      }
    }
    return { open: false, label: 'Chiuso', resto: '' };
  }

  var tbody = $('[data-hours]');
  ORDINE.forEach(function (d) {
    var tr = el('tr');
    tr.dataset.day = String(d);
    tr.appendChild(el('th', null, D.giorni[d])).setAttribute('scope', 'row');
    var slots = D.orari[d];
    var mattina = slots.filter(function (f) { return f[0] < 780; });
    var pomeriggio = slots.filter(function (f) { return f[0] >= 780; });
    [mattina, pomeriggio].forEach(function (list) {
      var td = el('td', list.length ? null : 'closed', list.length ? list.map(fascia).join(', ') : 'Chiuso');
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  // Footer: giorni consecutivi con gli stessi orari diventano una riga sola
  var footerHours = $('[data-footer-hours]');
  var gruppi = [];
  ORDINE.forEach(function (d) {
    var key = JSON.stringify(D.orari[d]);
    var last = gruppi[gruppi.length - 1];
    if (last && last.key === key) last.days.push(d);
    else gruppi.push({ key: key, days: [d] });
  });
  gruppi.forEach(function (g) {
    var first = D.giorni[g.days[0]];
    var nome = g.days.length > 1 ? first + '-' + D.giorni[g.days[g.days.length - 1]].toLowerCase() : first;
    var slots = D.orari[g.days[0]];
    footerHours.appendChild(el('li', null, nome + ': ' + (slots.length ? slots.map(fascia).join(' e ') : 'chiuso')));
  });

  var statusBox = $('[data-status]');
  var statusText = $('[data-status-text]');
  function aggiornaOrari() {
    var now = adesso();
    var s = stato(now);
    statusBox.classList.toggle('is-open', s.open);
    statusBox.classList.toggle('is-closed', !s.open);
    statusText.innerHTML = '';
    statusText.appendChild(el('strong', null, s.label));
    if (s.resto) statusText.appendChild(document.createTextNode(' · ' + s.resto));
    $$('tr', tbody).forEach(function (tr) {
      var on = Number(tr.dataset.day) === now.getDay();
      tr.classList.toggle('is-today', on);
      var tag = $('.today-tag', tr);
      if (on && !tag) $('th', tr).appendChild(el('span', 'today-tag', 'Oggi'));
      else if (!on && tag) tag.remove();
    });
  }
  aggiornaOrari();
  setInterval(aggiornaOrari, 60000);

  /* ---------- Footer: elenco dei servizi ---------- */
  var footerServices = $('[data-footer-services]');
  D.servizi.forEach(function (s, i) {
    var li = el('li');
    var a = el('a', null, s.titolo);
    a.href = '#servizio-' + (i + 1);
    li.appendChild(a);
    footerServices.appendChild(li);
  });

  /* ---------- Modulo "Chiedi informazioni" ---------- */
  var form = $('[data-form]');
  var select = $('[data-service-select]');
  D.servizi.map(function (s) { return s.titolo; }).concat(['Altro']).forEach(function (t) {
    var o = el('option', null, t);
    o.value = t;
    select.appendChild(o);
  });

  var RULES = {
    nome: function () {
      return form.elements.nome.value.trim().length < 2 ? 'Scrivi il tuo nome e cognome.' : '';
    },
    contatto: function () {
      var v = form.elements.contatto.value.trim();
      if (!v) return 'Scrivi un telefono o un\'email: ci serve per risponderti.';
      if (v.indexOf('@') > -1) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'L\'email non sembra corretta: controlla la @ e il punto.';
      }
      var cifre = v.replace(/\D/g, '').length;
      return /^\+?[\d\s./-]+$/.test(v) && cifre >= 6 && cifre <= 15 ? '' : 'Scrivi un numero di telefono valido oppure un indirizzo email.';
    },
    servizio: function () {
      return form.elements.servizio.value ? '' : 'Scegli la patente o il servizio che ti interessa.';
    },
    privacy: function () {
      return form.elements.privacy.checked ? '' : 'Serve la presa visione dell\'informativa privacy.';
    }
  };
  var check = function (name) {
    var f = form.elements[name];
    var msg = RULES[name]();
    var err = document.getElementById('c-' + name + '-err');
    err.textContent = msg;
    err.hidden = !msg;
    if (msg) f.setAttribute('aria-invalid', 'true');
    else f.removeAttribute('aria-invalid');
    return msg;
  };
  // Controllo all'uscita dal campo (se è stato toccato) e mentre si corregge
  Object.keys(RULES).forEach(function (name) {
    var f = form.elements[name];
    f.addEventListener(f.type === 'checkbox' || f.tagName === 'SELECT' ? 'change' : 'blur', function () {
      if (f.type === 'checkbox' || f.tagName === 'SELECT' || f.value.trim() || f.hasAttribute('aria-invalid')) check(name);
    });
    f.addEventListener('input', function () {
      if (f.hasAttribute('aria-invalid')) check(name);
    });
  });

  var submit = $('[data-submit]');
  var success = $('[data-success]');
  var sending = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return; // il doppio clic non crea doppioni
    var first = null;
    Object.keys(RULES).forEach(function (name) {
      if (check(name) && !first) first = name;
    });
    if (first) {
      form.elements[first].focus();
      return;
    }
    sending = true;
    submit.disabled = true;
    submit.textContent = 'Un attimo…';
    setTimeout(function () {
      form.hidden = true;
      success.hidden = false;
      success.focus();
      avviso('Nessun dato è stato inviato: la richiesta di informazioni è solo una simulazione.');
    }, 500);
  });
  $('[data-again]').addEventListener('click', function () {
    form.reset();
    $$('[aria-invalid]', form).forEach(function (n) {
      n.removeAttribute('aria-invalid');
    });
    $$('.field__error', form).forEach(function (n) {
      n.hidden = true;
    });
    sending = false;
    submit.disabled = false;
    submit.textContent = 'Invia la richiesta';
    success.hidden = true;
    form.hidden = false;
    form.elements.nome.focus();
  });
})();
