/* ==================================================================
   NEXT SITEO · SCRIPT (JavaScript vanilla, nessuna libreria)
   - menu mobile
   - bordo dell'header dopo lo scroll (IntersectionObserver)
   - comparsa delle sezioni allo scroll (rispetta prefers-reduced-motion)
   - scala delle anteprime delle demo dentro le cornici
   - provenienza (?src=) nei messaggi WhatsApp e nel modulo, senza cookie
   - recensioni da js/config.js (sezione nascosta se l'elenco è vuoto)
   - bottone WhatsApp fisso, nascosto quando i Contatti sono visibili
   - modulo contatti: Formspree con fetch, oppure email già compilata
   ================================================================== */
(function () {
  'use strict';

  var C = window.NEXTSITEO || {};
  var NUMERO = C.whatsapp || '393472261131';
  var EMAIL = C.email || 'nextsiteo.office@gmail.com';
  var RISPOSTA = C.rispostaEntro || '';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Anno nel footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Provenienza: parametro ?src= e pagina, senza cookie né salvataggi ---------- */
  var src = (location.search.match(/[?&]src=([^&#]*)/) || [])[1] || '';
  try {
    src = decodeURIComponent(src);
  } catch (e) {
    src = '';
  }
  src = src.replace(/[^\w.-]/g, '').slice(0, 40);
  var pagina = document.body.getAttribute('data-pagina') || 'home';
  var provenienza = (src ? src + ' · ' : '') + pagina;
  var tag = '[da: ' + provenienza + ']';

  var waLink = function (testo) {
    return 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(testo + ' ' + tag);
  };
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa'));
  });
  // I link verso le pagine per nicchia e le demo portano con sé il parametro ?src=
  if (src) {
    document.querySelectorAll('[data-keep-src]').forEach(function (a) {
      var href = a.getAttribute('href');
      var hash = '';
      var i = href.indexOf('#');
      if (i > -1) {
        hash = href.slice(i);
        href = href.slice(0, i);
      }
      a.setAttribute('href', href + (href.indexOf('?') > -1 ? '&' : '?') + 'src=' + encodeURIComponent(src) + hash);
    });
  }

  /* ---------- Link al calendario (se configurato) ---------- */
  if (C.calendario) {
    document.querySelectorAll('[data-cta-call]').forEach(function (a) {
      a.href = C.calendario;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Prenotate una chiamata di 10 minuti';
    });
  }

  /* ---------- Scheda Google (se configurata) ---------- */
  if (C.schedaGoogle) {
    document.querySelectorAll('[data-google-profile]').forEach(function (a) {
      a.href = C.schedaGoogle;
      a.hidden = false;
    });
  }

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  if (toggle && menu) {
    var label = toggle.querySelector('.sr-only');
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Chiudi il menu' : 'Apri il menu';
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
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Header: bordo e ombra appena si scorre ---------- */
  var header = document.querySelector('[data-header]');
  var sentinel = document.querySelector('.top-sentinel');
  if (header && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Comparsa allo scroll ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Anteprime delle demo: l'iframe viene scalato alla larghezza della cornice ---------- */
  var screens = document.querySelectorAll('[data-screen]');
  var fit = function (screen) {
    var frame = screen.querySelector('iframe');
    if (!frame) return;
    var w = frame.offsetWidth;
    if (w) screen.style.setProperty('--scale', String(screen.clientWidth / w));
  };
  screens.forEach(fit);
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function (entries) {
      entries.forEach(function (en) {
        fit(en.target);
      });
    });
    screens.forEach(function (s) {
      ro.observe(s);
    });
  } else {
    window.addEventListener('resize', function () {
      screens.forEach(fit);
    });
  }

  /* ---------- Recensioni: solo vere, da js/config.js ---------- */
  var reviewsBox = document.querySelector('[data-reviews]');
  var recensioni = Array.isArray(C.recensioni) ? C.recensioni : [];
  if (reviewsBox && recensioni.length) {
    var list = reviewsBox.querySelector('[data-reviews-list]');
    recensioni.forEach(function (r) {
      var li = document.createElement('li');
      li.className = 'review';
      var stelle = Math.max(0, Math.min(5, Number(r.stelle) || 0));
      var stars = document.createElement('p');
      stars.className = 'review__stars';
      stars.setAttribute('aria-label', stelle + ' stelle su 5');
      for (var i = 0; i < 5; i++) {
        var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        s.setAttribute('class', 'icon' + (i < stelle ? '' : ' is-empty'));
        s.setAttribute('aria-hidden', 'true');
        var u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        u.setAttribute('href', '#i-star');
        s.appendChild(u);
        stars.appendChild(s);
      }
      var testo = document.createElement('p');
      testo.textContent = '«' + r.testo + '»';
      var nome = document.createElement('p');
      nome.className = 'review__name';
      nome.textContent = r.nome;
      if (r.attivita) {
        var sm = document.createElement('small');
        sm.textContent = r.attivita;
        nome.appendChild(sm);
      }
      li.appendChild(stars);
      li.appendChild(testo);
      li.appendChild(nome);
      if (r.link) {
        var a = document.createElement('a');
        a.href = r.link;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'Leggi su Google';
        li.appendChild(a);
      }
      list.appendChild(li);
    });
    if (C.schedaGoogle) {
      var more = reviewsBox.querySelector('[data-reviews-more]');
      more.querySelector('a').href = C.schedaGoogle;
      more.hidden = false;
    }
    reviewsBox.hidden = false;
  }

  /* ---------- WhatsApp fisso: si nasconde quando i Contatti sono sullo schermo ---------- */
  var waFloat = document.querySelector('[data-wa-float]');
  var contatti = document.getElementById('contatti');
  if (waFloat && contatti && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      function (entries) {
        var visibile = entries[0].isIntersecting;
        waFloat.classList.toggle('is-hidden', visibile);
        if (visibile) waFloat.setAttribute('tabindex', '-1');
        else waFloat.removeAttribute('tabindex');
      },
      { threshold: 0.15 }
    ).observe(contatti);
  }

  /* ---------- Modulo contatti ---------- */
  var form = document.querySelector('[data-contact-form]');
  if (!form) return;

  // "Oppure con il modulo" dall'analisi gratuita: preseleziona il servizio
  document.querySelectorAll('[data-servizio]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = form.querySelector('input[name="servizio"][value="' + a.getAttribute('data-servizio') + '"]');
      if (r) r.checked = true;
    });
  });

  var status = form.querySelector('[data-form-status]');
  var summary = form.querySelector('[data-form-summary]');
  var summaryList = form.querySelector('[data-form-summary-list]');
  var submit = form.querySelector('[data-submit]');
  var replyEmail = form.querySelector('[data-reply-email]');
  var fieldProvenienza = form.querySelector('[data-provenienza]');
  if (fieldProvenienza) fieldProvenienza.value = provenienza;
  var endpoint = form.getAttribute('action') || '';
  var endpointReady = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint) && endpoint.indexOf('XXXXXXX') === -1;
  var sending = false;

  var isEmail = function (v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  };

  var rules = {
    nome: function (v) {
      return v.trim().length < 2 ? 'Scrivete il vostro nome.' : '';
    },
    attivita: function (v) {
      return v.trim().length < 2 ? 'Scrivete che attività avete.' : '';
    },
    contatto: function (v) {
      v = v.trim();
      if (!v) return 'Scrivete un telefono o un\'email: almeno uno dei due serve per rispondervi.';
      if (v.indexOf('@') > -1) return isEmail(v) ? '' : 'L\'email non sembra corretta: controllate la @ e il punto.';
      var cifre = v.replace(/\D/g, '').length;
      return /^\+?[\d\s./-]+$/.test(v) && cifre >= 6 && cifre <= 15
        ? ''
        : 'Scrivete un numero di telefono (solo cifre, spazi e un + iniziale) oppure un indirizzo email.';
    },
    privacy: function (_, el) {
      return el.checked ? '' : "Per inviare la richiesta serve l'ok all'informativa privacy.";
    }
  };

  var field = function (name) {
    return form.elements.namedItem(name);
  };

  var setError = function (name, msg) {
    var el = field(name);
    var err = document.getElementById(el.id + '-err');
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) {
      err.textContent = msg;
      err.hidden = !msg;
    }
  };

  var validate = function (name) {
    var el = field(name);
    return rules[name](el.value || '', el);
  };

  var show = function (html, type) {
    status.innerHTML = html;
    status.dataset.type = type || 'ok';
    status.hidden = false;
    status.focus();
  };

  // Dopo il primo errore, il messaggio si aggiorna mentre si corregge
  form.addEventListener('input', function (e) {
    var name = e.target.name;
    if (rules[name] && e.target.getAttribute('aria-invalid') === 'true') setError(name, validate(name));
  });
  form.addEventListener('change', function (e) {
    var name = e.target.name;
    if (rules[name] && e.target.getAttribute('aria-invalid') === 'true') setError(name, validate(name));
  });
  // Uscendo dal campo "Telefono o email" già compilato, l'errore compare subito
  field('contatto').addEventListener('blur', function () {
    if (field('contatto').value.trim()) setError('contatto', validate('contatto'));
  });

  var buildText = function (data) {
    return [
      'Nome: ' + data.get('nome'),
      'Attività: ' + data.get('attivita'),
      'Telefono o email: ' + data.get('contatto'),
      'Cosa serve: ' + (data.get('servizio') || '-'),
      '',
      String(data.get('messaggio') || ''),
      '',
      tag
    ].join('\n');
  };
  var mailtoUrl = function (data) {
    return (
      'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent('Richiesta dal sito: ' + data.get('attivita')) +
      '&body=' + encodeURIComponent(buildText(data))
    );
  };
  var waButton =
    '<a class="btn btn--primary btn--sm" href="' + waLink('Ciao Next Siteo, vi ho appena scritto dal modulo del sito.') +
    '" target="_blank" rel="noopener">Scriveteci su WhatsApp<span class="sr-only"> (si apre in una nuova scheda)</span></a>';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return; // il doppio clic non crea doppioni
    status.hidden = true;

    var contatto = field('contatto').value.trim();
    replyEmail.value = isEmail(contatto) ? contatto : '';
    var data = new FormData(form);

    // Campo trappola compilato: è un robot, non inviamo nulla
    if (String(data.get('_gotcha') || '')) {
      form.reset();
      show('Grazie! Vi rispondiamo al più presto.');
      return;
    }

    var errors = [];
    Object.keys(rules).forEach(function (name) {
      var msg = validate(name);
      setError(name, msg);
      if (msg) errors.push([name, msg]);
    });

    if (errors.length) {
      summaryList.innerHTML = '';
      errors.forEach(function (pair) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + field(pair[0]).id;
        a.textContent = pair[1];
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          field(pair[0]).focus();
        });
        li.appendChild(a);
        summaryList.appendChild(li);
      });
      summary.hidden = false;
      summary.focus();
      return;
    }
    summary.hidden = true;

    // Endpoint Formspree non configurato: si apre un'email già compilata
    if (!endpointReady) {
      window.location.href = mailtoUrl(data);
      show(
        'Vi abbiamo aperto un\'email già compilata: premete invio per mandarcela. ' +
          'Se non si è aperto nulla, scriveteci a <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.'
      );
      return;
    }

    sending = true;
    submit.setAttribute('aria-busy', 'true');
    data.delete('_gotcha');
    fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        if (fieldProvenienza) fieldProvenienza.value = provenienza;
        show(
          '<strong>Grazie, richiesta inviata!</strong> Vi ricontattiamo ' +
            (RISPOSTA ? 'entro ' + RISPOSTA : 'al più presto') +
            '. Se preferite, scriveteci subito su WhatsApp.<br>' + waButton
        );
      })
      .catch(function () {
        show(
          '<strong>Invio non riuscito.</strong> Riprovate tra poco, oppure ' +
            '<a href="' + mailtoUrl(data).replace(/"/g, '&quot;') + '">mandateci la richiesta per email</a> ' +
            '(si apre già compilata) o scriveteci su WhatsApp.<br>' + waButton,
          'error'
        );
      })
      .then(function () {
        sending = false;
        submit.removeAttribute('aria-busy');
      });
  });
})();
