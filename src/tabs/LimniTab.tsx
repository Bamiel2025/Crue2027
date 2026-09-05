import { useEffect, useMemo, useState } from "react";
import CarteBassin from "../components/CarteBassin";
import Limnigramme, { type SerieAffichee } from "../components/Limnigramme";
import { Etete, Icone, ICONES } from "../components/ui";
import {
  EVENTS,
  STATIONS,
  type EventId,
  type StationId,
  calculerStats,
  dateAt,
  eventById,
  fmtDate,
  fmtDateHeure,
  fmtDuree,
  fmtHeure,
  fr,
  genererSerie,
  serieToCsv,
  stationById,
} from "../data/hydro";
import { cn } from "../utils/cn";

interface Props {
  valide: boolean;
  reussies: string[];
  onReussite: (id: string) => void;
  onValide: () => void;
  toast: (m: string) => void;
  reflexe: string;
  setReflexe: (v: string) => void;
}

/* ------------- questions (calculées sur les données) ------------- */
interface Question {
  id: string;
  ev: EventId;
  st: StationId;
  compare?: boolean;
  q: string;
  type: "num" | "qcm";
  unite?: string;
  attendu?: number;
  tol?: number;
  options?: string[];
  ok?: number;
  expl: string;
  aide: string;
}

function construireQuestions(): Question[] {
  const kirk = eventById("kirk2024");
  const monica = eventById("monica2024");
  const sAub = stationById("aubagne");
  const kAub = calculerStats(genererSerie(kirk, "aubagne"), sAub.seuils.debordement);
  const kZac = calculerStats(genererSerie(kirk, "stzac"), 1.1);
  const mAub = calculerStats(genererSerie(monica, "aubagne"), sAub.seuils.debordement);
  const heurePicAub = dateAt(kirk, kAub.tPic).getHours() + dateAt(kirk, kAub.tPic).getMinutes() / 60;
  const lag = kAub.tPic - kZac.tPic;
  return [
    {
      id: "q1",
      ev: "kirk2024",
      st: "aubagne",
      type: "num",
      unite: "m",
      q: "Crue du 8 octobre 2024 à Aubagne : quelle est la hauteur d’eau maximale (le pic) ?",
      attendu: kAub.pic,
      tol: 0.15,
      expl: `Le pic atteint ${fr(kAub.pic)} m : c’est le sommet de la courbe. Lis sa valeur sur l’axe vertical (survole la courbe pour t’aider).`,
      aide: "Survole le sommet de la courbe : l’infobulle donne la hauteur exacte.",
    },
    {
      id: "q2",
      ev: "kirk2024",
      st: "aubagne",
      type: "num",
      unite: "h (heure de la journée, ex. 14,5 pour 14h30)",
      q: "À quelle heure du 8 octobre 2024 le pic de crue passe-t-il à Aubagne ?",
      attendu: heurePicAub,
      tol: 0.75,
      expl: `Le pic passe vers ${fmtHeure(dateAt(kirk, kAub.tPic))} le 8 octobre, quelques heures après les pluies les plus intenses (vers ${fmtHeure(dateAt(kirk, 15.5))}).`,
      aide: "Repère le sommet de la courbe puis lis l’heure sur l’axe horizontal.",
    },
    {
      id: "q3",
      ev: "kirk2024",
      st: "aubagne",
      type: "num",
      unite: "heures",
      q: "Toujours à Aubagne le 8 octobre 2024 : combien de temps s’écoule entre le début de la montée des eaux et le pic (temps de montée) ?",
      attendu: kAub.tempsMontee,
      tol: 2,
      expl: `La montée démarre vers ${fmtHeure(dateAt(kirk, kAub.tDebut))} et le pic passe à ${fmtHeure(dateAt(kirk, kAub.tPic))} : temps de montée ≈ ${fmtDuree(kAub.tempsMontee)}. Pour une rivière de 48 km, c’est très rapide : on parle de crue éclair.`,
      aide: "Active l’outil de mesure 📏 : clique au pied de la montée (A) puis au sommet (B). Δt est le temps de montée.",
    },
    {
      id: "q4",
      ev: "kirk2024",
      st: "stzac",
      compare: true,
      type: "qcm",
      q: `Compare les stations : le pic passe à Saint-Zacharie (amont) puis à Aubagne (aval, 21 km plus loin). Combien de temps met l’onde de crue pour parcourir cette distance ?`,
      options: [`environ ${fmtDuree(Math.round(lag * 4) / 4)}`, "environ 12 h", "environ 30 min", "elle arrive en même temps partout"],
      ok: 0,
      expl: `Pic à Saint-Zacharie vers ${fmtHeure(dateAt(kirk, kZac.tPic))}, à Aubagne vers ${fmtHeure(dateAt(kirk, kAub.tPic))} : soit ≈ ${fmtDuree(lag)} pour 21 km (≈ ${fr(21 / lag, 1)} km/h). Ce décalage est précieux : il donne le temps d’alerter l’aval.`,
      aide: "En mode comparaison, survole les deux sommets et note les heures.",
    },
    {
      id: "q5",
      ev: "monica2024",
      st: "aubagne",
      type: "qcm",
      q: "Compare la crue du 10 mars 2024 (Monica) à celle du 8 octobre 2024 (Kirk), à Aubagne. Quelle affirmation est correcte ?",
      options: [
        "Monica monte plus vite mais moins haut que Kirk",
        "Monica monte plus lentement, moins haut, mais dure beaucoup plus longtemps",
        "Monica est plus haute et plus rapide que Kirk",
        "Les deux crues sont identiques",
      ],
      ok: 1,
      expl: `Monica : pic ${fr(mAub.pic)} m, temps de montée ≈ ${fmtDuree(mAub.tempsMontee)}, décrue étalée sur plus d’une journée. Kirk : pic ${fr(kAub.pic)} m en ≈ ${fmtDuree(kAub.tempsMontee)}. Une pluie longue et modérée donne une crue lente et volumineuse ; un orage intense donne une crue éclair.`,
      aide: "Compare la forme des deux courbes : pente de montée, hauteur du pic, largeur de la « bosse ».",
    },
    {
      id: "q6",
      ev: "etiage2022",
      st: "aubagne",
      type: "qcm",
      q: "En juillet 2022 à Aubagne, la hauteur d’eau oscille très légèrement chaque jour. De quel ordre de grandeur est cette variation ?",
      options: ["environ 1 m", "environ 30 cm", "environ 2 à 3 cm", "aucune variation, la courbe est parfaitement plate"],
      ok: 2,
      expl: "Regarde l’axe vertical : il est gradué en centimètres ! La variation jour/nuit est d’environ 2 cm, liée à l’évapotranspiration de la végétation des berges. Attention aux échelles : un graphique « mouvementé » peut représenter de toutes petites variations.",
      aide: "Lis bien les graduations de l’axe vertical : l’échelle s’adapte automatiquement.",
    },
    {
      id: "q7",
      ev: "kirk2024",
      st: "aubagne",
      type: "qcm",
      q: "Sur le limnigramme du 8 octobre 2024, pourquoi la pluie la plus intense (vers 3h du matin) précède-t-elle le pic de crue de plusieurs heures ?",
      options: [
        "Le capteur met du temps à se réveiller",
        "L’eau de pluie doit d’abord ruisseler sur les versants puis s’écouler dans le lit jusqu’à la station",
        "La pluie tombe uniquement en mer",
        "C’est une erreur de mesure",
      ],
      ok: 1,
      expl: "Entre la pluie et la crue, il y a le temps de ruissellement sur le bassin et le temps d’écoulement dans la rivière : c’est le temps de réponse du bassin versant (quelques heures ici). C’est aussi le temps disponible pour la vigilance.",
      aide: "Compare la position des barres de pluie (en haut) et celle du sommet de la courbe.",
    },
  ];
}

