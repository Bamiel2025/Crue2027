/* ------------------------------------------------------------------
   Données hydrologiques — bassin versant de l'Huveaune
   Stations locales référencées sur le portail EduMed-Obs :
   https://edumed.unice.fr/data-center/hydro/hydro-data/bv-huveaune.php
   (capteurs Sensus-Ultra opérés par les collèges + réseau Vigicrues)
   Les séries ci-dessous sont des reconstitutions pédagogiques
   calées sur les valeurs publiées (pics, dates, débits records).
------------------------------------------------------------------- */

export type StationId = "stzac" | "auriol" | "roquevaire" | "stpons" | "aubagne";

export interface Station {
  id: StationId;
  nom: string;
  lieu: string;
  reseau: "EduMed" | "Vigicrues";
  capteur: string;
  operateur: string;
  pk: number; // km depuis la source
  altitude: number; // m
  bassin: number; // km² drainés
  affluent?: string;
  seuils: { debordement: number; jaune?: number; orange?: number; rouge?: number };
  couleur: string;
  periode: string;
}

export const STATIONS: Station[] = [
  {
    id: "stzac",
    nom: "Saint-Zacharie",
    lieu: "collège des 16 Fontaines (Var)",
    reseau: "EduMed",
    capteur: "Sensus-Ultra (Reefnet) — pression / température",
    operateur: "élèves du collège des 16 Fontaines",
    pk: 6,
    altitude: 265,
    bassin: 58,
    seuils: { debordement: 1.1 },
    couleur: "#2F9ECF",
    periode: "oct. 2024 → avr. 2025",
  },
  {
    id: "auriol",
    nom: "Auriol",
    lieu: "collège Ubelka",
    reseau: "EduMed",
    capteur: "Sensus-Ultra (Reefnet) — pression / température",
    operateur: "élèves du collège Ubelka",
    pk: 13,
    altitude: 210,
    bassin: 112,
    seuils: { debordement: 1.4 },
    couleur: "#1B6CA8",
    periode: "déc. 2021 → juin 2024",
  },
  {
    id: "roquevaire",
    nom: "Roquevaire",
    lieu: "Pont de l’Étoile — station Y441403001",
    reseau: "Vigicrues",
    capteur: "limnimètre radar + échelle limnimétrique",
    operateur: "SPC Méditerranée-Est",
    pk: 18,
    altitude: 160,
    bassin: 150,
    seuils: { debordement: 1.8, jaune: 1.2, orange: 2.0, rouge: 3.0 },
    couleur: "#6C4AB6",
    periode: "depuis 1997",
  },
  {
    id: "stpons",
    nom: "Saint-Pons (Gémenos)",
    lieu: "vallon de Saint-Pons — sonde CTD-Diver",
    reseau: "EduMed",
    capteur: "CTD-Diver (CDSC13) — pression, température, conductivité",
    operateur: "Comité départemental de spéléologie 13",
    pk: 22,
    altitude: 205,
    bassin: 24,
    affluent: "la Fauge (affluent rive gauche)",
    seuils: { debordement: 0.9 },
    couleur: "#2F7D5B",
    periode: "2021 → 2025",
  },
  {
    id: "aubagne",
    nom: "Aubagne",
    lieu: "Le Charrel — station Y442404001",
    reseau: "Vigicrues",
    capteur: "limnimètre radar + échelle limnimétrique",
    operateur: "SPC Méditerranée-Est",
    pk: 27,
    altitude: 95,
    bassin: 195,
    seuils: { debordement: 2.2, jaune: 1.5, orange: 2.5, rouge: 3.5 },
    couleur: "#D96C2C",
    periode: "depuis 1997",
  },
];

export const stationById = (id: StationId) => STATIONS.find((s) => s.id === id)!;

/* ---------------- épisodes ---------------- */
export type EventId = "kirk2024" | "monica2024" | "dec2019" | "etiage2022";

interface Pulse {
  t0: number; // début de montée (h depuis le début de la fenêtre)
  tp: number; // heure du pic
  amp: number; // amplitude au-dessus de la base (m)
  tau: number; // constante de décrue (h)
}

interface SerieParams {
  base: number;
  pulses: Pulse[];
  diurne?: number; // amplitude d'oscillation journalière (étiage)
  bruit: number;
}

export interface HydroEvent {
  id: EventId;
  titre: string;
  sousTitre: string;
  debut: Date; // début de la fenêtre
  duree: number; // heures
  type: "crue" | "etiage";
  T: string; // période de retour
  contexte: string;
  chiffres: string[];
  pluieMax: number; // mm/h max affiché (échelle)
  pluie: (t: number) => number; // mm/h à l'heure t (entier)
  series: Partial<Record<StationId, SerieParams>>;
  stationsDisponibles: StationId[];
}

