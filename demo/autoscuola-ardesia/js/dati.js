/* ==================================================================
   AUTOSCUOLA ARDESIA · DATI (demo di Next Siteo, attività di fantasia)
   Un solo file per orari, servizi e documenti: la tabella degli orari,
   l'etichetta "Aperto ora", il footer, le card dei servizi e la lista
   dei documenti leggono tutti da qui.
   ================================================================== */
window.ARDESIA = {
  // Orari della segreteria: fasce in minuti dalla mezzanotte (0 = domenica)
  orari: {
    1: [[540, 750], [930, 1140]],
    2: [[540, 750], [930, 1140]],
    3: [[540, 750], [930, 1140]],
    4: [[540, 750], [930, 1140]],
    5: [[540, 750], [930, 1140]],
    6: [[540, 720]],
    0: []
  },
  giorni: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],

  // Patenti e servizi: card numerate con il dettaglio "Per saperne di più"
  servizi: [
    {
      titolo: 'Patenti AM, A1, A2 e A',
      breve: 'Scooter, moto leggere e moto di ogni cilindrata. Ti aiutiamo a scegliere quella giusta per la tua età.',
      aChi: 'A chi vuole guidare uno scooter o una moto. AM da 14 anni, A1 da 16, A2 da 18, A da 24, oppure da 20 se hai la A2 da almeno due anni.',
      come: 'Corso di teoria ed esame di teoria. Poi le guide in moto con l\'istruttore e l\'esame pratico.',
      portare: 'Documento d\'identità, codice fiscale, foto tessera e certificato medico.',
      documenti: 'moto'
    },
    {
      titolo: 'Patente B',
      breve: 'La patente per l\'auto. Teoria in aula, guide con l\'istruttore e accompagnamento agli esami.',
      aChi: 'A chi vuole guidare l\'auto. La patente B si prende a 18 anni.',
      come: 'Lezioni ed esame di teoria. Con il foglio rosa inizi le guide, comprese quelle obbligatorie su strade extraurbane, in autostrada e di notte. Poi l\'esame di guida.',
      portare: 'Documento d\'identità, codice fiscale, foto tessera e certificato medico.',
      documenti: 'b'
    },
    {
      titolo: 'Patenti C e CQC',
      breve: 'Per guidare i camion, anche per lavoro: patente C e carta di qualificazione del conducente.',
      aChi: 'A chi guida o vuole guidare i camion. Serve già la patente B.',
      come: 'Teoria, guide ed esami come per le altre patenti. La patente C si prende da 21 anni, oppure da 18 insieme alla CQC, che serve a chi guida i camion per lavoro.',
      portare: 'La tua patente B, documento d\'identità, codice fiscale, foto tessera e certificato medico.',
      documenti: 'c'
    },
    {
      titolo: 'Rinnovo patente',
      breve: 'Visita medica in sede e pratica completa. Ti diciamo noi cosa serve, senza giri a vuoto.',
      aChi: 'A chi ha la patente in scadenza. La durata dipende dall\'età e dal tipo di patente: te la controlliamo noi.',
      come: 'Prenoti la visita medica in sede. Se il medico conferma i requisiti, la patente nuova ti arriva a casa per posta.',
      portare: 'La patente, documento d\'identità, codice fiscale e una foto tessera. Se usi occhiali o lenti per guidare, portali alla visita.',
      documenti: 'rinnovo'
    },
    {
      titolo: 'Recupero punti',
      breve: 'Corsi in aula per recuperare una parte dei punti persi sulla patente.',
      aChi: 'A chi ha perso dei punti e vuole recuperarne una parte, prima di arrivare a zero.',
      come: 'Un corso in aula sulla sicurezza stradale. Quanti punti recuperi dipende dalla patente: te lo spieghiamo prima di iscriverti. Se i punti arrivano a zero, invece, serve la revisione della patente con un nuovo esame.',
      portare: 'La patente e un documento d\'identità.',
      documenti: null
    },
    {
      titolo: 'Duplicati e conversioni',
      breve: 'Patente persa, rovinata o presa all\'estero? Ti seguiamo nella pratica, passo dopo passo.',
      aChi: 'A chi ha perso la patente o l\'ha rovinata, e a chi ha una patente straniera da convertire.',
      come: 'Per il duplicato prepariamo noi la pratica. Per la conversione le regole cambiano da Paese a Paese: verifichiamo insieme il tuo caso.',
      portare: 'Denuncia di smarrimento o furto, oppure la patente rovinata; documento d\'identità, codice fiscale e foto tessera. Per le conversioni, anche la patente straniera.',
      documenti: 'duplicato'
    }
  ],

  // Documenti da portare, per patente o pratica
  documenti: [
    {
      id: 'moto',
      nome: 'Moto (AM, A1, A2, A)',
      voci: [
        'Documento d\'identità valido',
        'Codice fiscale o tessera sanitaria',
        'Due foto tessera recenti e uguali',
        'Certificato medico per la patente (la visita si può fare in sede)',
        'Per i cittadini non UE: permesso di soggiorno'
      ]
    },
    {
      id: 'b',
      nome: 'Patente B',
      voci: [
        'Documento d\'identità valido',
        'Codice fiscale o tessera sanitaria',
        'Due foto tessera recenti e uguali',
        'Certificato medico per la patente (la visita si può fare in sede)',
        'Per i cittadini non UE: permesso di soggiorno'
      ]
    },
    {
      id: 'c',
      nome: 'Patenti C e CQC',
      voci: [
        'Patente B valida',
        'Documento d\'identità valido',
        'Codice fiscale o tessera sanitaria',
        'Due foto tessera recenti e uguali',
        'Certificato medico per la patente: ti spieghiamo noi dove farlo'
      ]
    },
    {
      id: 'rinnovo',
      nome: 'Rinnovo',
      voci: [
        'La patente da rinnovare',
        'Documento d\'identità valido',
        'Codice fiscale o tessera sanitaria',
        'Una foto tessera recente',
        'Occhiali o lenti, se li usi per guidare (servono alla visita)'
      ]
    },
    {
      id: 'duplicato',
      nome: 'Duplicato',
      voci: [
        'Denuncia di smarrimento o furto, oppure la patente rovinata',
        'Documento d\'identità valido',
        'Codice fiscale o tessera sanitaria',
        'Foto tessera recenti'
      ]
    }
  ]
};