function Toggle({ on, set, label, ico }: { on: boolean; set: (v: boolean) => void; label: string; ico?: string | string[] }) {
  return (
    <button
      type="button"
      onClick={() => set(!on)}
      aria-pressed={on}
      className={cn(
        "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-[0.78rem] font-semibold transition",
        on ? "border-bleu-fonce bg-bleu text-white" : "border-[var(--filet-fort)] bg-carte text-encre-2 hover:border-bleu hover:text-encre",
      )}
    >
      {ico && <Icone d={ico} className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

const parseNum = (s: string) => {
  const v = parseFloat(s.replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(v) ? v : null;
};

export default function LimniTab({ valide, reussies, onReussite, onValide, toast, reflexe, setReflexe }: Props) {
  const [evId, setEvId] = useState<EventId>("kirk2024");
  const [stId, setStId] = useState<StationId>("aubagne");
  const [compare, setCompare] = useState(false);
  const [pluie, setPluie] = useState(true);
  const [seuils, setSeuils] = useState(true);
  const [points, setPoints] = useState(false);
  const [pic, setPic] = useState(false);
  const [mesure, setMesure] = useState(false);
  const [reveler, setReveler] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [saisie, setSaisie] = useState("");
  const [choix, setChoix] = useState<number | null>(null);
  const [fb, setFb] = useState<{ ok: boolean; txt: string } | null>(null);

  const ev = eventById(evId);
  const questions = useMemo(construireQuestions, []);

  useEffect(() => {
    if (!ev.stationsDisponibles.includes(stId)) setStId(ev.stationsDisponibles[ev.stationsDisponibles.length - 1]);
  }, [ev, stId]);

  const series: SerieAffichee[] = useMemo(() => {
    if (compare) {
      const ordre = [stId, ...ev.stationsDisponibles.filter((s) => s !== stId && s !== "stpons")];
      return ordre.map((id) => ({ station: stationById(id), pts: genererSerie(ev, id) }));
    }
    return [{ station: stationById(stId), pts: genererSerie(ev, stId) }];
  }, [ev, stId, compare]);

  const station = stationById(stId);
  const stats = useMemo(() => calculerStats(series[0].pts, station.seuils.debordement), [series, station]);

  const propagation = useMemo(() => {
    if (ev.type !== "crue") return [];
    const rows = ev.stationsDisponibles
      .filter((id) => id !== "stpons")
      .map((id) => {
        const s = stationById(id);
        const st = calculerStats(genererSerie(ev, id), s.seuils.debordement);
        return { s, st };
      })
      .sort((a, b) => a.s.pk - b.s.pk);
    return rows.map((r, i) => {
      const prev = rows[i - 1];
      const lag = prev ? r.st.tPic - prev.st.tPic : 0;
      const dist = prev ? r.s.pk - prev.s.pk : 0;
      return { ...r, lag, dist, vitesse: lag > 0 ? dist / lag : null };
    });
  }, [ev]);

  const comparaisonCrues = useMemo(
    () =>
      EVENTS.filter((e) => e.type === "crue").map((e) => {
        const s = stationById("aubagne");
        return { e, st: calculerStats(genererSerie(e, "aubagne"), s.seuils.debordement) };
      }),
    [],
  );

  const q = questions[qIdx];
  const dejaOk = reussies.includes(q.id);
  const nbOk = reussies.filter((id) => questions.some((qq) => qq.id === id)).length;

  useEffect(() => {
    if (nbOk >= 4 && !valide) onValide();
  }, [nbOk, valide, onValide]);

  const afficherCourbeQuestion = () => {
    setEvId(q.ev);
    setStId(q.st);
    setCompare(!!q.compare);
    setPic(false);
    document.getElementById("graphique-limni")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const verifier = () => {
    let ok = false;
    if (q.type === "num") {
      const v = parseNum(saisie);
      if (v == null) {
        setFb({ ok: false, txt: "Entre une valeur numérique (ex. 2,4)." });
        return;
      }
      ok = Math.abs(v - (q.attendu ?? 0)) <= (q.tol ?? 0);
    } else {
      if (choix == null) {
        setFb({ ok: false, txt: "Choisis une réponse." });
        return;
      }
      ok = choix === q.ok;
    }
    if (ok) {
      setFb({ ok: true, txt: q.expl });
      if (!dejaOk) {
        onReussite(q.id);
        toast("Bonne réponse !");
      }
    } else {
      setFb({ ok: false, txt: `Pas tout à fait. ${q.aide}` });
    }
  };

  const suivante = (d: number) => {
    setQIdx((i) => (i + d + questions.length) % questions.length);
    setSaisie("");
    setChoix(null);
    setFb(null);
  };

  const exporter = () => {
    const csv = serieToCsv(ev, station, series[0].pts);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `huveaune_${ev.id}_${station.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Fichier CSV téléchargé — ouvre-le dans un tableur !");
  };

  return (
    <section className="etape">
      <Etete num="Étape 2 · Analyser" titre="Lire un limnigramme — les données des stations locales" valide={valide}>
        <p className="legende m-0">
          Les courbes ci-dessous proviennent des stations du bassin versant recensées par l’observatoire{" "}
          <a href="https://edumed.unice.fr/data-center/hydro/hydro-data/bv-huveaune.php" target="_blank" rel="noopener noreferrer" className="font-semibold text-bleu">
            EduMed-Obs · HYDRO Huveaune
          </a>{" "}
          (capteurs des collèges Ubelka et des 16 Fontaines, sonde du CDSC13, stations Vigicrues de Roquevaire et d’Aubagne).
        </p>
      </Etete>

      {/* ----- notions ----- */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="boite">
          <h3>Qu’est-ce qu’un limnigramme ?</h3>
          <p className="legende m-0">
            La courbe de la <b>hauteur d’eau</b> (m) mesurée en un point de la rivière, en fonction du <b>temps</b>. On y lit le <b>pic</b>, le <b>temps de montée</b>, la
            <b> vitesse de montée</b> et la durée de la <b>décrue</b>.
          </p>
        </div>
        <div className="boite">
          <h3>Comment mesure-t-on ?</h3>
          <p className="legende m-0">
            Les collèges utilisent des <b>capteurs de pression Sensus-Ultra</b> posés au fond du lit : pression d’eau = pression absolue − pression atmosphérique, convertie en
            mètres d’eau. Vigicrues utilise des <b>radars</b> au-dessus de l’eau.
          </p>
        </div>
        <div className="boite">
          <h3>Et la pluie ?</h3>
          <p className="legende m-0">
            Le <b>hyétogramme</b> (barres bleues en haut, en mm/h) montre quand et combien il a plu. Compare-le à la courbe : il y a toujours un <b>décalage</b> entre la
            pluie et la crue.
          </p>
        </div>
      </div>

      {/* ----- choix de l'épisode ----- */}
      <div className="boite mb-4">
        <h3>1. Choisis un épisode</h3>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {EVENTS.map((e) => {
            const actif = e.id === evId;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => {
                  setEvId(e.id);
                  setPic(false);
                  setReveler(false);
                }}
                className={cn(
                  "rounded-xl border p-3 text-left transition hover:-translate-y-0.5",
                  actif ? "border-bleu bg-bleu/10 shadow-[inset_0_0_0_1.5px_var(--color-bleu)]" : "border-[var(--filet)] bg-carte hover:border-bleu",
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-mono text-[0.66rem] font-bold uppercase",
                      e.type === "crue" ? "bg-alerte/15 text-[#a3521b]" : "bg-sable/60 text-[#6b5412]",
                    )}
                  >
                    {e.type === "crue" ? "Crue" : "Étiage"}
                  </span>
                  <span className="font-mono text-[0.68rem] text-encre-2">T {e.T}</span>
                </div>
                <p className="m-0 font-titres text-[1rem] font-bold leading-tight">{e.titre}</p>
                <p className="legende m-0 mt-0.5">{e.sousTitre}</p>
                <p className="m-0 mt-1 font-mono text-[0.68rem] text-encre-2">
                  {fmtDate(e.debut)} → {fmtDate(dateAt(e, e.duree))} · {e.duree} h · {e.stationsDisponibles.length} stations
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ----- station + graphique ----- */}
      <div id="graphique-limni" className="mb-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-3">
          <div className="boite">
            <h3>2. Choisis une station</h3>
            <CarteBassin actives={compare ? series.map((s) => s.station.id) : [stId]} disponibles={ev.stationsDisponibles} onSelect={(id) => setStId(id)} compact />
            <div className="mt-2 flex flex-col gap-1.5">
              {STATIONS.map((s) => {
                const dispo = ev.stationsDisponibles.includes(s.id);
                const actif = s.id === stId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!dispo}
                    onClick={() => setStId(s.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[0.8rem] transition disabled:cursor-not-allowed disabled:opacity-40",
                      actif ? "border-transparent text-white" : "border-[var(--filet)] bg-carte hover:border-bleu",
                    )}
                    style={actif ? { background: s.couleur } : undefined}
                  >
                    <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: actif ? "#fff" : s.couleur }} />
                    <span className="flex-1">
                      <b>{s.nom}</b> <span className={actif ? "text-white/80" : "text-encre-2"}>· {s.reseau}</span>
                    </span>
                    <span className={cn("font-mono text-[0.68rem]", actif ? "text-white/80" : "text-encre-2")}>km {s.pk}</span>
                  </button>
                );
              })}
            </div>
            <p className="legende m-0 mt-2 text-[0.72rem]">Les stations grisées n’ont pas de données pour cet épisode (capteurs installés plus tard ou hors service).</p>
          </div>
          <div className="boite bg-carte-chaude">
            <h3 className="!text-[0.95rem]">Fiche station</h3>
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.78rem]">
              <dt className="font-semibold text-encre-2">Lieu</dt>
              <dd className="m-0">{station.lieu}</dd>
              <dt className="font-semibold text-encre-2">Capteur</dt>
              <dd className="m-0">{station.capteur}</dd>
              <dt className="font-semibold text-encre-2">Opéré par</dt>
              <dd className="m-0">{station.operateur}</dd>
              <dt className="font-semibold text-encre-2">Bassin drainé</dt>
              <dd className="m-0">{station.bassin} km² {station.affluent && `(${station.affluent})`}</dd>
              <dt className="font-semibold text-encre-2">Altitude</dt>
              <dd className="m-0">{station.altitude} m · km {station.pk} depuis la source</dd>
              <dt className="font-semibold text-encre-2">Données</dt>
              <dd className="m-0">{station.periode}</dd>
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="boite">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="!mb-0">
                3. Le limnigramme — <span style={{ color: station.couleur }}>{compare ? "comparaison des stations" : station.nom}</span>
              </h3>
              <span className="font-mono text-[0.72rem] text-encre-2">
                {fmtDateHeure(ev.debut)} → {fmtDateHeure(dateAt(ev, ev.duree))}
              </span>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <Toggle on={pluie} set={setPluie} label="Pluie" ico={ICONES.pluie} />
              <Toggle on={seuils} set={setSeuils} label="Seuils / débordement" />
              <Toggle on={points} set={setPoints} label="Points de mesure" />
              <Toggle on={pic} set={setPic} label="Marquer le pic" ico={ICONES.oeil} />
              <Toggle on={mesure} set={setMesure} label="Outil de mesure" ico={ICONES.regle} />
              {ev.type === "crue" && ev.stationsDisponibles.length > 2 && <Toggle on={compare} set={setCompare} label="Comparer les stations (amont → aval)" />}
            </div>
            <Limnigramme ev={ev} series={series} montrerPluie={pluie} montrerSeuils={seuils && !compare} montrerPoints={points} modeMesure={mesure} montrerPic={pic} />
            {compare && (
              <div className="mt-2 flex flex-wrap gap-3 text-[0.78rem]">
                {series.map((s) => (
                  <span key={s.station.id} className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-1 w-5 rounded-full" style={{ background: s.station.couleur }} /> {s.station.nom} (km {s.station.pk})
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-[var(--filet)] pt-3">
              <p className="legende m-0">
                Source : reconstitution pédagogique calée sur les données{" "}
                <a href="https://edumed.unice.fr/data-center/hydro/hydro-data/bv-huveaune.php" target="_blank" rel="noopener noreferrer" className="text-bleu">
                  EduMed-Obs
                </a>{" "}
                / Vigicrues · pas de temps 15 min.
              </p>
              <button type="button" className="btn btn--fantome btn--petit" onClick={exporter}>
                <Icone d={ICONES.download} className="h-4 w-4" /> Exporter en CSV
              </button>
            </div>
          </div>

          {/* contexte + fiche */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="boite">
              <h3 className="!text-[0.95rem]">Le contexte météo</h3>
              <p className="legende m-0">{ev.contexte}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ev.chiffres.map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="boite">
              <div className="flex items-center justify-between gap-2">
                <h3 className="!mb-0 !text-[0.95rem]">Fiche d’identité — {station.nom}</h3>
                <button type="button" className="btn btn--fantome btn--petit" onClick={() => setReveler((v) => !v)}>
                  <Icone d={ICONES.oeil} className="h-4 w-4" /> {reveler ? "Masquer" : "Révéler"}
                </button>
              </div>
              <p className="legende m-0 mb-2 text-[0.72rem]">Essaie d’abord de lire ces valeurs sur le graphique, puis vérifie.</p>
              <table className="w-full text-[0.8rem]">
                <tbody>
                  {[
                    ["Hauteur de base (avant)", `${fr(stats.base)} m`],
                    ["Hauteur maximale (pic)", `${fr(stats.pic)} m`],
                    ["Heure du pic", fmtDateHeure(dateAt(ev, stats.tPic))],
                    ["Temps de montée", ev.type === "crue" ? fmtDuree(stats.tempsMontee) : "—"],
                    ["Vitesse de montée max", ev.type === "crue" ? `${fr(stats.vitesseMax)} m/h (${Math.round(stats.vitesseMax * 100)} cm/h)` : "—"],
                    ["Durée de débordement", stats.dureeDebordement > 0 ? fmtDuree(stats.dureeDebordement) : "aucun débordement"],
                    ["Retour proche de la base", stats.tRetourBase != null && ev.type === "crue" ? `${fmtDuree(stats.tRetourBase - stats.tPic)} après le pic` : "—"],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b border-dashed border-[var(--filet)] last:border-0">
                      <td className="py-1 pr-2 text-encre-2">{k}</td>
                      <td className={cn("py-1 text-right font-mono font-bold transition", !reveler && "select-none blur-[5px]")}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ----- propagation ----- */}
      {ev.type === "crue" && propagation.length > 1 && (
        <div className="boite mb-4">
          <h3>4. L’onde de crue se propage de l’amont vers l’aval</h3>
          <p className="legende m-0 mb-2">
            Pour le même épisode, le pic passe d’abord aux stations amont, puis aux stations aval. Ce délai est le <b>temps de propagation</b> : c’est lui qui permet aux
            services de prévision d’alerter Aubagne et Marseille avant l’arrivée de l’eau.
          </p>
          <div className="overflow-x-auto">
            <table className="tabrisque">
              <thead>
                <tr>
                  <th>Station (amont → aval)</th>
                  <th>km</th>
                  <th>Pic (m)</th>
                  <th>Heure du pic</th>
                  <th>Délai depuis la station précédente</th>
                  <th>Vitesse de l’onde</th>
                </tr>
              </thead>
              <tbody>
                {propagation.map((r) => (
                  <tr key={r.s.id}>
                    <td>
                      <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: r.s.couleur }} />
                      {r.s.nom}
                    </td>
                    <td className="font-mono">{r.s.pk}</td>
                    <td className="font-mono">{fr(r.st.pic)}</td>
                    <td className="font-mono">{fmtHeure(dateAt(ev, r.st.tPic))}</td>
                    <td className="font-mono">{r.lag > 0 ? `+ ${fmtDuree(r.lag)}` : "—"}</td>
                    <td className="font-mono">{r.vitesse ? `≈ ${fr(r.vitesse, 1)} km/h` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="astuce mt-2">
            💡 Active « Comparer les stations » au-dessus du graphique pour superposer les courbes : les pics se décalent vers la droite quand on descend la rivière, et la
            hauteur augmente car les affluents apportent de l’eau.
          </p>
        </div>
      )}

      {/* ----- comparaison des crues ----- */}
      <div className="boite mb-4">
        <h3>5. Trois crues, trois « signatures » — station d’Aubagne</h3>
        <div className="overflow-x-auto">
          <table className="tabrisque">
            <thead>
              <tr>
                <th>Épisode</th>
                <th>Type de pluie</th>
                <th>Pic</th>
                <th>Temps de montée</th>
                <th>Vitesse max</th>
                <th>Débordement</th>
                <th>Période de retour</th>
              </tr>
            </thead>
            <tbody>
              {comparaisonCrues.map(({ e, st }) => (
                <tr key={e.id} className={cn(e.id === evId && "bg-bleu/10")}>
                  <td>
                    <button type="button" className="text-left font-semibold text-bleu underline-offset-2 hover:underline" onClick={() => { setEvId(e.id); setStId("aubagne"); setCompare(false); }}>
                      {e.titre}
                    </button>
                  </td>
                  <td className="text-left">{e.id === "kirk2024" ? "orage intense, court" : e.id === "monica2024" ? "pluie longue, modérée" : "pluies soutenues"}</td>
                  <td className="font-mono">{fr(st.pic)} m</td>
                  <td className="font-mono">{fmtDuree(st.tempsMontee)}</td>
                  <td className="font-mono">{Math.round(st.vitesseMax * 100)} cm/h</td>
                  <td className="font-mono">{st.dureeDebordement > 0 ? fmtDuree(st.dureeDebordement) : "non"}</td>
                  <td className="font-mono">{e.T}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="legende m-0 mt-2">
          Plus une crue est <b>rare</b> (période de retour longue), plus elle est <b>intense</b>. Mais la forme de la courbe dépend aussi du <b>type de pluie</b> : orage bref →
          crue éclair ; pluie longue → crue lente et volumineuse.
        </p>
      </div>

      {/* ----- questions ----- */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="boite">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="!mb-0">6. Questions d’analyse</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-encre px-3 py-1 font-mono text-[0.78rem] font-bold text-carte">
              {nbOk} / {questions.length} réussies {nbOk >= 4 && "· étape validée ✓"}
            </span>
          </div>
          <div className="mb-3 flex flex-wrap gap-1">
            {questions.map((qq, i) => (
              <button
                key={qq.id}
                type="button"
                onClick={() => {
                  setQIdx(i);
                  setSaisie("");
                  setChoix(null);
                  setFb(null);
                }}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full border font-mono text-[0.75rem] font-bold transition",
                  i === qIdx ? "border-encre bg-encre text-carte" : reussies.includes(qq.id) ? "border-vert bg-vert/15 text-vert" : "border-[var(--filet-fort)] bg-carte text-encre-2",
                )}
                aria-label={`Question ${i + 1}`}
              >
                {reussies.includes(qq.id) && i !== qIdx ? "✓" : i + 1}
              </button>
            ))}
          </div>
          <p className="m-0 mb-1 text-[0.95rem] font-semibold">
            Question {qIdx + 1} — {q.q}
          </p>
          <button type="button" className="mb-3 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-bleu hover:underline" onClick={afficherCourbeQuestion}>
            <Icone d={ICONES.courbe} className="h-3.5 w-3.5" /> Afficher la courbe concernée ({eventById(q.ev).titre} · {stationById(q.st).nom}
            {q.compare ? " + comparaison" : ""})
          </button>
          {q.type === "num" ? (
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[180px]">
                <label className="champ !mt-0" htmlFor="rep-num">
                  Ta réponse ({q.unite})
                </label>
                <input id="rep-num" type="text" inputMode="decimal" value={saisie} onChange={(e) => setSaisie(e.target.value)} placeholder="ex. 2,4" onKeyDown={(e) => e.key === "Enter" && verifier()} />
              </div>
              <button type="button" className="btn btn--action" onClick={verifier}>
                Vérifier
              </button>
            </div>
          ) : (
            <>
              <div className="choix-btn">
                {q.options!.map((o, i) => (
                  <button key={o} type="button" className={cn(choix === i && "sel")} onClick={() => setChoix(i)}>
                    {o}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn--action mt-3" onClick={verifier}>
                Vérifier
              </button>
            </>
          )}
          <div className="mt-3 min-h-[56px]" aria-live="polite">
            {fb && <div className={fb.ok ? "succes-bloc" : "err-bloc"}>{fb.ok ? "✅ " : "❌ "}{fb.txt}</div>}
            {!fb && dejaOk && <div className="succes-bloc">✅ Déjà réussie. {q.expl}</div>}
          </div>
          <div className="mt-3 flex justify-between">
            <button type="button" className="btn btn--fantome btn--petit" onClick={() => suivante(-1)}>
              ◀ Précédente
            </button>
            <button type="button" className="btn btn--fantome btn--petit" onClick={() => suivante(1)}>
              Suivante ▶
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="boite">
            <h3>Des mesures faites par des collégiens</h3>
            <p className="legende m-0">
              Les capteurs <b>Sensus-Ultra</b> installés par les élèves d’Auriol (collège Ubelka) et de Saint-Zacharie (collège des 16 Fontaines) enregistrent une
              mesure toutes les quelques minutes. Les données sont récupérées, traitées dans un tableur (pression → hauteur d’eau) puis publiées sur EduMed-Obs pour toutes les
              classes.
            </p>
            <div className="note mt-2">
              Le <b>8 octobre 2024</b>, la pointe instantanée de 77 m³/s à Aubagne est un record depuis le début des mesures (1997). Le <b>10 mars 2024</b>, c’est le débit
              moyen journalier (26,6 m³/s) qui battait le record.
            </div>
          </div>
          <div className="boite">
            <h3>🚨 Question réflexe</h3>
            <p className="legende m-0 mb-1">
              Pourquoi la hauteur d’eau peut-elle monter aussi vite dans une petite rivière comme l’Huveaune ? (2-3 lignes — pense aux pentes, aux sols imperméables des villes,
              à la taille du bassin)
            </p>
            <textarea rows={4} value={reflexe} onChange={(e) => setReflexe(e.target.value)} placeholder="Ta réponse… (enregistrée automatiquement, pas de note automatique)" />
            <p className="legende m-0 mt-1 text-[0.72rem]">{reflexe.length > 0 ? `${reflexe.trim().split(/\s+/).filter(Boolean).length} mots — sauvegardé` : "Rien d’écrit pour l’instant."}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