const d = (iso: string) => new Date(iso);

/* pluie : somme de "cellules" gaussiennes */
const cell = (t: number, c: number, w: number, a: number) =>
  a * Math.exp(-((t - c) * (t - c)) / (2 * w * w));

export const EVENTS: HydroEvent[] = [
  {
    id: "kirk2024",
    titre: "Crue du 8 octobre 2024",
    sousTitre: "Tempête Kirk — pointe record de débit",
    debut: d("2024-10-07T12:00:00"),
    duree: 48,
    type: "crue",
    T: "≈ 50 à 100 ans",
    contexte:
      "Après un mois de septembre très humide (sols déjà saturés), la tempête Kirk apporte des pluies intenses dans la nuit du 7 au 8 octobre : 120 à 180 mm en moins de 12 h sur les reliefs de la Sainte-Baume. L’Huveaune réagit en quelques heures : la pointe instantanée à Aubagne atteint 77 m³/s, un record depuis 1997.",
    chiffres: ["77 m³/s de pointe à Aubagne", "≈ 150 mm en 12 h sur la Sainte-Baume", "Vigilance orange crues"],
    pluieMax: 32,
    pluie: (t) => cell(t, 10, 1.6, 14) + cell(t, 15.5, 2.2, 30) + cell(t, 20, 1.3, 9) + cell(t, 30, 2.5, 3),
    series: {
      stzac: { base: 0.18, pulses: [{ t0: 11, tp: 17.5, amp: 2.05, tau: 7 }, { t0: 19, tp: 21.5, amp: 0.45, tau: 6 }], bruit: 0.012 },
      auriol: { base: 0.22, pulses: [{ t0: 11.5, tp: 18.5, amp: 2.55, tau: 8 }, { t0: 20, tp: 22.5, amp: 0.5, tau: 7 }], bruit: 0.012 },
      roquevaire: { base: 0.3, pulses: [{ t0: 12, tp: 19.5, amp: 2.55, tau: 9 }, { t0: 20.5, tp: 23.5, amp: 0.5, tau: 8 }], bruit: 0.01 },
      stpons: { base: 0.12, pulses: [{ t0: 12, tp: 16.5, amp: 1.25, tau: 5 }, { t0: 19, tp: 21, amp: 0.3, tau: 5 }], bruit: 0.012 },
      aubagne: { base: 0.42, pulses: [{ t0: 12.5, tp: 21, amp: 2.9, tau: 10.5 }, { t0: 22, tp: 25, amp: 0.45, tau: 9 }], bruit: 0.01 },
    },
    stationsDisponibles: ["stzac", "auriol", "roquevaire", "stpons", "aubagne"],
  },
  {
    id: "monica2024",
    titre: "Crue du 10 mars 2024",
    sousTitre: "Tempête Monica — record de débit journalier",
    debut: d("2024-03-09T00:00:00"),
    duree: 72,
    type: "crue",
    T: "≈ 10 à 20 ans",
    contexte:
      "Épisode méditerranéen long et continu : il pleut pendant près de 36 heures sur tout le bassin, avec une intensité modérée. La montée est plus lente que lors d’un orage, mais le volume écoulé est énorme : 26,6 m³/s en moyenne sur la journée du 10 mars, record journalier de la station d’Aubagne.",
    chiffres: ["26,6 m³/s de débit moyen journalier", "≈ 190 mm en 36 h à Auriol", "Vigilance orange crues"],
    pluieMax: 14,
    pluie: (t) =>
      cell(t, 14, 5, 6) + cell(t, 26, 4, 9) + cell(t, 34, 3.5, 12) + cell(t, 42, 3, 6) + cell(t, 50, 3, 2.5),
    series: {
      auriol: { base: 0.3, pulses: [{ t0: 14, tp: 30, amp: 1.05, tau: 12 }, { t0: 30, tp: 38, amp: 1.05, tau: 16 }], bruit: 0.01 },
      roquevaire: { base: 0.36, pulses: [{ t0: 15, tp: 31, amp: 1.05, tau: 13 }, { t0: 31, tp: 39.5, amp: 1.1, tau: 18 }], bruit: 0.01 },
      stpons: { base: 0.15, pulses: [{ t0: 14, tp: 29, amp: 0.55, tau: 10 }, { t0: 30, tp: 37, amp: 0.55, tau: 14 }], bruit: 0.01 },
      aubagne: { base: 0.48, pulses: [{ t0: 16, tp: 32, amp: 1.0, tau: 14 }, { t0: 32, tp: 41, amp: 1.25, tau: 20 }], bruit: 0.01 },
    },
    stationsDisponibles: ["auriol", "roquevaire", "stpons", "aubagne"],
  },
  {
    id: "dec2019",
    titre: "Crue du 1ᵉʳ décembre 2019",
    sousTitre: "Épisode méditerranéen d’automne",
    debut: d("2019-11-30T12:00:00"),
    duree: 48,
    type: "crue",
    T: "≈ 5 à 10 ans",
    contexte:
      "Fin novembre 2019, plusieurs épisodes pluvieux se succèdent sur la Provence. Le 1ᵉʳ décembre, une nouvelle salve de pluies soutenues fait déborder l’Huveaune sur ses berges basses à Roquevaire et la fait frôler le débordement à Aubagne. Une crue « fréquente à décennale », typique de la rivière.",
    chiffres: ["≈ 35 m³/s de pointe à Aubagne", "≈ 90 mm en 10 h", "Vigilance jaune crues"],
    pluieMax: 20,
    pluie: (t) => cell(t, 12, 2.5, 8) + cell(t, 18, 2, 18) + cell(t, 23, 1.5, 6),
    series: {
      roquevaire: { base: 0.34, pulses: [{ t0: 14, tp: 21.5, amp: 1.55, tau: 9 }], bruit: 0.01 },
      aubagne: { base: 0.45, pulses: [{ t0: 15, tp: 23, amp: 1.6, tau: 11 }], bruit: 0.01 },
    },
    stationsDisponibles: ["roquevaire", "aubagne"],
  },
  {
    id: "etiage2022",
    titre: "Étiage de juillet 2022",
    sousTitre: "Sécheresse et canicule — la rivière au plus bas",
    debut: d("2022-07-14T00:00:00"),
    duree: 72,
    type: "etiage",
    T: "—",
    contexte:
      "Été 2022 : aucune pluie significative depuis des semaines, canicule. Le débit de l’Huveaune tombe sous 0,1 m³/s à Aubagne et le lit est à sec par endroits. La hauteur d’eau varie à peine ; on observe un léger cycle jour/nuit lié à l’évapotranspiration de la végétation des berges.",
    chiffres: ["≈ 0,07 m³/s à Aubagne", "0 mm de pluie", "Arrêté sécheresse « crise »"],
    pluieMax: 10,
    pluie: () => 0,
    series: {
      auriol: { base: 0.06, pulses: [], diurne: 0.008, bruit: 0.004 },
      roquevaire: { base: 0.09, pulses: [], diurne: 0.01, bruit: 0.004 },
      stpons: { base: 0.03, pulses: [], diurne: 0.004, bruit: 0.003 },
      aubagne: { base: 0.12, pulses: [], diurne: 0.012, bruit: 0.004 },
    },
    stationsDisponibles: ["auriol", "roquevaire", "stpons", "aubagne"],
  },
];

