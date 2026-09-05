import { useState } from "react";
import { Etete } from "../components/ui";
import { NIV_RISK, SCEN_ALEA, ZONES, type Niveau, computeRisk, vulnLabel } from "../data/risque";
import { cn } from "../utils/cn";

interface Props {
  valide: boolean;
  score: { ok: number; tot: number };
  setScore: (s: { ok: number; tot: number }) => void;
  testes: string[];
  addTeste: (k: string) => void;
  onValide: () => void;
}

export default function RisqueTab({ valide, score, setScore, testes, addTeste, onValide }: Props) {
  const [scen, setScen] = useState(SCEN_ALEA[2].id);
  const [zone, setZone] = useState(ZONES[1].id);
  const [sel, setSel] = useState<Niveau | null>(null);
  const [just, setJust] = useState("");
  const [fb, setFb] = useState<{ ok: boolean; html: React.ReactNode } | null>(null);

  const s = SCEN_ALEA.find((x) => x.id === scen)!;
  const z = ZONES.find((x) => x.id === zone)!;

  const verifier = () => {
    const attendu = computeRisk(s.id, z.id);
    const key = `${s.id}_${z.id}`;
    addTeste(key);
    const nOk = score.ok + (sel === attendu ? 1 : 0);
    setScore({ ok: nOk, tot: score.tot + 1 });
    if (nOk >= 5 && !valide) onValide();
    const detail = (
      <>
        <br />
        Aléa : {s.wl.toLocaleString("fr-FR")} m d’eau · Seuil de la zone : {z.seuil.toLocaleString("fr-FR")} m · Vulnérabilité : {vulnLabel(z.vuln)}.
        {just && (
          <>
            <br />
            <em>Justification : « {just} »</em>
          </>
        )}
      </>
    );
    if (sel === attendu) {
      setFb({ ok: true, html: <>✅ Bonne prédiction : risque <b>{NIV_RISK[attendu].lbl}</b>.{detail}</> });
    } else {
      setFb({
        ok: false,
        html: (
          <>
            ❌ Prédiction <b>{sel ? NIV_RISK[sel].lbl : "non choisie"}</b>, mais le risque calculé est <b>{NIV_RISK[attendu].lbl}</b>.{detail}
            <br />💡 Rappel : <b>Risque = Aléa × Enjeux</b>
          </>
        ),
      });
    }
    setSel(null);
    setJust("");
  };

  const aleatoire = () => {
    setScen(SCEN_ALEA[1 + Math.floor(Math.random() * (SCEN_ALEA.length - 1))].id);
    setZone(ZONES[Math.floor(Math.random() * ZONES.length)].id);
    setFb(null);
  };

  return (
    <section className="etape">
      <Etete num="Étape 3 · Raisonner" titre="Déterminer le risque : scénarios, zones, enjeux" valide={valide} />
      <div className="boite mb-4">
        <div className="rounded-lg border border-alerte/40 bg-alerte/10 p-3 text-center text-lg font-bold">Risque = Aléa × Enjeux</div>
        <p className="legende m-0 mt-2 text-center">
          L’aléa est la crue (fréquence + intensité). Les enjeux sont les personnes, les biens et les activités exposés. <b>Pas d’enjeu = pas de risque, même en cas de grosse crue.</b>
        </p>
      </div>
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div className="boite">
          <h3>1. Choisis ton scénario (l’aléa)</h3>
          <label className="champ" htmlFor="actScen">Scénario de crue</label>
          <select id="actScen" value={scen} onChange={(e) => { setScen(e.target.value); setFb(null); }}>
            {SCEN_ALEA.map((x) => (
              <option key={x.id} value={x.id}>{x.name} (T = {x.T})</option>
            ))}
          </select>
          <p className="legende m-0 mt-2">
            <b>Niveau d’eau :</b> {s.wl.toLocaleString("fr-FR")} m · <b>Période de retour :</b> {s.T === "—" ? "pas de crue" : s.T}
            <br />{s.desc}
          </p>
        </div>
        <div className="boite">
          <h3>2. Choisis la zone de la carte (l’enjeu)</h3>
          <label className="champ" htmlFor="actZone">Zone exposée</label>
          <select id="actZone" value={zone} onChange={(e) => { setZone(e.target.value); setFb(null); }}>
            {ZONES.map((x) => (
              <option key={x.id} value={x.id}>{x.name}</option>
            ))}
          </select>
          <p className="legende m-0 mt-2">
            <b>Vulnérabilité :</b> {vulnLabel(z.vuln)} · <b>Seuil d’inondation :</b> touchée dès {z.seuil.toLocaleString("fr-FR")} m
            <br />{z.desc}
          </p>
        </div>
      </div>
      <div className="boite mb-4">
        <h3>3. Prédis le niveau de risque</h3>
        <div className="choix-btn">
          {(Object.keys(NIV_RISK) as Niveau[]).map((n) => (
            <button key={n} type="button" className={cn(sel === n && "sel")} onClick={() => setSel(n)}>
              {NIV_RISK[n].lbl}
            </button>
          ))}
        </div>
        <label className="champ" htmlFor="riskJust">Justifie ta réponse (phrase complète)</label>
        <textarea id="riskJust" rows={2} value={just} onChange={(e) => setJust(e.target.value)} placeholder="Ex. : la crue centennale submerge le gymnase sur 3 m — l’enjeu est fort et la zone est inondée…" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn--action" onClick={verifier} disabled={!sel}>Vérifier ma prédiction</button>
          <button type="button" className="btn btn--fantome" onClick={aleatoire}>Tirer une autre combinaison</button>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-encre px-3 py-1 font-mono text-[0.8rem] font-bold text-carte">
            Score : {score.ok} / {score.tot} {score.ok < 5 && `· encore ${5 - score.ok} bonne(s) pour valider`}
          </span>
        </div>
        <div className="mt-3 min-h-[56px]" aria-live="polite">
          {fb && <div className={fb.ok ? "succes-bloc" : "err-bloc"}>{fb.html}</div>}
        </div>
      </div>
      <div className="boite">
        <h3>Tableau de référence — combinaisons zone × scénario</h3>
        <p className="legende m-0 mb-2">
          Ce tableau est calculé à partir du modèle : il dépend de la <b>hauteur d’eau atteinte</b> et de la <b>vulnérabilité</b> de chaque enjeu. Les cases encadrées sont celles que tu as déjà testées.
        </p>
        <div className="overflow-x-auto">
          <table className="tabrisque">
            <thead>
              <tr>
                <th>Zone ↓ · Scénario →</th>
                {SCEN_ALEA.map((x) => (
                  <th key={x.id}>{x.name.split(" ").slice(0, 2).join(" ")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ZONES.map((zz) => (
                <tr key={zz.id}>
                  <td>{zz.name}</td>
                  {SCEN_ALEA.map((ss) => {
                    const lvl = computeRisk(ss.id, zz.id);
                    const known = testes.includes(`${ss.id}_${zz.id}`);
                    return (
                      <td key={ss.id} className={NIV_RISK[lvl].cl} style={known ? { boxShadow: "inset 0 0 0 2px var(--color-bleu)" } : undefined} title={known ? "Observé" : "À explorer"}>
                        {NIV_RISK[lvl].lbl}{known ? " ✓" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="legende m-0 mt-2">Observe : la même crue donne des risques différents selon l’enjeu — et le même enjeu est plus ou moins menacé selon la crue.</p>
      </div>
    </section>
  );
}
