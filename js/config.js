/* ==================================================================
   NEXT SITEO · CONFIGURAZIONE (un solo posto per contatti e contenuti)
   Usato dalla home e dalle pagine per nicchia (autoscuole, ...).
   ================================================================== */
window.NEXTSITEO = {
  whatsapp: '393472261131',
  telefono: '+393472261131',
  email: 'nextsiteo.office@gmail.com',

  // Compare in hero, contatti e messaggio dopo l'invio del modulo
  rispostaEntro: '24-48 ore',

  // Link PUBBLICO per prenotare una chiamata (per esempio una "pagina di prenotazione"
  // di Google Calendar, che inizia con https://calendar.app.google/).
  // Vuoto: il pulsante diventa "Richiedi un preventivo gratuito" verso il modulo.
  calendario: '',

  // Link alla scheda Google dell'attività (vuoto finché non esiste)
  schedaGoogle: '',

  // Recensioni VERE, copiate dalla scheda Google con il permesso dell'autore.
  // Finché l'elenco è vuoto, la sezione Recensioni non si vede.
  // Esempio di formato (non pubblicare recensioni inventate):
  //   { nome: 'Nome C.', attivita: 'Tipo di attività', testo: 'Testo della recensione', stelle: 5, link: 'https://...' }
  recensioni: []
};
