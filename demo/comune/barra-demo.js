/* ==================================================================
   BARRA DEMO (comune a tutte le demo di Next Siteo)
   Uso nella pagina della demo:
     <link rel="stylesheet" href="../comune/barra-demo.css">
     <script src="../comune/barra-demo.js" defer></script>
   - Inserisce in cima al <body> la barra "Sito dimostrativo" con
     "Voglio un sito così" e "Torna a Next Siteo".
   - Ogni elemento con [data-demo-avviso] (pulsanti finti: WhatsApp,
     chiama, email, indicazioni) apre al clic la finestra
     "Questa è una demo di Next Siteo", senza inviare nulla.
   - Gli script delle demo, dopo un modulo o una prenotazione finti,
     chiamano window.NextSiteoDemo.avviso('Testo facoltativo').
   L'unico link reale è quello a WhatsApp di Next Siteo, dentro la
   finestra: telefoni, email e indirizzi delle demo restano finti.
   ================================================================== */
(function () {
  'use strict';

  // Contatto di Next Siteo (lo stesso di js/config.js nella home)
  var WHATSAPP = '393472261131';

  // Provenienza: parametro ?src= (per esempio dalle email) e cartella della demo
  var src = (location.search.match(/[?&]src=([^&#]*)/) || [])[1] || '';
  src = decodeURIComponent(src).replace(/[^\w.-]/g, '').slice(0, 40);
  var slug = (location.pathname.match(/\/demo\/([^/]+)/) || [])[1] || 'demo';
  var HOME = '../../index.html' + (src ? '?src=' + encodeURIComponent(src) : '') + '#lavori';

  // Nome della demo, ricavato dal titolo della pagina
  function nomeDemo() {
    var meta = document.querySelector('meta[name="demo-nome"]');
    if (meta) return meta.content;
    var parts = document.title.replace(/\(demo\)/i, '').split('|').map(function (s) {
      return s.trim();
    }).filter(function (s) {
      return s && !/next siteo/i.test(s);
    });
    return (parts[parts.length - 1] || 'questa demo').split(',')[0].trim();
  }

  function linkWhatsApp() {
    var tag = '[da: demo ' + slug + (src ? ' · ' + src : '') + ']';
    var testo = 'Ciao Next Siteo, ho visto la demo ' + nomeDemo() + ' e vorrei qualcosa di simile per la mia attività. ' + tag;
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(testo);
  }

  /* ---------- Barra fissa in alto ---------- */
  var bar = document.createElement('div');
  bar.className = 'demo-bar';
  bar.setAttribute('role', 'note');
  bar.setAttribute('aria-label', 'Avviso: sito dimostrativo');
  bar.innerHTML =
    '<p><span class="demo-bar__long">Sito dimostrativo realizzato da Next Siteo, attività di fantasia</span>' +
    '<span class="demo-bar__short">Sito dimostrativo di Next Siteo, attività di fantasia</span></p>' +
    '<span class="demo-bar__actions">' +
    '<button class="demo-bar__want" type="button" data-demo-want>Voglio un sito così</button>' +
    '<a href="' + HOME + '" target="_top">Torna a Next Siteo</a></span>';
  document.body.insertBefore(bar, document.body.firstChild);

  /* ---------- Finestra "Questa è una demo di Next Siteo" ---------- */
  var ICON_CHAT =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.5a8.3 8.3 0 0 1-12.2 7.3L3.5 20.4l1.5-4.5a8.3 8.3 0 1 1 15.5-4.4z"/></svg>';
  var modal = null;
  var opener = null;

  function chiudi() {
    if (!modal || !modal.open) return;
    modal.close();
    if (opener && document.contains(opener) && opener.offsetParent !== null) opener.focus();
    opener = null;
  }

  function creaFinestra() {
    modal = document.createElement('dialog');
    modal.className = 'nsd-modal';
    modal.setAttribute('aria-labelledby', 'nsd-title');
    modal.setAttribute('aria-describedby', 'nsd-text');
    modal.innerHTML =
      '<div class="nsd-modal__body">' +
      '<p class="nsd-modal__label">Questa è una demo di Next Siteo</p>' +
      '<h2 id="nsd-title" tabindex="-1">Volete un sito così per la vostra attività?</h2>' +
      '<p id="nsd-text" data-nsd-text></p>' +
      '<p class="nsd-modal__note" data-nsd-note hidden></p>' +
      '<div class="nsd-modal__actions">' +
      '<a class="nsd-modal__wa" data-nsd-wa target="_blank" rel="noopener">' + ICON_CHAT + 'Scriveteci su WhatsApp<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"> (si apre in una nuova scheda)</span></a>' +
      '<button class="nsd-modal__back" type="button" data-nsd-close>Torna alla demo</button>' +
      '</div>' +
      '<p class="nsd-modal__small">Il messaggio cita questa demo: potete modificarlo prima di inviarlo. Telefoni, email e indirizzi della demo sono finti.</p>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('[data-nsd-close]').addEventListener('click', chiudi);
    // Esc chiude e restituisce il focus (gestito qui, senza dipendere dall'evento "close")
    modal.addEventListener('cancel', function (e) {
      e.preventDefault();
      chiudi();
    });
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        chiudi();
      }
    });
    // Clic sullo sfondo scuro: chiude
    modal.addEventListener('click', function (e) {
      if (e.target === modal) chiudi();
    });
  }

  function apri(testo, nota, trigger) {
    if (typeof HTMLDialogElement === 'undefined') {
      toast(testo);
      return;
    }
    if (!modal) creaFinestra();
    opener = trigger || document.activeElement;
    modal.querySelector('[data-nsd-text]').textContent = testo;
    var n = modal.querySelector('[data-nsd-note]');
    n.textContent = nota || '';
    n.hidden = !nota;
    modal.querySelector('[data-nsd-wa]').href = linkWhatsApp();
    if (!modal.open) modal.showModal();
    modal.querySelector('#nsd-title').focus();
  }

  // Dove porterebbe il pulsante su un sito vero
  function destinazione(el) {
    var s = ((el.getAttribute('href') || '') + ' ' + el.textContent + ' ' + (el.getAttribute('data-demo-avviso') || '')).toLowerCase();
    if (/whatsapp/.test(s)) return 'su WhatsApp, in chat con voi';
    if (/#chiama|chiama|telefon|numero/.test(s)) return 'al telefono, per chiamarvi';
    if (/#email|e-?mail/.test(s)) return 'a scrivervi un\'email';
    if (/indicazion|mappa|percorso/.test(s)) return 'alle indicazioni stradali per arrivare da voi';
    if (/privacy/.test(s)) return 'all\'informativa privacy della vostra attività';
    return 'a mettersi in contatto con voi';
  }

  /* ---------- Avviso di riserva ---------- */
  var toastEl = null;
  var timer = 0;
  function toast(testo) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'demo-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      toastEl.dataset.state = 'hidden';
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '';
    var t = document.createElement('strong');
    t.textContent = 'Questa è una demo';
    var p = document.createElement('span');
    p.textContent = testo;
    toastEl.appendChild(t);
    toastEl.appendChild(p);
    requestAnimationFrame(function () {
      toastEl.dataset.state = 'visible';
    });
    clearTimeout(timer);
    timer = setTimeout(function () {
      toastEl.dataset.state = 'hidden';
    }, 5000);
  }

  // Per gli script delle demo: moduli, pre-iscrizioni e prenotazioni finti
  function avviso(nota) {
    apri(
      'Sul vostro sito questa richiesta arriverebbe direttamente a voi, già completa. Qui nessun dato è stato inviato.',
      nota || '',
      document.activeElement
    );
  }

  document.addEventListener('click', function (e) {
    var want = e.target.closest('[data-demo-want]');
    if (want) {
      apri('Vi piace questa demo? Possiamo costruire un sito così per la vostra attività, con i vostri orari, prezzi e servizi.', '', want);
      return;
    }
    var el = e.target.closest('a[data-demo-avviso], button[data-demo-avviso]');
    if (!el) return;
    e.preventDefault();
    apri('Sul vostro sito questo pulsante porterebbe il cliente ' + destinazione(el) + '.', '', el);
  });

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.hasAttribute('data-demo-avviso')) return;
    e.preventDefault();
    avviso(form.getAttribute('data-demo-avviso') || '');
  });

  window.NextSiteoDemo = { avviso: avviso };
})();
