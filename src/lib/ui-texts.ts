// Every fixed piece of wording in the public interface, with its default.
// The owner can override any of them (inline with "✎ Modifica" or from
// /admin/texts); overrides live in site_settings.ui_texts.
//
// Conventions inside a text:
//   *word*  → shown in pink italic (titles)
//   {n}     → replaced with a number where the label shows a count

type Group = { title: string; texts: Record<string, { label: string; value: string }> };

export const UI_TEXT_GROUPS: Record<string, Group> = {
  nav: {
    title: "Menu e piè di pagina",
    texts: {
      "nav.home": { label: "Menu: Home", value: "Home" },
      "nav.about": { label: "Menu: Chi sono", value: "Chi sono" },
      "nav.projects": { label: "Menu: Progetti", value: "Progetti" },
      "nav.travel": { label: "Menu: Viaggi", value: "Viaggi" },
      "nav.blog": { label: "Menu: Blog", value: "Blog" },
      "nav.contact": { label: "Pulsante in alto", value: "Scrivimi" },
      "footer.about": { label: "Footer: Chi sono", value: "Chi sono" },
      "footer.blog": { label: "Footer: Blog", value: "Blog" },
      "footer.linkedin": { label: "Footer: LinkedIn", value: "LinkedIn ↗" },
      "footer.email": { label: "Footer: Email", value: "Email ↗" },
    },
  },
  hero: {
    title: "Home: apertura",
    texts: {
      "home.hero.eyebrow": { label: "Etichetta sopra il saluto", value: "oltre il CV" },
      "home.hero.greeting": { label: "Saluto", value: "Ciao, sono" },
      "home.hero.cta": { label: "Pulsante principale", value: "Scopri cosa ho costruito" },
      "home.hero.secondary": { label: "Pulsante secondario", value: "Chi sono" },
    },
  },
  homeSections: {
    title: "Home: sezioni",
    texts: {
      "home.vision.label": { label: "Vision: etichetta", value: "vision e valori" },
      "home.vision.title": { label: "Vision: titolo", value: "Ciò in cui *credo*." },
      "home.vision.more": { label: "Vision: pulsante", value: "I miei valori" },
      "home.projects.title": { label: "Progetti: titolo", value: "Cose che ho *costruito*." },
      "home.projects.more": { label: "Progetti: pulsante", value: "Tutti i progetti" },
      "home.photos.label": { label: "Foto: etichetta", value: "dal vivo" },
      "home.photos.title": { label: "Foto: titolo", value: "Qualche *momento*." },
      "home.photos.hint": {
        label: "Foto: istruzioni",
        value: "Trascinale per sfogliarle, cliccane una per leggere la storia.",
      },
      "home.path.label": { label: "Percorso: etichetta", value: "percorso" },
      "home.path.title": { label: "Percorso: titolo", value: "La strada *fin qui*." },
      "home.path.subtitle": {
        label: "Percorso: sottotitolo",
        value: "Esperienze e formazione, dalla più recente.",
      },
      "home.path.experience": { label: "Percorso: pulsante esperienze", value: "Esperienze" },
      "home.path.education": { label: "Percorso: pulsante formazione", value: "Formazione" },
      "home.travel.title": { label: "Viaggi: titolo", value: "Il mondo, *un posto alla volta*." },
      "home.travel.countries": { label: "Viaggi: etichetta paesi", value: "Paesi" },
      "home.travel.stops": { label: "Viaggi: etichetta tappe", value: "Tappe" },
      "home.travel.cta": { label: "Viaggi: pulsante", value: "Gira il globo ↗" },
      "home.beyond.label": { label: "Fuori dal lavoro: etichetta", value: "fuori dal lavoro" },
      "home.beyond.title": {
        label: "Fuori dal lavoro: titolo",
        value: "Quello che mi forma, *ogni giorno*.",
      },
      "home.blog.label": { label: "Blog: etichetta", value: "blog" },
      "home.blog.title": { label: "Blog: titolo", value: "Pensieri messi *per iscritto*." },
      "home.blog.more": { label: "Blog: pulsante", value: "Tutti gli articoli" },
      "home.contact.label": { label: "Contatti: etichetta", value: "contatti" },
      "home.contact.title": { label: "Contatti: titolo", value: "Hai un'idea? *Parliamone*." },
      "home.contact.text": {
        label: "Contatti: testo",
        value: "Un progetto da costruire, una collaborazione o anche solo una curiosità: scrivimi.",
      },
      "home.contact.email": { label: "Contatti: pulsante email", value: "Scrivimi ↗" },
      "home.contact.linkedin": { label: "Contatti: pulsante LinkedIn", value: "LinkedIn ↗" },
    },
  },
  pages: {
    title: "Pagine interne",
    texts: {
      "about.label": { label: "Chi sono: etichetta", value: "chi sono" },
      "about.title": { label: "Chi sono: titolo", value: "Tutto quello che *mi rende me*." },
      "about.empty": { label: "Chi sono: nessuna sezione", value: "Nessuna sezione pubblicata ancora." },
      "about.more": { label: "Chi sono: altri contenuti", value: "+{n}" },
      "section.back": { label: "Sezione: link indietro", value: "Chi sono" },
      "section.count.one": { label: "Sezione: 1 elemento", value: "{n} elemento" },
      "section.count.many": { label: "Sezione: più elementi", value: "{n} elementi" },
      "section.empty": {
        label: "Sezione: vuota",
        value: "Nessun contenuto pubblicato ancora in questa sezione.",
      },
      "section.stories": { label: "Viaggi: titolo delle storie", value: "Storie" },
      "section.globeNote": {
        label: "Viaggi: nota sotto il globo",
        value:
          "Ogni puntina è un luogo in cui sono stata: cliccala per scoprirlo. Quelle rosa hanno anche un racconto da leggere.",
      },
      "entry.period": { label: "Contenuto: etichetta periodo", value: "Periodo" },
      "entry.place": { label: "Contenuto: etichetta luogo", value: "Luogo" },
      "entry.linked": { label: "Contenuto: collegamenti", value: "Collegato a" },
      "entry.prev": { label: "Contenuto: precedente", value: "← Precedente" },
      "entry.next": { label: "Contenuto: successivo", value: "Successivo →" },
      "card.more": { label: "Card: scopri di più", value: "Scopri di più" },
      "date.ongoing": { label: "Date: in corso", value: "oggi" },
    },
  },
  globe: {
    title: "Globo",
    texts: {
      "globe.hint": { label: "Istruzioni", value: "Trascina per ruotare · clicca una puntina" },
      "globe.hintZoom": { label: "Istruzioni a schermo intero", value: " · scorri per zoomare" },
      "globe.countries": { label: "Etichetta paesi", value: "Paesi" },
      "globe.stops": { label: "Etichetta tappe", value: "Tappe" },
      "globe.story": { label: "Link al racconto", value: "Leggi il racconto →" },
      "globe.close": { label: "Chiudi schermo intero", value: "Chiudi" },
    },
  },
  blog: {
    title: "Blog",
    texts: {
      "blog.soon": { label: "Etichetta senza articoli", value: "In arrivo" },
      "blog.count.one": { label: "1 articolo", value: "{n} articolo" },
      "blog.count.many": { label: "Più articoli", value: "{n} articoli" },
      "blog.all": { label: "Filtro: tutti", value: "Tutti" },
      "blog.back": { label: "Articolo: link indietro", value: "Blog" },
    },
  },
  login: {
    title: "Accesso",
    texts: {
      "login.title": { label: "Titolo", value: "Accedi" },
      "login.text": { label: "Testo", value: "Ricevi un link di accesso via email, senza password." },
      "login.button": { label: "Pulsante", value: "Invia il link di accesso" },
      "login.sent": {
        label: "Messaggio dopo l'invio",
        value: "Controlla la tua casella email: ti abbiamo inviato un link per accedere.",
      },
    },
  },
};

export const DEFAULT_UI_TEXTS: Record<string, string> = Object.fromEntries(
  Object.values(UI_TEXT_GROUPS).flatMap((g) =>
    Object.entries(g.texts).map(([key, { value }]) => [key, value])
  )
);

export type UiTextKey = keyof typeof DEFAULT_UI_TEXTS;

export function isUiTextKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(DEFAULT_UI_TEXTS, key);
}

/** Defaults with the owner's overrides on top. */
export function mergeUiTexts(overrides: unknown): Record<string, string> {
  const merged = { ...DEFAULT_UI_TEXTS };
  if (overrides && typeof overrides === "object") {
    for (const [key, value] of Object.entries(overrides as Record<string, unknown>)) {
      if (isUiTextKey(key) && typeof value === "string" && value.trim()) merged[key] = value;
    }
  }
  return merged;
}

export function fillVars(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

/** Text without the *asterisks* markup, for places that can't show styling. */
export function plainText(text: string) {
  return text.replace(/\*([^*]+)\*/g, "$1");
}
