import { useCallback, useEffect, useRef, useState } from "react";
import { Icone, ICONES, Modal, Toast } from "./components/ui";
import { LEXIQUE } from "./data/lexique";
import Accueil from "./tabs/Accueil";
import BilanTab from "./tabs/BilanTab";
import LimniTab from "./tabs/LimniTab";
import Modele3D from "./tabs/Modele3D";
import RisqueTab from "./tabs/RisqueTab";
import { cn } from "./utils/cn";

const CLE = "huveaune-crue-v2";
const CODE_BILAN = "2027";

interface Etat {
  courant: number;
  valide: boolean[]; // [limni, risque, bilan]
  bilanDeverrouille: boolean;
  scoreRisk: { ok: number; tot: number };
  testes: string[];
  limniReussies: string[];
  reflexe: string;
}

const DEFAUT: Etat = {
  courant: 0,
  valide: [false, false, false],
  bilanDeverrouille: false,
  scoreRisk: { ok: 0, tot: 0 },
  testes: [],
  limniReussies: [],
  reflexe: "",
};

function charger(): Etat {
  try {
    const d = JSON.parse(localStorage.getItem(CLE) || "null");
    if (!d || typeof d !== "object") return DEFAUT;
    return {
      ...DEFAUT,
      ...d,
      valide: Array.isArray(d.valide) ? [0, 1, 2].map((i) => !!d.valide[i]) : DEFAUT.valide,
      scoreRisk: d.scoreRisk ? { ok: +d.scoreRisk.ok || 0, tot: +d.scoreRisk.tot || 0 } : DEFAUT.scoreRisk,
      testes: Array.isArray(d.testes) ? d.testes : [],
      limniReussies: Array.isArray(d.limniReussies) ? d.limniReussies : [],
      reflexe: typeof d.reflexe === "string" ? d.reflexe : "",
    };
  } catch {
    return DEFAUT;
  }
}

const ONGLETS = [
  { lbl: "Accueil", ico: ICONES.maison },
  { lbl: "Modèle 3D", ico: ICONES.cube },
  { lbl: "Limnigrammes", ico: ICONES.courbe },
  { lbl: "Aléa · Enjeux · Risque", ico: ICONES.balance },
  { lbl: "Bilan", ico: ICONES.diplome },
];