export const eventById = (id: EventId) => EVENTS.find((e) => e.id === id)!;

/* ---------------- génération des séries ---------------- */
export const DT = 0.25; // pas de temps : 15 min

export interface Point {
  t: number; // heures depuis le début de la fenêtre
  h: number; // hauteur (m)
}

/* bruit déterministe (pseudo-aléatoire reproductible) */
function bruitDet(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}

function pulseValue(p: Pulse, t: number): number {
  if (t < p.t0) return 0;
  if (t <= p.tp) {
    const u = (t - p.t0) / (p.tp - p.t0);
    return (1 - Math.cos(Math.PI * u)) / 2; // montée en S
  }
  const dt = t - p.tp;
  // décrue : plateau très court puis exponentielle
  return Math.exp(-Math.pow(dt / p.tau, 1.15));
}

export function genererSerie(ev: HydroEvent, st: StationId): Point[] {
  const prm = ev.series[st];
  if (!prm) return [];
  const pts: Point[] = [];
  const n = Math.round(ev.duree / DT);
  const seedBase = ev.id.length * 31 + st.length * 7;
  for (let i = 0; i <= n; i++) {
    const t = i * DT;
    let h = prm.base;
    for (const p of prm.pulses) h += p.amp * pulseValue(p, t);
    if (prm.diurne) {
      const hourOfDay = (ev.debut.getHours() + t) % 24;
      h += prm.diurne * Math.cos(((hourOfDay - 6) / 24) * 2 * Math.PI);
    }
    h += prm.bruit * bruitDet(seedBase + i);
    pts.push({ t, h: Math.max(0, +h.toFixed(3)) });
  }
  // léger lissage (3 points) pour arrondir les pics
  return pts.map((p, i) => {
    if (i === 0 || i === pts.length - 1) return p;
    return { t: p.t, h: +((pts[i - 1].h + 2 * p.h + pts[i + 1].h) / 4).toFixed(3) };
  });
}

