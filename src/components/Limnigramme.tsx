import { useMemo, useRef, useState, type PointerEvent } from "react";
import {
  type HydroEvent,
  type Point,
  type Station,
  dateAt,
  fmtDate,
  fmtHeure,
  fmtDuree,
  fr,
} from "../data/hydro";

export interface SerieAffichee {
  station: Station;
  pts: Point[];
}

interface Props {
  ev: HydroEvent;
  series: SerieAffichee[];
  montrerPluie: boolean;
  montrerSeuils: boolean;
  montrerPoints: boolean;
  modeMesure: boolean;
  montrerPic: boolean;
  echelleFixe?: number | null;
}

const W = 920;
const H = 470;
const ML = 58;
const MR = 26;
const MT = 16;
const MB = 58;
const HP = 78; // hauteur du panneau pluie
const GAP = 14;

export default function Limnigramme({ ev, series, montrerPluie, montrerSeuils, montrerPoints, modeMesure, montrerPic, echelleFixe }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [mesure, setMesure] = useState<{ a: Point | null; b: Point | null }>({ a: null, b: null });

  const topChart = MT + (montrerPluie ? HP + GAP : 0);
  const ih = H - topChart - MB;
  const iw = W - ML - MR;

  const hMax = useMemo(() => {
    if (echelleFixe) return echelleFixe;
    let m = 0;
    for (const s of series) for (const p of s.pts) m = Math.max(m, p.h);
    if (montrerSeuils && ev.type === "crue") for (const s of series) m = Math.max(m, s.station.seuils.debordement);
    if (m < 0.3) return Math.ceil((m * 1.25) * 100) / 100 || 0.2;
    if (m < 1) return Math.ceil((m * 1.15) * 10) / 10;
    return Math.ceil((m + 0.4) * 2) / 2;
  }, [series, montrerSeuils, echelleFixe, ev.type]);

  const pas = hMax <= 0.3 ? 0.05 : hMax <= 1 ? 0.1 : hMax <= 3 ? 0.5 : 0.5;
  const X = (t: number) => ML + (iw * t) / ev.duree;
  const Y = (h: number) => topChart + ih * (1 - h / hMax);
  const YP = (mm: number) => MT + (HP * Math.min(mm, ev.pluieMax)) / ev.pluieMax;

  const tFromEvent = (e: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const t = ((x - ML) / iw) * ev.duree;
    if (t < 0 || t > ev.duree) return null;
    return t;
  };

  const nearest = (pts: Point[], t: number) => {
    if (!pts.length) return null;
    let best = pts[0];
    for (const p of pts) if (Math.abs(p.t - t) < Math.abs(best.t - t)) best = p;
    return best;
  };

  const onMove = (e: PointerEvent<SVGSVGElement>) => setHover(tFromEvent(e));
  const onLeave = () => setHover(null);
  const onClick = (e: PointerEvent<SVGSVGElement>) => {
    if (!modeMesure || !series.length) return;
    const t = tFromEvent(e);
    if (t == null) return;
    const p = nearest(series[0].pts, t);
    if (!p) return;
    setMesure((m) => {
      if (!m.a || (m.a && m.b)) return { a: p, b: null };
      return { a: m.a, b: p };
    });
  };

  // graduations X : toutes les 6 h + labels de date à minuit
  const ticks: { t: number; label: string; minuit: boolean }[] = [];
  const startH = ev.debut.getHours();
  for (let t = 0; t <= ev.duree; t += 1) {
    const hd = (startH + t) % 24;
    if (hd % 6 === 0) ticks.push({ t, label: `${hd}h`, minuit: hd === 0 });
  }

  const pluieBars: { t: number; mm: number }[] = [];
  if (montrerPluie) for (let t = 0; t < ev.duree; t++) pluieBars.push({ t, mm: ev.pluie(t + 0.5) });
  const cumulPluie = pluieBars.reduce((s, b) => s + b.mm, 0);

  const principal = series[0];
  const seuils = principal?.station.seuils;

  const mesureOK = mesure.a && mesure.b;
  const dT = mesureOK ? Math.abs(mesure.b!.t - mesure.a!.t) : 0;
  const dH = mesureOK ? mesure.b!.h - mesure.a!.h : 0;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full select-none touch-none"
        role="img"
        aria-label={`Limnigramme ${ev.titre} — ${series.map((s) => s.station.nom).join(", ")}`}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerDown={onClick}
        style={{ cursor: modeMesure ? "crosshair" : "default" }}
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={s.station.id} id={`grad-${s.station.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.station.couleur} stopOpacity={0.28} />
              <stop offset="100%" stopColor={s.station.couleur} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>

        {/* fond */}
        <rect x={ML} y={topChart} width={iw} height={ih} fill="rgba(255,255,255,.55)" />

        {/* ----- panneau pluie ----- */}
        {montrerPluie && (
          <g>
            <rect x={ML} y={MT} width={iw} height={HP} fill="rgba(47,158,207,.06)" />
            {[0, ev.pluieMax / 2, ev.pluieMax].map((mm) => (
              <g key={mm}>
                <line x1={ML} x2={W - MR} y1={YP(mm)} y2={YP(mm)} stroke="rgba(18,54,79,.12)" />
                <text x={ML - 7} y={YP(mm) + 4} textAnchor="end" fontSize="10" fill="#44617A">
                  {mm}
                </text>
              </g>
            ))}
            {pluieBars.map((b) =>
              b.mm > 0.05 ? (
                <rect
                  key={b.t}
                  x={X(b.t) + 0.5}
                  y={MT}
                  width={Math.max(1, X(b.t + 1) - X(b.t) - 1)}
                  height={YP(b.mm) - MT}
                  fill="#2F9ECF"
                  opacity={0.85}
                  rx={1}
                />
              ) : null,
            )}
            <text x={ML + 6} y={MT + HP - 5} fontSize="10.5" fontWeight={700} fill="#1B6CA8">
              Pluie (mm/h) — cumul ≈ {Math.round(cumulPluie)} mm
            </text>
            <text x={14} y={MT + HP / 2} fontSize="10" fill="#44617A" transform={`rotate(-90 14 ${MT + HP / 2})`} textAnchor="middle">
              mm/h
            </text>
          </g>
        )}

        {/* ----- grille Y ----- */}
        {Array.from({ length: Math.floor(hMax / pas + 1e-6) + 1 }, (_, i) => i * pas).map((h) => (
          <g key={h}>
            <line x1={ML} x2={W - MR} y1={Y(h)} y2={Y(h)} stroke="rgba(18,54,79,.12)" />
            <text x={ML - 7} y={Y(h) + 4} textAnchor="end" fontSize="11" fill="#44617A" fontFamily="Space Mono, monospace">
              {fr(h, pas < 0.1 ? 2 : 1)}
            </text>
          </g>
        ))}

        {/* ----- grille X ----- */}
        {ticks.map((tk) => (
          <g key={tk.t}>
            <line
              x1={X(tk.t)}
              x2={X(tk.t)}
              y1={MT}
              y2={H - MB}
              stroke={tk.minuit ? "rgba(18,54,79,.35)" : "rgba(18,54,79,.1)"}
              strokeDasharray={tk.minuit ? "4 3" : undefined}
            />
            <text x={X(tk.t)} y={H - MB + 15} textAnchor="middle" fontSize="10.5" fill="#44617A" fontFamily="Space Mono, monospace">
              {tk.label}
            </text>
            {tk.minuit && (
              <text x={X(tk.t) + 4} y={H - MB + 30} fontSize="10.5" fontWeight={700} fill="#12364F">
                {fmtDate(dateAt(ev, tk.t))}
              </text>
            )}
          </g>
        ))}
        {ticks[0] && !ticks[0].minuit && (
          <text x={ML + 2} y={H - MB + 30} fontSize="10.5" fontWeight={700} fill="#12364F">
            {fmtDate(ev.debut)}
          </text>
        )}

        {/* ----- seuils ----- */}
        {montrerSeuils && seuils && (
          <g>
            {seuils.jaune && seuils.jaune < hMax && (
              <g>
                <line x1={ML} x2={W - MR} y1={Y(seuils.jaune)} y2={Y(seuils.jaune)} stroke="#d4b106" strokeWidth={1.4} strokeDasharray="6 4" />
                <text x={W - MR - 4} y={Y(seuils.jaune) - 4} textAnchor="end" fontSize="10" fill="#8a7305" fontWeight={700}>
                  Vigilance jaune ({fr(seuils.jaune, 1)} m)
                </text>
              </g>
            )}
            {seuils.orange && seuils.orange < hMax && (
              <g>
                <line x1={ML} x2={W - MR} y1={Y(seuils.orange)} y2={Y(seuils.orange)} stroke="#D96C2C" strokeWidth={1.4} strokeDasharray="6 4" />
                <text x={W - MR - 4} y={Y(seuils.orange) - 4} textAnchor="end" fontSize="10" fill="#a3521b" fontWeight={700}>
                  Vigilance orange ({fr(seuils.orange, 1)} m)
                </text>
              </g>
            )}
            {seuils.rouge && seuils.rouge < hMax && (
              <g>
                <line x1={ML} x2={W - MR} y1={Y(seuils.rouge)} y2={Y(seuils.rouge)} stroke="#B3382C" strokeWidth={1.4} strokeDasharray="6 4" />
                <text x={W - MR - 4} y={Y(seuils.rouge) - 4} textAnchor="end" fontSize="10" fill="#7E241B" fontWeight={700}>
                  Vigilance rouge ({fr(seuils.rouge, 1)} m)
                </text>
              </g>
            )}
            {seuils.debordement < hMax && (
              <g>
                <rect x={ML} y={topChart} width={iw} height={Math.max(0, Y(seuils.debordement) - topChart)} fill="rgba(217,108,44,.07)" />
                <line x1={ML} x2={W - MR} y1={Y(seuils.debordement)} y2={Y(seuils.debordement)} stroke="rgba(179,56,44,.8)" strokeWidth={1.6} />
                <text x={ML + 6} y={Y(seuils.debordement) - 5} fontSize="10.5" fill="#7E241B" fontWeight={700}>
                  Débordement — {fr(seuils.debordement, 1)} m
                </text>
              </g>
            )}
          </g>
        )}

        {/* ----- courbes ----- */}
        {series.map((s, idx) => {
          if (!s.pts.length) return null;
          const d = s.pts.map((p, i) => `${i ? "L" : "M"}${X(p.t).toFixed(1)} ${Y(p.h).toFixed(1)}`).join(" ");
          const area = `${d} L${X(s.pts[s.pts.length - 1].t).toFixed(1)} ${Y(0)} L${X(0)} ${Y(0)} Z`;
          let pic = s.pts[0];
          for (const p of s.pts) if (p.h > pic.h) pic = p;
          return (
            <g key={s.station.id}>
              {idx === 0 && <path d={area} fill={`url(#grad-${s.station.id})`} />}
              <path d={d} fill="none" stroke={s.station.couleur} strokeWidth={idx === 0 ? 2.8 : 2.2} strokeLinejoin="round" strokeLinecap="round" opacity={idx === 0 ? 1 : 0.9} />
              {montrerPoints &&
                s.pts.filter((_, i) => i % 4 === 0).map((p) => <circle key={p.t} cx={X(p.t)} cy={Y(p.h)} r={2} fill={s.station.couleur} opacity={0.75} />)}
              {montrerPic && ev.type === "crue" && (
                <g>
                  <line x1={X(pic.t)} x2={X(pic.t)} y1={Y(pic.h)} y2={Y(0)} stroke={s.station.couleur} strokeDasharray="3 3" opacity={0.6} />
                  <circle cx={X(pic.t)} cy={Y(pic.h)} r={4.5} fill={s.station.couleur} stroke="#fff" strokeWidth={1.6} />
                  <text x={X(pic.t)} y={Y(pic.h) - 10} textAnchor="middle" fontSize="11.5" fontWeight={700} fill={s.station.couleur} fontFamily="Space Mono, monospace">
                    {fr(pic.h)} m · {fmtHeure(dateAt(ev, pic.t))}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ----- outil de mesure ----- */}
        {modeMesure && mesure.a && (
          <g>
            <circle cx={X(mesure.a.t)} cy={Y(mesure.a.h)} r={5} fill="#12364F" stroke="#fff" strokeWidth={1.5} />
            <text x={X(mesure.a.t) - 8} y={Y(mesure.a.h) - 8} textAnchor="end" fontSize="11" fontWeight={700} fill="#12364F">A</text>
            {mesure.b && (
              <g>
                <circle cx={X(mesure.b.t)} cy={Y(mesure.b.h)} r={5} fill="#12364F" stroke="#fff" strokeWidth={1.5} />
                <text x={X(mesure.b.t) + 8} y={Y(mesure.b.h) - 8} fontSize="11" fontWeight={700} fill="#12364F">B</text>
                <path
                  d={`M${X(mesure.a.t)} ${Y(mesure.a.h)} L${X(mesure.b.t)} ${Y(mesure.a.h)} L${X(mesure.b.t)} ${Y(mesure.b.h)}`}
                  fill="none"
                  stroke="#12364F"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                />
                <line x1={X(mesure.a.t)} y1={Y(mesure.a.h)} x2={X(mesure.b.t)} y2={Y(mesure.b.h)} stroke="#12364F" strokeWidth={1.8} />
                <text x={(X(mesure.a.t) + X(mesure.b.t)) / 2} y={Y(mesure.a.h) + (mesure.b.h > mesure.a.h ? 14 : -6)} textAnchor="middle" fontSize="11" fontWeight={700} fill="#12364F" fontFamily="Space Mono, monospace">
                  Δt = {fmtDuree(dT)}
                </text>
                <text x={X(mesure.b.t) + (mesure.b.t > mesure.a.t ? 8 : -8)} y={(Y(mesure.a.h) + Y(mesure.b.h)) / 2 + 4} textAnchor={mesure.b.t > mesure.a.t ? "start" : "end"} fontSize="11" fontWeight={700} fill="#12364F" fontFamily="Space Mono, monospace">
                  Δh = {dH >= 0 ? "+" : ""}{fr(dH)} m
                </text>
              </g>
            )}
          </g>
        )}

        {/* ----- axes ----- */}
        <line x1={ML} x2={W - MR} y1={Y(0)} y2={Y(0)} stroke="#12364F" strokeWidth={1.6} />
        <line x1={ML} x2={ML} y1={MT} y2={H - MB} stroke="#12364F" strokeWidth={1.6} />
        <text x={14} y={topChart + ih / 2} fontSize="11" fill="#44617A" transform={`rotate(-90 14 ${topChart + ih / 2})`} textAnchor="middle" fontWeight={600}>
          Hauteur d’eau (m)
        </text>
        <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="11.5" fill="#44617A" fontWeight={600}>
          Temps (heures) — {series.length > 1 ? "comparaison de stations" : principal ? `${principal.station.nom} · ${principal.station.reseau}` : ""}
        </text>

        {/* ----- survol ----- */}
        {hover != null && series.length > 0 && (
          <g pointerEvents="none">
            <line x1={X(hover)} x2={X(hover)} y1={MT} y2={H - MB} stroke="#12364F" strokeWidth={1} strokeDasharray="3 3" />
            {series.map((s) => {
              const p = nearest(s.pts, hover);
              return p ? <circle key={s.station.id} cx={X(p.t)} cy={Y(p.h)} r={4.5} fill="#fff" stroke={s.station.couleur} strokeWidth={2.4} /> : null;
            })}
            {(() => {
              const boxW = 176;
              const lignes = series.map((s) => ({ s, p: nearest(s.pts, hover) }));
              const boxH = 34 + lignes.length * 16 + (montrerPluie ? 16 : 0);
              const bx = X(hover) + 14 + boxW > W - MR ? X(hover) - 14 - boxW : X(hover) + 14;
              const by = topChart + 8;
              const dt = dateAt(ev, hover);
              return (
                <g transform={`translate(${bx},${by})`}>
                  <rect width={boxW} height={boxH} rx={8} fill="rgba(18,54,79,.94)" />
                  <text x={10} y={17} fontSize="11" fontWeight={700} fill="#fff" fontFamily="Space Mono, monospace">
                    {fmtDate(dt)} {fmtHeure(dt)}
                  </text>
                  <text x={10} y={29} fontSize="9.5" fill="#BFE3F2">
                    t = {fmtDuree(hover)} depuis le début
                  </text>
                  {lignes.map(({ s, p }, i) => (
                    <g key={s.station.id} transform={`translate(10,${44 + i * 16})`}>
                      <rect width={10} height={4} y={-4} rx={2} fill={s.station.couleur} />
                      <text x={16} fontSize="11" fill="#fff">
                        {s.station.nom} : <tspan fontWeight={700} fontFamily="Space Mono, monospace">{p ? fr(p.h) : "—"} m</tspan>
                      </text>
                    </g>
                  ))}
                  {montrerPluie && (
                    <text x={10} y={44 + lignes.length * 16} fontSize="10.5" fill="#BFE3F2">
                      Pluie : {fr(ev.pluie(Math.floor(hover) + 0.5), 1)} mm/h
                    </text>
                  )}
                </g>
              );
            })()}
          </g>
        )}
      </svg>

      {modeMesure && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-[var(--filet-fort)] bg-carte-chaude px-3 py-2 text-[0.82rem]">
          <span className="font-semibold">📏 Outil de mesure :</span>
          {!mesure.a && <span>clique un premier point (A) sur la courbe…</span>}
          {mesure.a && !mesure.b && <span>puis un second point (B).</span>}
          {mesureOK && (
            <span className="font-mono">
              Δt = <b>{fmtDuree(dT)}</b> · Δh = <b>{fr(dH)} m</b> · vitesse = <b>{dT > 0 ? fr(Math.abs(dH) / dT) : "—"} m/h</b> ({dT > 0 ? Math.round((Math.abs(dH) / dT) * 100) : "—"} cm/h)
            </span>
          )}
          {mesure.a && (
            <button type="button" className="btn btn--fantome btn--petit ml-auto" onClick={() => setMesure({ a: null, b: null })}>
              Effacer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
