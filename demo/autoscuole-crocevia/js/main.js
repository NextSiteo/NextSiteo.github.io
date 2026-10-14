/* ==================================================================
   AUTOSCUOLA CROCEVIA · demo di Next Siteo (attività di fantasia)
   Menu, comparsa allo scroll, FAQ, mini quiz e pre-iscrizione a step.
   I contenuti arrivano da js/dati.js. Nessun dato viene inviato.
   ================================================================== */
(function () {
  'use strict';

  var D = window.CROCEVIA;
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

  /* ---------- Anno nel footer ---------- */
  $$('[data-year]').forEach(function (n) {
    n.textContent = String(new Date().getFullYear());
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

  /* ---------- Comparsa leggera allo scroll ---------- */
  var reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach(function (n) {
      io.observe(n);
    });
  } else {
    reveals.forEach(function (n) {
      n.classList.add('is-in');
    });
  }

  /* ---------- FAQ: accordion (Invio/Spazio apre, frecce passano alla domanda vicina) ---------- */
  var faqBox = $('[data-faq]');
  D.faq.forEach(function (f, i) {
    var item = el('div', 'faq__item');
    var h = el('h3');
    var btn = el('button', 'faq__q');
    btn.type = 'button';
    btn.id = 'faq-q-' + i;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'faq-a-' + i);
    btn.appendChild(el('span', null, f.domanda));
    btn.appendChild(icon('i-chevron'));
    h.appendChild(btn);
    var panel = el('div', 'faq__a');
    panel.id = 'faq-a-' + i;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', btn.id);
    panel.hidden = true;
    panel.appendChild(el('p', null, f.risposta));
    item.appendChild(h);
    item.appendChild(panel);
    faqBox.appendChild(item);
  });
  var faqBtns = $$('.faq__q', faqBox);
  faqBtns.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
    });
    btn.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowDown') n = faqBtns[(i + 1) % faqBtns.length];
      if (e.key === 'ArrowUp') n = faqBtns[(i - 1 + faqBtns.length) % faqBtns.length];
      if (e.key === 'Home') n = faqBtns[0];
      if (e.key === 'End') n = faqBtns[faqBtns.length - 1];
      if (n) {
        e.preventDefault();
        n.focus();
      }
    });
  });

  /* ---------- Mini quiz ---------- */
  var quizBox = $('[data-quiz]');
  var quiz = { i: 0, score: 0 };
  var TOT = D.quiz.length;

  function renderQuestion(focus) {
    var q = D.quiz[quiz.i];
    quizBox.innerHTML = '';

    var top = el('div', 'quiz__top');
    top.appendChild(el('span', null, 'Domanda ' + (quiz.i + 1) + ' di ' + TOT));
    top.appendChild(el('span', null, 'Giuste: ' + quiz.score));
    var bar = el('div', 'quiz__bar');
    bar.setAttribute('aria-hidden', 'true');
    var fill = el('span');
    fill.style.transform = 'scaleX(' + quiz.i / TOT + ')';
    bar.appendChild(fill);

    var title = el('h3', 'quiz__question', q.testo);
    title.tabIndex = -1;

    var answers = el('div', 'quiz__answers');
    answers.setAttribute('role', 'group');
    answers.setAttribute('aria-label', 'Vero o falso?');
    var live = el('div');
    live.setAttribute('aria-live', 'polite');

    [true, false].forEach(function (val) {
      var b = el('button', 'answer', val ? 'Vero' : 'Falso');
      b.type = 'button';
      b.dataset.value = String(val);
      b.addEventListener('click', function () {
        answer(val, answers, live);
      });
      answers.appendChild(b);
    });

    quizBox.appendChild(top);
    quizBox.appendChild(bar);
    quizBox.appendChild(title);
    quizBox.appendChild(answers);
    quizBox.appendChild(live);
    if (focus) title.focus();
  }

  function answer(val, answers, live) {
    if (answers.dataset.done) return; // una sola risposta per domanda
    answers.dataset.done = '1';
    var q = D.quiz[quiz.i];
    var ok = val === q.risposta;
    if (ok) quiz.score++;

    $$('.answer', answers).forEach(function (b) {
      var v = b.dataset.value === 'true';
      b.disabled = true;
      if (v === q.risposta) {
        b.classList.add('is-right');
        b.insertBefore(icon('i-check'), b.firstChild);
      } else if (v === val) {
        b.classList.add('is-wrong');
        b.insertBefore(icon('i-x'), b.firstChild);
      }
    });
    $('.quiz__top span:last-child', quizBox).textContent = 'Giuste: ' + quiz.score;
    $('.quiz__bar span', quizBox).style.transform = 'scaleX(' + (quiz.i + 1) / TOT + ')';

    var fb = el('div', 'feedback ' + (ok ? 'feedback--ok' : 'feedback--ko'));
    fb.appendChild(icon(ok ? 'i-check' : 'i-x'));
    fb.appendChild(el('strong', null, ok ? 'Giusto!' : 'Sbagliato: la risposta è «' + (q.risposta ? 'Vero' : 'Falso') + '».'));
    fb.appendChild(el('p', null, q.spiegazione));
    live.appendChild(fb);

    var last = quiz.i === TOT - 1;
    var next = el('button', 'btn btn--primary quiz__next', last ? 'Vedi il risultato' : 'Prossima domanda');
    next.type = 'button';
    next.appendChild(icon('i-arrow'));
    next.addEventListener('click', function () {
      if (last) {
        renderResult();
      } else {
        quiz.i++;
        renderQuestion(true);
      }
    });
    quizBox.appendChild(next);
    next.focus({ preventScroll: true });
  }

  function renderResult() {
    var s = quiz.score;
    quizBox.innerHTML = '';
    var box = el('div', 'result');
    var score = el('div', 'result__score');
    score.setAttribute('aria-hidden', 'true');
    score.appendChild(document.createTextNode(s + '/' + TOT));
    var h = el('h3', null, 'Hai risposto bene a ' + s + (s === 1 ? ' domanda' : ' domande') + ' su ' + TOT + '.');
    h.tabIndex = -1;
    var msg =
      s === TOT
        ? 'Perfetto! Con una base così la teoria sarà una passeggiata.'
        : s >= 8
          ? 'Ottimo lavoro: rileggi le spiegazioni delle domande sbagliate e ci sei.'
          : s >= 5
            ? 'Buona base: con un po\' di allenamento migliori in fretta.'
            : 'Nessun problema: è proprio per questo che c\'è la teoria. Riprova!';
    var again = el('button', 'btn btn--ghost', 'Riprova');
    again.type = 'button';
    again.insertBefore(icon('i-redo'), again.firstChild);
    again.addEventListener('click', function () {
      quiz.i = 0;
      quiz.score = 0;
      renderQuestion(true);
    });
    box.appendChild(score);
    box.appendChild(h);
    box.appendChild(el('p', null, msg));
    box.appendChild(again);
    quizBox.appendChild(box);
    h.focus();
  }

  renderQuestion(false);

  /* ---------- Pre-iscrizione a step (modale) ---------- */
  var modal = $('[data-modal]');
  var form = $('[data-form]');
  var countOut = $('[data-count]');
  var barFill = $('[data-bar]');
  var foot = $('[data-foot]');
  var btnPrev = $('[data-prev]');
  var btnNext = $('[data-next]');
  var STEPS = 5;
  var NOMI = ['I tuoi dati', 'La patente', 'Disponibilità', 'Contatti', 'Riepilogo'];
  var pre = { step: 1, sending: false, done: false, opener: null };

  // Opzioni costruite dai dati
  var addOption = function (box, type, name, value, label, note, cls) {
    var lab = el('label', cls);
    var input = el('input');
    input.type = type;
    input.name = name;
    input.value = value;
    lab.appendChild(input);
    var txt = el('span');
    txt.appendChild(el('strong', null, label));
    if (note) txt.appendChild(el('small', null, note));
    lab.appendChild(txt);
    box.appendChild(lab);
  };
  D.patenti.forEach(function (p) {
    addOption($('[data-options="patenti"]'), 'radio', 'patente', p.valore, p.nome, p.nota, 'option');
  });
  D.fogliorosa.forEach(function (f) {
    addOption($('[data-options="fogliorosa"]'), 'radio', 'fogliorosa', f.valore, f.nome, null, 'option');
  });
  D.giorni.forEach(function (g) {
    addOption($('[data-options="giorni"]'), 'checkbox', 'giorni', g, g, null, 'chip');
  });
  D.fasce.forEach(function (f) {
    addOption($('[data-options="fasce"]'), 'checkbox', 'fasce', f.valore, f.nome, f.nota, 'option');
  });

  var val = function (name) {
    var f = form.elements[name];
    return f && f.value != null ? String(f.value).trim() : '';
  };
  var checked = function (name) {
    return $$('[name="' + name + '"]:checked', form).map(function (i) {
      return i.value;
    });
  };
  var eta = function (iso) {
    var p = iso.split('-').map(Number);
    var nascita = new Date(p[0], p[1] - 1, p[2]);
    var oggi = new Date();
    var anni = oggi.getFullYear() - nascita.getFullYear();
    var m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) anni--;
    return { data: nascita, anni: anni, futura: nascita > oggi };
  };

  // Regole per passo: [chiave, id dell'errore, funzione che restituisce il messaggio]
  var RULES = {
    1: [
      ['nome', function () { return val('nome').length < 2 ? 'Scrivi il tuo nome.' : ''; }],
      ['cognome', function () { return val('cognome').length < 2 ? 'Scrivi il tuo cognome.' : ''; }],
      ['nascita', function () {
        var v = val('nascita');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Inserisci la data di nascita.';
        var e = eta(v);
        if (isNaN(e.data) || e.futura || e.anni > 100) return 'Controlla la data di nascita.';
        if (e.anni < 14) return 'Per la pre-iscrizione devi avere almeno 14 anni.';
        return '';
      }]
    ],
    2: [
      ['patente', function () { return checked('patente').length ? '' : 'Scegli la patente che vuoi prendere.'; }],
      ['fogliorosa', function () { return checked('fogliorosa').length ? '' : 'Dicci se hai già il foglio rosa.'; }]
    ],
    3: [
      ['giorni', function () { return checked('giorni').length ? '' : 'Scegli almeno un giorno.'; }],
      ['fasce', function () { return checked('fasce').length ? '' : 'Scegli almeno una fascia oraria.'; }]
    ],
    4: [
      ['telefono', function () {
        var v = val('telefono');
        if (!v) return 'Scrivi il tuo numero di telefono.';
        var cifre = v.replace(/\D/g, '').length;
        return !/^\+?[\d\s./-]+$/.test(v) || cifre < 6 || cifre > 15 ? 'Il numero non sembra valido: usa solo cifre, spazi o il + iniziale.' : '';
      }],
      ['email', function () {
        var v = val('email');
        if (!v) return 'Scrivi la tua email.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'L\'email non sembra corretta: controlla la @ e il punto.';
      }],
      ['privacy', function () { return form.elements.privacy.checked ? '' : 'Serve la presa visione dell\'informativa privacy.'; }]
    ]
  };
  var ERR_ID = { telefono: 'f-tel-err', email: 'f-email-err' };
  var GROUPS = ['patente', 'fogliorosa', 'giorni', 'fasce'];

  var target = function (key) {
    return GROUPS.indexOf(key) > -1 ? $('[data-group="' + key + '"]', form) : form.elements[key];
  };
  var focusTarget = function (key) {
    return GROUPS.indexOf(key) > -1 ? $('[name="' + key + '"]', form) : form.elements[key];
  };
  var showError = function (key, msg) {
    var err = document.getElementById(ERR_ID[key] || 'f-' + key + '-err');
    err.textContent = msg;
    err.hidden = !msg;
    var t = target(key);
    if (msg) t.setAttribute('aria-invalid', 'true');
    else t.removeAttribute('aria-invalid');
  };
  var validate = function (step) {
    var first = null;
    (RULES[step] || []).forEach(function (r) {
      var msg = r[1]();
      showError(r[0], msg);
      if (msg && !first) first = r[0];
    });
    return first;
  };

  // Un errore già mostrato si aggiorna mentre si corregge il campo
  form.addEventListener('input', recheck);
  form.addEventListener('change', recheck);
  function recheck(e) {
    var name = e.target.name;
    Object.keys(RULES).forEach(function (s) {
      RULES[s].forEach(function (r) {
        if (r[0] === name && target(name).hasAttribute('aria-invalid')) showError(name, r[1]());
      });
    });
  }

  function formatData(iso) {
    var p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }
  var nomeDi = function (list, v) {
    var x = list.filter(function (o) { return o.valore === v; })[0];
    return x ? x.nome : v;
  };

  function renderSummary() {
    var box = $('[data-summary]');
    box.innerHTML = '';
    var blocks = [
      [1, 'I tuoi dati', [['Nome', val('nome') + ' ' + val('cognome')], ['Nato/a il', formatData(val('nascita'))]]],
      [2, 'La patente', [['Patente', nomeDi(D.patenti, checked('patente')[0])], ['Foglio rosa', nomeDi(D.fogliorosa, checked('fogliorosa')[0])]]],
      [3, 'Disponibilità', [['Giorni', checked('giorni').join(', ')], ['Fasce', checked('fasce').map(function (v) { return nomeDi(D.fasce, v); }).join(', ')]]],
      [4, 'Contatti', [['Telefono', val('telefono')], ['Email', val('email')], ['Privacy', 'Presa visione']]]
    ];
    blocks.forEach(function (b) {
      var sec = el('div', 'sum-block');
      sec.appendChild(el('h4', null, b[1]));
      var edit = el('button', 'sum-edit', 'Modifica');
      edit.type = 'button';
      edit.setAttribute('aria-label', 'Modifica: ' + b[1].toLowerCase());
      edit.addEventListener('click', function () {
        goStep(b[0]);
      });
      sec.appendChild(edit);
      var dl = el('dl');
      b[2].forEach(function (row) {
        var d = el('div');
        d.appendChild(el('dt', null, row[0]));
        d.appendChild(el('dd', null, row[1]));
        dl.appendChild(d);
      });
      sec.appendChild(dl);
      box.appendChild(sec);
    });
  }

  function goStep(n, noFocus) {
    pre.step = n;
    $$('.mstep', form).forEach(function (s) {
      s.hidden = Number(s.dataset.step) !== n;
    });
    if (n === 5) renderSummary();
    var done = n > STEPS;
    countOut.textContent = done ? 'Fatto' : 'Passo ' + n + ' di ' + STEPS + ' · ' + NOMI[n - 1];
    barFill.style.transform = 'scaleX(' + Math.min(n, STEPS) / STEPS + ')';
    foot.hidden = done;
    btnPrev.disabled = n === 1;
    btnNext.textContent = n === STEPS ? 'Conferma' : 'Avanti';
    $('.modal__body', form).scrollTop = 0;
    if (!noFocus) {
      var h = $('.mstep[data-step="' + n + '"] h3', form);
      if (h) h.focus();
    }
  }

  btnPrev.addEventListener('click', function () {
    if (pre.step > 1) goStep(pre.step - 1);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (pre.step < STEPS) {
      var bad = validate(pre.step);
      if (bad) {
        focusTarget(bad).focus();
        return;
      }
      goStep(pre.step + 1);
      return;
    }
    if (pre.step === STEPS) confirm();
  });

  // Conferma: protetta dal doppio clic, non crea doppioni
  function confirm() {
    if (pre.sending || pre.done) return;
    pre.sending = true;
    btnNext.disabled = true;
    btnPrev.disabled = true;
    btnNext.textContent = 'Un attimo…';
    setTimeout(function () {
      pre.sending = false;
      pre.done = true;
      btnNext.disabled = false;
      goStep(STEPS + 1);
      avviso('Nessun dato è stato inviato: la pre-iscrizione è solo una simulazione.');
    }, 500);
  }

  function reset() {
    form.reset();
    $$('[aria-invalid]', form).forEach(function (n) {
      n.removeAttribute('aria-invalid');
    });
    $$('.field__error', form).forEach(function (n) {
      n.hidden = true;
    });
    pre.done = false;
    pre.sending = false;
    goStep(1, true);
  }

  function openModal(opener) {
    pre.opener = opener;
    if (pre.done) reset();
    setMenu(false);
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
    goStep(pre.step);
  }

  function closeModal() {
    if (!modal.open) return;
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
    // Il focus torna a chi ha aperto il modale (se è nascosto, al bottone del menu)
    var o = pre.opener;
    if (o && o.offsetParent === null) o = toggle.offsetParent !== null ? toggle : $('.header__cta');
    if (o) o.focus();
  }

  $$('[data-open-iscrizione]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(a);
    });
  });
  $$('[data-close]', modal).forEach(function (b) {
    b.addEventListener('click', closeModal);
  });
  $('[data-restart]', modal).addEventListener('click', function () {
    reset();
    goStep(1);
  });
  // Esc: chiude e restituisce il focus (gestito qui, senza dipendere dall'evento "close")
  modal.addEventListener('cancel', function (e) {
    e.preventDefault();
    closeModal();
  });
  modal.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }
  });
  // Clic sullo sfondo scuro: chiude (i dati restano per la prossima apertura)
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  goStep(1, true);

  /* ---------- Anteprima nel sito di Next Siteo (?vista=quiz) ---------- */
  // window.scrollTo muove solo questa pagina, non quella che la contiene.
  if (/[?&]vista=quiz/.test(location.search)) {
    var q = document.getElementById('quiz');
    window.scrollTo({ top: Math.max(0, q.getBoundingClientRect().top + window.pageYOffset - 90), behavior: 'instant' });
  }
})();