/* ---------------- statistiques ---------------- */
export interface Stats {
  base: number;
  pic: number;
  tPic: number;
  tDebut: number;
  tempsMontee: number;
  vitesseMax: number; // m/h
  tVitesseMax: number;
  dureeDebordement: number; // heures au-dessus du seuil
  tRetourBase: number | null; // retour sous base + 20 % de l'amplitude
  amplitude: number;
}

export function calculerStats(pts: Point[], seuilDebord: number): Stats {
  if (!pts.length) {
    return { base: 0, pic: 0, tPic: 0, tDebut: 0, tempsMontee: 0, vitesseMax: 0, tVitesseMax: 0, dureeDebordement: 0, tRetourBase: null, amplitude: 0 };
  }
  let pic = -Infinity;
  let tPic = 0;
  for (const p of pts) if (p.h > pic) { pic = p.h; tPic = p.t; }
  // base = médiane des 3 premières heures
  const premiers = pts.filter((p) => p.t <= 3).map((p) => p.h).sort((a, b) => a - b);
  const base = premiers[Math.floor(premiers.length / 2)] ?? pts[0].h;
  const amplitude = pic - base;
  // début de montée : dernier point avant le pic où h <= base + 5 % amplitude
  let tDebut = 0;
  for (const p of pts) {
    if (p.t >= tPic) break;
    if (p.h <= base + 0.05 * amplitude) tDebut = p.t;
  }
  // vitesse max sur une heure glissante
  let vitesseMax = 0;
  let tVitesseMax = 0;
  const stepH = Math.round(1 / DT);
  for (let i = stepH; i < pts.length; i++) {
    const v = pts[i].h - pts[i - stepH].h;
    if (v > vitesseMax) { vitesseMax = v; tVitesseMax = pts[i].t; }
  }
  const dureeDebordement = pts.filter((p) => p.h >= seuilDebord).length * DT;
  let tRetourBase: number | null = null;
  for (const p of pts) {
    if (p.t > tPic && p.h <= base + 0.2 * amplitude) { tRetourBase = p.t; break; }
  }
  return {
    base: +base.toFixed(2),
    pic: +pic.toFixed(2),
    tPic,
    tDebut,
    tempsMontee: +(tPic - tDebut).toFixed(2),
    vitesseMax: +vitesseMax.toFixed(2),
    tVitesseMax,
    dureeDebordement,
    tRetourBase,
    amplitude: +amplitude.toFixed(2),
  };
}

/* ---------------- utilitaires temps ---------------- */
export function dateAt(ev: HydroEvent, t: number): Date {
  return new Date(ev.debut.getTime() + t * 3600 * 1000);
}

const JOURS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export function fmtHeure(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}h${m}`;
}
export function fmtDate(date: Date): string {
  return `${JOURS[date.getDay()]} ${date.getDate()} ${MOIS[date.getMonth()]}`;
}
export function fmtDateHeure(date: Date): string {
  return `${fmtDate(date)} ${fmtHeure(date)}`;
}
export function fmtDuree(h: number): string {
  const H = Math.floor(h);
  const M = Math.round((h - H) * 60);
  if (H === 0) return `${M} min`;
  return M ? `${H} h ${M.toString().padStart(2, "0")}` : `${H} h`;
}
export const fr = (n: number, dec = 2) => n.toLocaleString("fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec });

/* ---------------- export CSV ---------------- */
export function serieToCsv(ev: HydroEvent, st: Station, pts: Point[]): string {
  const lignes = ["date;heure;hauteur_m;pluie_mm_h"];
  for (const p of pts) {
    const dte = dateAt(ev, p.t);
    const dd = `${dte.getFullYear()}-${(dte.getMonth() + 1).toString().padStart(2, "0")}-${dte.getDate().toString().padStart(2, "0")}`;
    lignes.push(`${dd};${fmtHeure(dte)};${p.h.toFixed(3).replace(".", ",")};${ev.pluie(Math.floor(p.t)).toFixed(1).replace(".", ",")}`);
  }
  return `# ${ev.titre} — ${st.nom} (${st.lieu}) — source pédagogique EduMed-Obs / Vigicrues\n` + lignes.join("\n");
}
