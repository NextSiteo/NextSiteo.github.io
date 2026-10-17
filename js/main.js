/* ==================================================================
   NEXT SITEO · SCRIPT (JavaScript vanilla, nessuna libreria)
   - menu mobile e voce attiva del menu mentre si scorre
   - header con bordo dopo lo scroll
   - comparsa delle sezioni allo scroll, con piccolo ritardo a cascata
   - linea del tempo del metodo che si riempie scorrendo
   - leggera profondità dei dispositivi nella hero (solo mouse, solo
     senza "riduci movimento")
   - provenienza (?src=) nei messaggi WhatsApp e nel modulo, senza cookie
   - recensioni da js/config.js (sezione nascosta se l'elenco è vuoto)
   - bottone WhatsApp fisso, nascosto quando i Contatti sono visibili
   - modulo contatti: Formspree con fetch, oppure email già compilata
   Tutto il testo inserito nella pagina passa da textContent:
   niente HTML costruito con i dati scritti dai visitatori.
   ================================================================== */
(function () {
  'use strict';

  // Segnala alla <head> che lo script è partito (altrimenti dopo 3 secondi si mostra tutto)
  window.NEXTSITEO_PRONTO = true;

  var C = window.NEXTSITEO || {};
  var NUMERO = C.whatsapp || '393472261131';
  var EMAIL = C.email || 'nextsiteo.office@gmail.com';
  var RISPOSTA = C.rispostaEntro || '';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  // Piccolo aiuto per creare elementi senza innerHTML
  var el = function (tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  };
  var isHttps = function (url) {
    return /^https:\/\/[^\s"'<>]+$/.test(String(url || ''));
  };

  /* ---------- Anno nel footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (n) {
    n.textContent = String(new Date().getFullYear());
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

  /* ---------- Link al calendario e scheda Google (solo se configurati in js/config.js) ---------- */
  if (isHttps(C.calendario)) {
    document.querySelectorAll('[data-calendar]').forEach(function (a) {
      a.href = C.calendario;
      a.target = '_blank';
      a.rel = 'noopener';
      a.hidden = false;
    });
  }
  if (isHttps(C.schedaGoogle)) {
    document.querySelectorAll('[data-google-profile]').forEach(function (a) {
      a.href = C.schedaGoogle;
      a.hidden = false;
      var item = a.closest('[data-google-profile-item]');
      if (item) item.hidden = false;
    });
  }

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  if (toggle && menu) {
    var label = toggle.querySelector('.sr-only');
    var isOpen = function () {
      return toggle.getAttribute('aria-expanded') === 'true';
    };
    var setMenu = function (open, focusToggle) {
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Chiudi il menu' : 'Apri il menu';
      menu.hidden = !open;
      if (open) {
        var first = menu.querySelector('a');
        if (first) first.focus();
      } else if (focusToggle) {
        toggle.focus();
      }
    };
    toggle.addEventListener('click', function () {
      setMenu(!isOpen());
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) setMenu(false, true);
    });
    document.addEventListener('click', function (e) {
      if (isOpen() && !menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Header: bordo e ombra appena si scorre ---------- */
  var header = document.querySelector('[data-header]');
  var sentinel = document.querySelector('.top-sentinel');
  if (header && sentinel && hasIO) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Voce del menu attiva mentre si scorre ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__list a[href^="#"]'));
  if (navLinks.length && hasIO) {
    var byId = {};
    navLinks.forEach(function (a) {
      byId[a.getAttribute('href').slice(1)] = a;
    });
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          // Sezioni senza voce di menu (hero compresa) spengono l'evidenziazione
          navLinks.forEach(function (a) {
            a.classList.remove('is-active');
          });
          if (en.target.id && byId[en.target.id]) byId[en.target.id].classList.add('is-active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    document.querySelectorAll('main > section').forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ---------- Comparsa allo scroll, con ritardo a cascata tra elementi vicini ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduced || !hasIO) {
    reveals.forEach(function (n) {
      n.classList.add('is-visible');
    });
  } else {
    reveals.forEach(function (n) {
      var siblings = Array.prototype.filter.call(n.parentElement.children, function (c) {
        return c.hasAttribute('data-reveal');
      });
      var i = siblings.indexOf(n);
      if (i > 0) n.style.setProperty('--d', Math.min(i, 5) * 90 + 'ms');
    });
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
    reveals.forEach(function (n) {
      io.observe(n);
    });
  }

  /* ---------- Linea del tempo del metodo ---------- */
  document.querySelectorAll('[data-timeline]').forEach(function (line) {
    var steps = Array.prototype.slice.call(line.querySelectorAll('.step'));
    var last = steps.length - 1;
    var accendi = function (upTo) {
      steps.forEach(function (s, i) {
        s.classList.toggle('is-on', i <= upTo);
      });
      line.style.setProperty('--p', last > 0 ? String(Math.max(0, upTo) / last) : '1');
    };
    if (reduced || !hasIO) {
      accendi(last);
      return;
    }
    var massimo = -1;
    var tio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var i = steps.indexOf(en.target);
          if (en.isIntersecting && i > massimo) massimo = i;
          // Tornando su, i passi sotto la metà dello schermo si spengono
          if (!en.isIntersecting && en.boundingClientRect.top > 0 && i <= massimo) massimo = i - 1;
        });
        accendi(massimo);
      },
      { rootMargin: '0px 0px -45% 0px' }
    );
    steps.forEach(function (s) {
      tio.observe(s);
    });
  });

  /* ---------- Hero: leggera profondità dei dispositivi seguendo il mouse ---------- */
  var stage = document.querySelector('[data-parallax]');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
  if (stage && !reduced && finePointer.matches) {
    var layers = Array.prototype.slice.call(stage.querySelectorAll('[data-depth]'));
    var area = stage.closest('section') || stage;
    var target = { x: 0, y: 0 };
    var pos = { x: 0, y: 0 };
    var frame = 0;
    var draw = function () {
      pos.x += (target.x - pos.x) * 0.08;
      pos.y += (target.y - pos.y) * 0.08;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute('data-depth')) || 0;
        l.style.translate = (pos.x * d * 10).toFixed(2) + 'px ' + (pos.y * d * 8).toFixed(2) + 'px';
      });
      if (Math.abs(target.x - pos.x) > 0.001 || Math.abs(target.y - pos.y) > 0.001) {
        frame = requestAnimationFrame(draw);
      } else {
        frame = 0;
      }
    };
    var muovi = function () {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    area.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      target.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      muovi();
    });
    area.addEventListener('pointerleave', function () {
      target.x = 0;
      target.y = 0;
      muovi();
    });
  }

  /* ---------- Recensioni: solo vere, da js/config.js ---------- */
  var reviewsBox = document.querySelector('[data-reviews]');
  var recensioni = Array.isArray(C.recensioni) ? C.recensioni : [];
  if (reviewsBox && recensioni.length) {
    var list = reviewsBox.querySelector('[data-reviews-list]');
    recensioni.forEach(function (r) {
      var stelle = Math.max(0, Math.min(5, Number(r.stelle) || 0));
      var stars = el('p', { class: 'review__stars', role: 'img', 'aria-label': stelle + ' stelle su 5' });
      for (var i = 0; i < 5; i++) {
        var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        s.setAttribute('class', 'icon' + (i < stelle ? '' : ' is-empty'));
        s.setAttribute('aria-hidden', 'true');
        var u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        u.setAttribute('href', '#i-star');
        s.appendChild(u);
        stars.appendChild(s);
      }
      var nome = el('p', { class: 'review__name', text: String(r.nome || '') });
      if (r.attivita) nome.appendChild(el('small', { text: String(r.attivita) }));
      var li = el('li', { class: 'review' }, [stars, el('p', { text: '«' + String(r.testo || '') + '»' }), nome]);
      if (isHttps(r.link)) {
        li.appendChild(el('a', { href: r.link, target: '_blank', rel: 'noopener', text: 'Leggi su Google' }));
      }
      list.appendChild(li);
    });
    if (isHttps(C.schedaGoogle)) {
      var more = reviewsBox.querySelector('[data-reviews-more]');
      more.querySelector('a').href = C.schedaGoogle;
      more.hidden = false;
    }
    reviewsBox.hidden = false;
  }

  /* ---------- WhatsApp fisso: compare dopo la hero, si nasconde quando i Contatti sono sullo schermo ---------- */
  var waFloat = document.querySelector('[data-wa-float]');
  var contatti = document.getElementById('contatti');
  var heroCta = document.querySelector('.hero .btn-row');
  if (waFloat && contatti && hasIO) {
    var vista = { hero: !!heroCta, contatti: false };
    var aggiorna = function () {
      var nascosto = vista.hero || vista.contatti;
      waFloat.classList.toggle('is-hidden', nascosto);
      if (nascosto) waFloat.setAttribute('tabindex', '-1');
      else waFloat.removeAttribute('tabindex');
    };
    aggiorna();
    new IntersectionObserver(
      function (entries) {
        vista.contatti = entries[0].isIntersecting;
        aggiorna();
      },
      { threshold: 0.15 }
    ).observe(contatti);
    if (heroCta) {
      new IntersectionObserver(function (entries) {
        vista.hero = entries[0].isIntersecting;
        aggiorna();
      }).observe(heroCta);
    }
  }

  /* ---------- Modulo contatti ---------- */
  var form = document.querySelector('[data-contact-form]');
  if (!form) return;

  // Link che preselezionano il servizio nel modulo (es. data-servizio="Rifare il sito")
  document.querySelectorAll('[data-servizio]').forEach(function (a) {
    a.addEventListener('click', function () {
      var radios = form.querySelectorAll('input[name="servizio"]');
      Array.prototype.forEach.call(radios, function (r) {
        if (r.value === a.getAttribute('data-servizio')) r.checked = true;
      });
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

  // Solo due campi obbligatori: come chiamarvi e dove rispondervi
  var rules = {
    nome: function (v) {
      return v.trim().length < 2 ? 'Scrivete il vostro nome.' : '';
    },
    contatto: function (v) {
      v = v.trim();
      if (!v) return 'Scrivete un telefono o un\'email: almeno uno dei due serve per rispondervi.';
      if (v.indexOf('@') > -1) return isEmail(v) ? '' : 'L\'email non sembra corretta: controllate la @ e il punto.';
      var cifre = v.replace(/\D/g, '').length;
      return /^\+?[\d\s./-]+$/.test(v) && cifre >= 6 && cifre <= 15
        ? ''
        : 'Scrivete un numero di telefono (solo cifre, spazi e un + iniziale) oppure un indirizzo email.';
    }
  };

  var field = function (name) {
    return form.elements.namedItem(name);
  };

  var setError = function (name, msg) {
    var f = field(name);
    var err = document.getElementById(f.id + '-err');
    f.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) {
      err.textContent = msg;
      err.hidden = !msg;
    }
  };

  var validate = function (name) {
    var f = field(name);
    return rules[name](f.value || '', f);
  };

  var show = function (nodes, type) {
    while (status.firstChild) status.removeChild(status.firstChild);
    nodes.forEach(function (n) {
      status.appendChild(n);
    });
    status.setAttribute('data-type', type || 'ok');
    status.hidden = false;
    status.focus();
  };

  // Dopo il primo errore, il messaggio si aggiorna mentre si corregge
  ['input', 'change'].forEach(function (evt) {
    form.addEventListener(evt, function (e) {
      var name = e.target.name;
      if (rules[name] && e.target.getAttribute('aria-invalid') === 'true') setError(name, validate(name));
    });
  });
  // Uscendo dal campo "Telefono o email" già compilato, l'errore compare subito
  field('contatto').addEventListener('blur', function () {
    if (field('contatto').value.trim()) setError('contatto', validate('contatto'));
  });

  var buildText = function (data) {
    return [
      'Nome: ' + data.get('nome'),
      'Attività: ' + (data.get('attivita') || '-'),
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
      '?subject=' + encodeURIComponent('Richiesta dal sito: ' + (data.get('attivita') || data.get('nome'))) +
      '&body=' + encodeURIComponent(buildText(data))
    );
  };
  var waButton = function () {
    return el('a', { class: 'btn btn--primary btn--sm', href: waLink('Ciao Next Siteo, vi ho appena scritto dal modulo del sito.'), target: '_blank', rel: 'noopener' }, [
      'Scriveteci su WhatsApp',
      el('span', { class: 'sr-only', text: ' (si apre in una nuova scheda)' })
    ]);
  };

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
      show([el('p', { text: 'Grazie! Vi rispondiamo al più presto.' })]);
      return;
    }

    var errors = [];
    Object.keys(rules).forEach(function (name) {
      var msg = validate(name);
      setError(name, msg);
      if (msg) errors.push([name, msg]);
    });

    if (errors.length) {
      while (summaryList.firstChild) summaryList.removeChild(summaryList.firstChild);
      errors.forEach(function (pair) {
        var a = el('a', { href: '#' + field(pair[0]).id, text: pair[1] });
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          field(pair[0]).focus();
        });
        summaryList.appendChild(el('li', {}, [a]));
      });
      summary.hidden = false;
      summary.focus();
      return;
    }
    summary.hidden = true;

    // Endpoint Formspree non configurato: si apre un'email già compilata
    if (!endpointReady) {
      window.location.href = mailtoUrl(data);
      show([
        el('p', {}, [
          'Vi abbiamo aperto un\'email già compilata: premete invio per mandarcela. Se non si è aperto nulla, scriveteci a ',
          el('a', { href: 'mailto:' + EMAIL, text: EMAIL }),
          '.'
        ])
      ]);
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
        show([
          el('p', {}, [
            el('strong', { text: 'Grazie, richiesta inviata!' }),
            ' Vi ricontattiamo ' + (RISPOSTA ? 'entro ' + RISPOSTA : 'al più presto') + '. Se preferite, scriveteci subito su WhatsApp.'
          ]),
          waButton()
        ]);
      })
      .catch(function () {
        show(
          [
            el('p', {}, [
              el('strong', { text: 'Invio non riuscito.' }),
              ' Riprovate tra poco, oppure ',
              el('a', { href: mailtoUrl(data), text: 'mandateci la richiesta per email' }),
              ' (si apre già compilata) o scriveteci su WhatsApp. I dati che avete scritto sono ancora nel modulo.'
            ]),
            waButton()
          ],
          'error'
        );
      })
      .then(function () {
        sending = false;
        submit.removeAttribute('aria-busy');
      });
  });
})();
