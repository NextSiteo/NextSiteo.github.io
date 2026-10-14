/* ==================================================================
   AUTOSCUOLA CROCEVIA · DATI (demo di Next Siteo, attività di fantasia)
   Tutti i contenuti che la pagina costruisce da JavaScript:
   domande del quiz, FAQ e opzioni della pre-iscrizione.
   Le domande del quiz sono esempi scritti per la demo, non quelle
   ufficiali del Ministero.
   ================================================================== */
window.CROCEVIA = {
  // Mini quiz patente B: vero o falso, con la spiegazione mostrata dopo la risposta
  quiz: [
    {
      testo: 'Il segnale di STOP obbliga a fermarsi anche se l\'incrocio è libero.',
      risposta: true,
      spiegazione: 'Allo STOP ci si ferma sempre, poi si dà la precedenza a chi arriva da destra e da sinistra.'
    },
    {
      testo: 'Con la patente B si può guidare un\'auto con più di nove posti, compreso quello del conducente.',
      risposta: false,
      spiegazione: 'La patente B vale per veicoli fino a nove posti in tutto: otto passeggeri più il conducente.'
    },
    {
      testo: 'In autostrada il limite di velocità per le auto è 130 km/h, se i cartelli non indicano un limite diverso.',
      risposta: true,
      spiegazione: '130 km/h è il limite generale in autostrada. I cartelli possono indicarne uno più basso.'
    },
    {
      testo: 'Quando piove, in autostrada il limite per le auto scende a 110 km/h.',
      risposta: true,
      spiegazione: 'Con pioggia, neve o altre precipitazioni il limite in autostrada scende a 110 km/h.'
    },
    {
      testo: 'Nei centri abitati il limite generale di velocità è 50 km/h.',
      risposta: true,
      spiegazione: 'In città il limite è 50 km/h, salvo cartelli che ne indicano uno diverso.'
    },
    {
      testo: 'Fuori dai centri abitati il triangolo va posizionato ad almeno 50 metri dal veicolo fermo.',
      risposta: true,
      spiegazione: 'Fuori città il triangolo va messo ad almeno 50 metri, in modo che si veda da lontano.'
    },
    {
      testo: 'Il giallo fisso del semaforo significa che bisogna accelerare per passare prima del rosso.',
      risposta: false,
      spiegazione: 'Con il giallo ci si deve fermare. Si passa solo se si è già troppo vicini per fermarsi in sicurezza.'
    },
    {
      testo: 'Le cinture di sicurezza sono obbligatorie anche per chi siede sui sedili posteriori.',
      risposta: true,
      spiegazione: 'Le cinture vanno allacciate su tutti i sedili, davanti e dietro.'
    },
    {
      testo: 'Nei primi tre anni di patente B il limite in autostrada è 100 km/h.',
      risposta: true,
      spiegazione: 'Chi ha la patente B da meno di tre anni non può superare i 100 km/h in autostrada.'
    },
    {
      testo: 'Nei primi tre anni di patente si può guidare con un tasso alcolemico fino a 0,5 grammi per litro.',
      risposta: false,
      spiegazione: 'Nei primi tre anni di patente il tasso alcolemico deve essere zero: nemmeno un bicchiere.'
    }
  ],

  // Domande frequenti (risposte volutamente generiche dove i dati cambiano caso per caso)
  faq: [
    {
      domanda: 'A che età posso prendere la patente B?',
      risposta: 'La patente B si prende a 18 anni. Se ti manca poco, passa in segreteria: ti diciamo quando puoi iniziare.'
    },
    {
      domanda: 'Quali documenti servono per iscrivermi?',
      risposta: 'Di solito un documento d\'identità valido, il codice fiscale, le foto tessera e il certificato medico per la patente. In segreteria ti diamo la lista giusta per il tuo caso.'
    },
    {
      domanda: 'Quanto dura il percorso?',
      risposta: 'Dipende da te: da quanto tempo hai per studiare e da come vanno le guide. Lo organizziamo insieme, intorno ai tuoi impegni.'
    },
    {
      domanda: 'Quante guide devo fare?',
      risposta: 'Per la patente B ci sono sei ore di guida obbligatorie con l\'istruttore: su strade extraurbane, in autostrada e di notte. Le altre le decidi tu, in base a come ti senti.'
    },
    {
      domanda: 'Cos\'è il foglio rosa?',
      risposta: 'È l\'autorizzazione che ti permette di esercitarti alla guida dopo l\'esame di teoria. Vale dodici mesi e in questo tempo puoi fare l\'esame di guida due volte.'
    },
    {
      domanda: 'Cosa succede se non passo l\'esame?',
      risposta: 'Succede, e si riprova. Ci sono tempi di attesa e un numero massimo di tentativi: ti spieghiamo cosa fare nel tuo caso e ti aiutiamo a prepararti meglio.'
    },
    {
      domanda: 'La pre-iscrizione online mi impegna?',
      risposta: 'No. Serve solo a farti richiamare con le informazioni giuste. L\'iscrizione vera la firmi in segreteria.'
    }
  ],

  // Opzioni della pre-iscrizione
  patenti: [
    { valore: 'B', nome: 'Patente B', nota: 'Auto' },
    { valore: 'AM', nome: 'Patente AM', nota: 'Scooter e minicar' },
    { valore: 'A1', nome: 'Patente A1', nota: 'Moto fino a 125 cc' },
    { valore: 'A2', nome: 'Patente A2', nota: 'Moto fino a 35 kW' }
  ],
  fogliorosa: [
    { valore: 'no', nome: 'No, devo ancora iniziare' },
    { valore: 'si', nome: 'Sì, ce l\'ho già' }
  ],
  giorni: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
  fasce: [
    { valore: 'mattina', nome: 'Mattina', nota: '9-13' },
    { valore: 'pomeriggio', nome: 'Pomeriggio', nota: '14-18' },
    { valore: 'sera', nome: 'Tardo pomeriggio', nota: '18-20' }
  ]
};