export default function App() {
  const [etat, setEtat] = useState<Etat>(charger);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "lexique" | "code" | "reset">(null);
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [secoue, setSecoue] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CLE, JSON.stringify(etat));
    } catch {
      /* ignore */
    }
  }, [etat]);

  const toast = useCallback((m: string) => {
    setToastMsg(m);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const patch = useCallback((p: Partial<Etat> | ((e: Etat) => Partial<Etat>)) => {
    setEtat((e) => ({ ...e, ...(typeof p === "function" ? p(e) : p) }));
  }, []);

  const aller = useCallback(
    (i: number) => {
      if (i === 4 && !etat.bilanDeverrouille) {
        setCode("");
        setCodeErr("");
        setModal("code");
        return;
      }
      patch({ courant: i });
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [etat.bilanDeverrouille, patch],
  );

  const valider = useCallback(
    (n: number) => {
      setEtat((e) => {
        if (e.valide[n]) return e;
        const v = [...e.valide];
        v[n] = true;
        return { ...e, valide: v };
      });
      toast("Étape validée !");
    },
    [toast],
  );

  useEffect(() => {
    if (modal === "code") setTimeout(() => codeInput.current?.focus(), 40);
  }, [modal]);

  const verifierCode = () => {
    if (code.trim() === CODE_BILAN) {
      patch({ bilanDeverrouille: true, courant: 4, valide: [etat.valide[0], etat.valide[1], true] });
      setModal(null);
      toast("Bilan déverrouillé — bonne correction !");
      window.scrollTo({ top: 0 });
    } else {
      setCodeErr(code.trim() ? "Code incorrect — demande le bon code à ton·ta professeur·e." : "Entre le code avant de déverrouiller.");
      setSecoue(true);
      setTimeout(() => setSecoue(false), 450);
    }
  };

  const nValide = etat.valide.filter(Boolean).length;
  const courant = etat.courant === 4 && !etat.bilanDeverrouille ? 0 : etat.courant;

  return (
    <div className="min-h-screen">
      {/* ---------- entête ---------- */}
      <header className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-4 pb-2 pt-4 md:px-8">
        <button type="button" onClick={() => aller(0)} className="flex items-center gap-3 text-left">
          <span className="grid h-12 w-12 place-items-center rounded-[13px] border-[1.5px] border-[var(--filet-fort)] bg-carte shadow-[var(--ombre)]">
            <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
              <path d="M8 40 Q18 22 30 34 Q40 44 56 24" fill="none" stroke="#1B6CA8" strokeWidth="4" strokeLinecap="round" />
              <path d="M8 50 Q22 38 32 46 Q44 54 56 40" fill="none" stroke="#2F9ECF" strokeWidth="3" strokeLinecap="round" opacity=".8" />
              <circle cx="48" cy="18" r="6" fill="#D96C2C" stroke="#12364F" strokeWidth="1.6" />
            </svg>
          </span>
          <span>
            <span className="block font-titres text-[1.02rem] font-black leading-tight tracking-[0.5px]">L’HUVEAUNE EN CRUE</span>
            <span className="block text-[0.78rem] text-encre-2">Aléa · Enjeux · Risque — bassin versant de l’Huveaune · Cycle 4</span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn--fantome btn--petit" onClick={() => setModal("lexique")}>
            <Icone d={ICONES.livre} className="h-4 w-4" /> Lexique
          </button>
          <button
            type="button"
            className="grid h-[42px] w-[42px] place-items-center rounded-[10px] border-[1.5px] border-[var(--filet-fort)] bg-carte shadow-[0_2px_0_rgba(18,54,79,.18)] transition hover:-translate-y-0.5"
            title="Recommencer toute la mission"
            aria-label="Recommencer toute la mission"
            onClick={() => setModal("reset")}
          >
            <Icone d={ICONES.reset} />
          </button>
        </div>
      </header>

      {/* ---------- progression ---------- */}
      <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 pb-1 md:px-8" role="status" aria-label="Progression de la mission">
        <div className="flex h-3 flex-1 gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="relative flex-1 overflow-hidden rounded-full border border-[var(--filet)] bg-encre/10">
              <span
                className={cn("absolute inset-0 origin-left bg-gradient-to-b from-[#4FA3D4] to-bleu transition-transform duration-700", i < nValide ? "scale-x-100" : "scale-x-0")}
              />
            </span>
          ))}
        </div>
        <span className="whitespace-nowrap font-mono text-[0.78rem] text-encre-2">{nValide}/3 activités</span>
      </div>

      {/* ---------- stepper ---------- */}
      <nav className="mx-auto mt-1 max-w-[1240px] px-4 md:px-8" aria-label="Onglets de l'atelier">
        <ol className="m-0 flex list-none gap-2 overflow-x-auto py-2 pl-0 [scrollbar-width:thin]">
          {ONGLETS.map((o, i) => {
            const actif = i === courant;
            const verrou = i === 4 && !etat.bilanDeverrouille;
            const fait = (i === 2 && etat.valide[0]) || (i === 3 && etat.valide[1]) || (i === 4 && etat.bilanDeverrouille);
            return (
              <li key={o.lbl} className="shrink-0">
                <button
                  type="button"
                  onClick={() => aller(i)}
                  aria-current={actif ? "page" : undefined}
                  className={cn(
                    "flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] px-3.5 text-[0.85rem] font-semibold transition",
                    actif ? "border-encre bg-encre text-carte" : "border-[var(--filet)] bg-carte text-encre-2 hover:-translate-y-px hover:border-[var(--filet-fort)] hover:text-encre",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-[26px] w-[26px] place-items-center rounded-full font-mono text-[0.76rem] font-bold",
                      actif ? "bg-carte/20 text-carte" : fait ? "bg-vert text-carte" : verrou ? "bg-rouge/15 text-rouge" : "bg-encre/10 text-encre-2",
                    )}
                  >
                    {verrou ? <Icone d={ICONES.verrou} className="h-3.5 w-3.5" /> : fait ? <Icone d={ICONES.check} className="h-3.5 w-3.5" /> : i === 0 ? <Icone d={o.ico} className="h-3.5 w-3.5" /> : i}
                  </span>
                  {o.lbl}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ---------- contenu ---------- */}
      <main className="mx-auto max-w-[1240px] px-4 pb-10 pt-2 md:px-8">
        {courant === 0 && <Accueil aller={aller} valide={etat.valide} bilanDeverrouille={etat.bilanDeverrouille} />}
        {courant === 1 && <Modele3D suivant={() => aller(2)} />}
        {courant === 2 && (
          <LimniTab
            valide={etat.valide[0]}
            reussies={etat.limniReussies}
            onReussite={(id) => patch((e) => ({ limniReussies: e.limniReussies.includes(id) ? e.limniReussies : [...e.limniReussies, id] }))}
            onValide={() => valider(0)}
            toast={toast}
            reflexe={etat.reflexe}
            setReflexe={(v) => patch({ reflexe: v })}
          />
        )}
        {courant === 3 && (
          <RisqueTab
            valide={etat.valide[1]}
            score={etat.scoreRisk}
            setScore={(s) => patch({ scoreRisk: s })}
            testes={etat.testes}
            addTeste={(k) => patch((e) => ({ testes: e.testes.includes(k) ? e.testes : [...e.testes, k] }))}
            onValide={() => valider(1)}
          />
        )}
        {courant === 4 && <BilanTab deverrouille={etat.bilanDeverrouille} />}

        {courant > 0 && (
          <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-dashed border-[var(--filet-fort)] pt-4">
            <button type="button" className="btn btn--fantome btn--petit" onClick={() => aller(courant - 1)}>
              ◀ {ONGLETS[courant - 1].lbl}
            </button>
            {courant < 4 && (
              <button type="button" className="btn btn--fantome btn--petit" onClick={() => aller(courant + 1)}>
                {ONGLETS[courant + 1].lbl} ▶
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 border-t border-dashed border-[var(--filet-fort)] px-4 py-4 text-[0.8rem] text-encre-2 md:px-8">
        <div>Atelier « L’Huveaune en crue » — cycle 4 · Géographie / SVT · A. J.</div>
        <div className="text-[0.74rem]">
          Données hydrologiques : observatoire{" "}
          <a className="text-bleu" href="https://edumed.unice.fr/data-center/hydro/hydro-data/bv-huveaune.php" target="_blank" rel="noopener noreferrer">
            EduMed-Obs (Université Côte d’Azur)
          </a>{" "}
          — collèges Ubelka & 16 Fontaines, CDSC13 — et{" "}
          <a className="text-bleu" href="https://www.vigicrues.gouv.fr" target="_blank" rel="noopener noreferrer">
            Vigicrues
          </a>{" "}
          / HydroPortail. Séries reconstituées à but pédagogique. ·{" "}
          <button type="button" className="text-bleu underline-offset-2 hover:underline" onClick={() => setModal("lexique")}>
            Lexique
          </button>
        </div>
      </footer>

      <Toast message={toastMsg} />

      {/* ---------- modales ---------- */}
      {modal === "lexique" && (
        <Modal titre="Lexique de l’atelier" onClose={() => setModal(null)}>
          <div className="grid gap-2">
            {LEXIQUE.map((l) => (
              <div key={l.mot} className="rounded-lg border border-[var(--filet)] bg-carte px-3 py-2 text-[0.88rem]">
                <b className="text-bleu-fonce">{l.mot}</b> — {l.def}
              </div>
            ))}
          </div>
        </Modal>
      )}
      {modal === "code" && (
        <Modal
          titre="Bilan verrouillé"
          onClose={() => setModal(null)}
          className={cn(secoue && "ratee")}
          actions={
            <>
              <button type="button" className="btn btn--fantome btn--petit" onClick={() => setModal(null)}>Annuler</button>
              <button type="button" className="btn btn--action btn--petit" onClick={verifierCode}>Déverrouiller</button>
            </>
          }
        >
          <p className="m-0 text-[0.92rem]">
            Le <b>bilan-correction</b> de l’atelier est protégé. Entre le code communiqué par ton·ta professeur·e pour le consulter.
          </p>
          <label className="champ" htmlFor="inpCode">Code de déverrouillage</label>
          <input
            ref={codeInput}
            id="inpCode"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            placeholder="••••"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verifierCode()}
            className="!text-center font-mono !text-lg !tracking-[0.35em]"
          />
          <p className={cn("m-0 mt-1 min-h-[1.2em] text-[0.8rem]", codeErr && "text-rouge")} aria-live="polite">{codeErr}</p>
        </Modal>
      )}
      {modal === "reset" && (
        <Modal
          titre="Confirmation"
          onClose={() => setModal(null)}
          actions={
            <>
              <button type="button" className="btn btn--fantome btn--petit" onClick={() => setModal(null)}>Annuler</button>
              <button
                type="button"
                className="btn btn--alerte btn--petit"
                onClick={() => {
                  try { localStorage.removeItem(CLE); } catch { /* ignore */ }
                  setEtat(DEFAUT);
                  setModal(null);
                  toast("Atelier remis à zéro.");
                }}
              >
                Tout effacer
              </button>
            </>
          }
        >
          <p className="m-0 text-[0.92rem]">Remettre l’atelier à zéro ? Toute ta progression (validations, score, réponses) sera effacée.</p>
        </Modal>
      )}
    </div>
  );
}
