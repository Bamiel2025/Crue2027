export interface Scenario {
  id: string;
  name: string;
  T: string;
  wl: number;
  desc: string;
}
export interface Zone {
  id: string;
  name: string;
  seuil: number;
  vuln: number;
  desc: string;
}
export type Niveau = "faible" | "moyen" | "fort" | "critique";

export const SCEN_ALEA: Scenario[] = [
  { id: "etiage", name: "Étiage", T: "—", wl: -0.35, desc: "Débit minimal : la rivière est au plus bas, aucun débordement." },
  { id: "freq", name: "Crue fréquente", T: "2–5 ans", wl: 0.8, desc: "Crue courante (QJ10 ≈ 4,2 m³/s à Aubagne). Elle déborde localement sur ses berges." },
  { id: "dec", name: "Crue décennale", T: "10 ans", wl: 2.0, desc: "Crue modérée : les premières habitations en zone inondable sont touchées." },
  { id: "cent", name: "Crue centennale", T: "100 ans", wl: 4.5, desc: "Crue de référence du PPRI. Le collège se retrouve dans la zone inondée." },
  { id: "rec2024", name: "Crue record 2024", T: "≈ 50–100 ans", wl: 6.0, desc: "Record instantané de 77 m³/s le 08/10/2024 (tempête Kirk). Inondation généralisée." },
];

export const ZONES: Zone[] = [
  { id: "gymnase", name: "Gymnase (à côté du collège)", seuil: 0.4, vuln: 3, desc: "Bâtiment sportif bas et exposé près de la rivière : enjeu collectif important." },
  { id: "college", name: "Collège Ubelka", seuil: 1.2, vuln: 4, desc: "Établissement scolaire : de nombreux élèves présents en journée → enjeu très fort." },
  { id: "maisons", name: "Quartier résidentiel (maisons individuelles)", seuil: 0.5, vuln: 4, desc: "Habitations : personnes et biens, caves et rez-de-chaussée exposés." },
  { id: "routes", name: "Routes & ouvrages (ponts)", seuil: 0.3, vuln: 3, desc: "Voies de circulation : coupures, véhicules piégés, secours compliqués." },
  { id: "meandres", name: "Méandres & bancs de sable (zone naturelle)", seuil: 0.05, vuln: 1, desc: "Zone d’expansion naturelle : elle déborde sans enjeu majeur." },
  { id: "champ", name: "Champ agricole en contrebas", seuil: 0.1, vuln: 1, desc: "Terrain agricole : pertes limitées, pas de vies humaines exposées." },
];

export const NIV_RISK: Record<Niveau, { lbl: string; cl: string }> = {
  faible: { lbl: "Faible", cl: "lvl-faible" },
  moyen: { lbl: "Moyen", cl: "lvl-moyen" },
  fort: { lbl: "Fort", cl: "lvl-fort" },
  critique: { lbl: "Critique", cl: "lvl-critique" },
};

export function computeRisk(scenId: string, zoneId: string): Niveau {
  const wl = SCEN_ALEA.find((s) => s.id === scenId)!.wl;
  const z = ZONES.find((zz) => zz.id === zoneId)!;
  const depth = wl - z.seuil;
  if (depth <= 0) return "faible";
  const score = (depth + 0.3) * z.vuln;
  if (score <= 1.5) return "faible";
  if (score <= 4.5) return "moyen";
  if (score <= 10) return "fort";
  return "critique";
}

export const vulnLabel = (v: number) => (v >= 4 ? "très forte" : v === 3 ? "forte" : "faible");
