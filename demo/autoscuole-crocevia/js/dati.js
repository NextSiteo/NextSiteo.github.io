/* ==================================================================
   AUTOSCUOLE CROCEVIA · DATI FINTI (demo di Next Siteo)
   Sedi, orari, tipi di guida e orari occupati sono generati qui, in
   modo ripetibile: lo stesso giorno mostra sempre gli stessi posti
   liberi. In un sito vero questi dati arriverebbero dal gestionale.
   ================================================================== */
(function () {
  'use strict';

  // Ogni sede è una "linea", come in una mappa della metro.
  // orari: fasce di apertura della segreteria in minuti, per giorno (0 = domenica)
  var SEDI = [
    {
      id: 'vallefinta', nome: 'Vallefinta', sigla: 'V', indirizzo: 'Corso Centrale 40',
      auto: ['Auto 1, cambio manuale', 'Auto 2, cambio automatico'],
      orari: { 1: [[540, 1140]], 2: [[540, 1140]], 3: [[540, 1140]], 4: [[540, 1140]], 5: [[540, 1140]], 6: [[540, 750]] }
    },
    {
      id: 'pratofinto', nome: 'Pratofinto', sigla: 'P', indirizzo: 'Via delle Querce 8',
      auto: ['Auto 3, cambio manuale'],
      orari: { 1: [[900, 1140]], 2: [[900, 1140]], 3: [[900, 1140]], 4: [[900, 1140]], 5: [[900, 1140]] }
    },
    {
      id: 'borgo-lago', nome: 'Borgo Lago', sigla: 'B', indirizzo: 'Lungolago 15',
      auto: ['Auto 4, cambio manuale'],
      orari: { 2: [[540, 780]], 4: [[540, 780]], 6: [[540, 750]] }
    }
  ];

  var TIPI = [
    { id: 'citta', nome: 'Città' },
    { id: 'extraurbana', nome: 'Extraurbana' },
    { id: 'autostrada', nome: 'Autostrada' },
    { id: 'notturna', nome: 'Notturna' }
  ];

  var GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var GIORNI_BREVI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

  function iso(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var g = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + g;
  }

  function fromIso(s) {
    var p = s.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  function addDays(d, n) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  }

  // Lunedì della settimana che contiene la data
  function monday(d) {
    var day = d.getDay() || 7;
    return addDays(d, 1 - day);
  }

  // Ore di inizio delle guide: le notturne solo la sera, il sabato solo la mattina
  function ore(date, tipo) {
    var sat = date.getDay() === 6;
    if (tipo === 'notturna') return sat ? [] : [18, 19];
    var list = [];
    for (var h = 8; h <= (sat ? 12 : 17); h++) if (h !== 13) list.push(h);
    return list;
  }

  // Hash semplice e ripetibile: decide se un orario è già occupato
  function occupato(sedeId, date, h) {
    var s = sedeId + '|' + iso(date) + '|' + h;
    var x = 2166136261;
    for (var i = 0; i < s.length; i++) {
      x ^= s.charCodeAt(i);
      x = Math.imul(x, 16777619);
    }
    return ((x >>> 0) % 100) < 47;
  }

  function passato(date, h) {
    var t = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h);
    return t.getTime() <= Date.now();
  }

  function sede(id) {
    return SEDI.filter(function (s) { return s.id === id; })[0];
  }

  function auto(sedeId, date, h) {
    var s = sede(sedeId);
    return s.auto[(date.getDate() + h) % s.auto.length];
  }

  function dataLunga(d) {
    return GIORNI[d.getDay()] + ' ' + d.getDate() + ' ' + MESI[d.getMonth()];
  }

  function hhmm(m) {
    return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
  }

  // Segreteria aperta adesso? Testo pronto da mostrare.
  function statoSede(id, now) {
    var orari = sede(id).orari;
    var day = now.getDay();
    var min = now.getHours() * 60 + now.getMinutes();
    var oggi = orari[day] || [];
    for (var i = 0; i < oggi.length; i++) {
      if (min >= oggi[i][0] && min < oggi[i][1]) return { open: true, text: 'Aperta ora, chiude alle ' + hhmm(oggi[i][1]) };
      if (min < oggi[i][0]) return { open: false, text: 'Chiusa ora, apre alle ' + hhmm(oggi[i][0]) };
    }
    for (var d = 1; d <= 7; d++) {
      var next = orari[(day + d) % 7];
      if (next && next.length) {
        return { open: false, text: 'Chiusa, apre ' + (d === 1 ? 'domani' : GIORNI[(day + d) % 7]) + ' alle ' + hhmm(next[0][0]) };
      }
    }
    return { open: false, text: 'Chiusa' };
  }

  // Prossimi orari liberi, uno per sede (per la home)
  function prossimiLiberi(n) {
    var out = [];
    var d = new Date();
    SEDI.forEach(function (s) {
      for (var i = 0; i < 14; i++) {
        var day = addDays(d, i);
        if (day.getDay() === 0) continue;
        var hours = ore(day, 'citta');
        for (var j = 0; j < hours.length; j++) {
          if (!passato(day, hours[j]) && !occupato(s.id, day, hours[j])) {
            out.push({ date: day, ora: hours[j], sede: s });
            return;
          }
        }
      }
    });
    out.sort(function (a, b) {
      return a.date - b.date || a.ora - b.ora;
    });
    return out.slice(0, n);
  }

  window.Crocevia = {
    SEDI: SEDI,
    TIPI: TIPI,
    GIORNI: GIORNI,
    GIORNI_BREVI: GIORNI_BREVI,
    MESI: MESI,
    iso: iso,
    fromIso: fromIso,
    addDays: addDays,
    monday: monday,
    ore: ore,
    occupato: occupato,
    passato: passato,
    sede: sede,
    auto: auto,
    dataLunga: dataLunga,
    statoSede: statoSede,
    prossimiLiberi: prossimiLiberi
  };
})();
