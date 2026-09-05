import { useState } from "react";
import { STATIONS, type StationId } from "../data/hydro";
import { cn } from "../utils/cn";

interface Props {
  actives?: StationId[];
  disponibles?: StationId[];
  onSelect?: (id: StationId) => void;
  compact?: boolean;
}

/* positions schématiques (la rivière coule d'est en ouest : source à droite, mer à gauche) */
const POS: Record<StationId, { x: number; y: number; lx: number; ly: number; anchor: "start" | "end" | "middle" }> = {
  stzac: { x: 560, y: 92, lx: 560, ly: 66, anchor: "middle" },
  auriol: { x: 470, y: 118, lx: 470, ly: 155, anchor: "middle" },
  roquevaire: { x: 392, y: 104, lx: 392, ly: 74, anchor: "middle" },
  stpons: { x: 330, y: 190, lx: 342, ly: 216, anchor: "middle" },
  aubagne: { x: 300, y: 138, lx: 288, ly: 172, anchor: "middle" },
};

/* positions sur l'image satellite (pourcentages relatifs à l'image) */
const SAT_POS: Record<StationId, { xPct: number; yPct: number }> = {
  stzac: { xPct: 80, yPct: 52 },
  auriol: { xPct: 64, yPct: 42 },
  roquevaire: { xPct: 49, yPct: 38 },
  stpons: { xPct: 52, yPct: 56 },
  aubagne: { xPct: 40, yPct: 60 },
};

function SchemaView({ actives, disponibles, onSelect, compact }: Props) {
  return (
    <svg viewBox="0 0 640 260" className={cn("block h-auto w-full", compact && "max-h-[260px]")} role="img" aria-label="Carte schématique du bassin versant de l'Huveaune et des stations de mesure">
      <defs>
        <linearGradient id="mer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2F9ECF" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#2F9ECF" stopOpacity={0.05} />
        </linearGradient>
        <linearGradient id="relief" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#E7D6AE" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#C9A96A" stopOpacity={0.45} />
        </linearGradient>
      </defs>
      {/* contour du bassin */}
      <path
        d="M70 150 C 90 90, 200 40, 330 48 C 420 52, 520 30, 600 60 C 630 75, 630 120, 600 150 C 560 200, 480 240, 380 238 C 300 236, 200 230, 130 210 C 90 198, 60 180, 70 150 Z"
        fill="rgba(47,158,207,.06)"
        stroke="rgba(18,54,79,.35)"
        strokeWidth={1.4}
        strokeDasharray="6 4"
      />
      {/* reliefs */}
      <path d="M330 232 L 400 180 L 460 205 L 520 170 L 590 200 L 600 236 Z" fill="url(#relief)" />
      <text x={470} y={232} fontSize="10" fill="#8a6a2b" fontStyle="italic" textAnchor="middle" fontFamily="Fraunces, serif">massif de la Sainte-Baume</text>
      <path d="M150 60 L 210 90 L 280 62 L 340 80" fill="none" stroke="#C9A96A" strokeWidth={1.2} opacity={0.7} />
      <text x={230} y={56} fontSize="10" fill="#8a6a2b" fontStyle="italic" textAnchor="middle" fontFamily="Fraunces, serif">Garlaban · Étoile</text>
      {/* mer */}
      <path d="M0 120 C 30 130, 40 170, 20 260 L 0 260 Z" fill="url(#mer)" />
      <text x={16} y={245} fontSize="10" fill="#1B6CA8" fontWeight={700} transform="rotate(-70 16 245)">Méditerranée</text>

      {/* rivière principale */}
      <path
        d="M610 88 C 590 92, 575 92, 560 92 C 520 92, 500 120, 470 118 C 440 116, 420 104, 392 104 C 360 104, 330 134, 300 138 C 260 144, 220 140, 180 150 C 130 162, 90 150, 40 160"
        fill="none"
        stroke="#1B6CA8"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.9}
      />
      <path
        d="M610 88 C 590 92, 575 92, 560 92 C 520 92, 500 120, 470 118 C 440 116, 420 104, 392 104 C 360 104, 330 134, 300 138 C 260 144, 220 140, 180 150 C 130 162, 90 150, 40 160"
        fill="none"
        stroke="#BFE3F2"
        strokeWidth={1.4}
        strokeDasharray="10 8"
        strokeLinecap="round"
      />
      {/* affluents */}
      <path d="M330 190 C 320 170, 310 150, 300 138" fill="none" stroke="#2F9ECF" strokeWidth={2.6} strokeLinecap="round" />
      <text x={352} y={192} fontSize="9.5" fill="#1B6CA8" fontStyle="italic">la Fauge</text>
      <path d="M470 118 C 470 150, 480 180, 500 205" fill="none" stroke="#2F9ECF" strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />
      <text x={492} y={182} fontSize="9.5" fill="#1B6CA8" fontStyle="italic">la Vède</text>
      <path d="M180 150 C 190 120, 200 100, 210 90" fill="none" stroke="#2F9ECF" strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />
      <text x={196} y={116} fontSize="9.5" fill="#1B6CA8" fontStyle="italic">le Jarret</text>

      {/* source & villes */}
      <circle cx={612} cy={88} r={3.5} fill="#12364F" />
      <text x={612} y={78} fontSize="10" textAnchor="middle" fill="#12364F" fontWeight={600}>source · Nans-les-Pins</text>
      <text x={95} y={140} fontSize="10.5" fill="#12364F" fontWeight={700}>MARSEILLE</text>
      <text x={548} y={124} fontSize="9" fill="#44617A">alt. 265 m</text>
      <text x={64} y={175} fontSize="9" fill="#44617A">alt. 0 m</text>
      <g>
        <path d="M600 30 l0 -14 M596 20 l4 -4 4 4" stroke="#44617A" strokeWidth={1.4} fill="none" />
        <text x={608} y={26} fontSize="9" fill="#44617A">N</text>
      </g>
      <text x={200} y={175} fontSize="9.5" fill="#44617A" fontStyle="italic">sens d'écoulement →  (est → ouest, 48 km)</text>

      {/* stations */}
      {STATIONS.map((s) => {
        const p = POS[s.id];
        const active = (actives ?? []).includes(s.id);
        const dispo = !disponibles || disponibles.includes(s.id);
        const clickable = !!onSelect && dispo;
        return (
          <g
            key={s.id}
            style={{ cursor: clickable ? "pointer" : "default", opacity: dispo ? 1 : 0.35 }}
            onClick={() => clickable && onSelect!(s.id)}
            role={clickable ? "button" : undefined}
            aria-label={`Station ${s.nom}`}
          >
            {active && <circle cx={p.x} cy={p.y} r={7} fill={s.couleur} className="pulse-point" opacity={0.6} />}
            <circle cx={p.x} cy={p.y} r={active ? 8 : 6.5} fill={active ? s.couleur : "#fff"} stroke={s.couleur} strokeWidth={2.6} />
            {s.reseau === "EduMed" ? (
              <circle cx={p.x} cy={p.y} r={2} fill={active ? "#fff" : s.couleur} />
            ) : (
              <rect x={p.x - 2} y={p.y - 2} width={4} height={4} fill={active ? "#fff" : s.couleur} />
            )}
            <text x={p.lx} y={p.ly} textAnchor={p.anchor} fontSize="10.5" fontWeight={700} fill={active ? s.couleur : "#12364F"}>
              {s.nom}
            </text>
            {!compact && (
              <text x={p.lx} y={p.ly + 11} textAnchor={p.anchor} fontSize="8.5" fill="#44617A">
                {s.reseau}
              </text>
            )}
          </g>
        );
      })}

      {/* légende */}
      <g transform="translate(20,18)">
        <circle cx={6} cy={6} r={5} fill="#fff" stroke="#1B6CA8" strokeWidth={2} />
        <circle cx={6} cy={6} r={1.8} fill="#1B6CA8" />
        <text x={16} y={10} fontSize="9.5" fill="#12364F">capteur EduMed (collèges / CDSC13)</text>
        <circle cx={6} cy={24} r={5} fill="#fff" stroke="#D96C2C" strokeWidth={2} />
        <rect x={4.3} y={22.3} width={3.4} height={3.4} fill="#D96C2C" />
        <text x={16} y={28} fontSize="9.5" fill="#12364F">station Vigicrues</text>
      </g>
    </svg>
  );
}

function SatelliteView({ actives, disponibles, onSelect }: Props) {
  return (
    <div className="relative overflow-hidden rounded-lg" role="img" aria-label="Vue satellite du bassin versant de l'Huveaune avec les stations de mesure">
      <img
        src="images/bassin-satellite.jpg"
        alt="Vue satellite du bassin versant de l'Huveaune"
        className="block h-auto w-full"
        draggable={false}
      />
      {/* stations markers */}
      {STATIONS.map((s) => {
        const p = SAT_POS[s.id];
        const active = (actives ?? []).includes(s.id);
        const dispo = !disponibles || disponibles.includes(s.id);
        const clickable = !!onSelect && dispo;
        return (
          <button
            key={s.id}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onSelect!(s.id)}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${p.xPct}%`,
              top: `${p.yPct}%`,
              opacity: dispo ? 1 : 0.35,
            }}
            aria-label={`Station ${s.nom}`}
          >
            {/* pulse ring */}
            {active && (
              <span
                className="pulse-point absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: 28,
                  height: 28,
                  background: s.couleur,
                  opacity: 0.4,
                }}
              />
            )}
            {/* marker dot */}
            <span
              className="relative z-10 block rounded-full border-[2.5px] shadow-[0_1px_4px_rgba(0,0,0,.5)] transition-transform group-hover:scale-125"
              style={{
                width: active ? 18 : 14,
                height: active ? 18 : 14,
                background: active ? s.couleur : "#fff",
                borderColor: s.couleur,
              }}
            >
              {s.reseau === "EduMed" ? (
                <span
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ width: 4, height: 4, background: active ? "#fff" : s.couleur }}
                />
              ) : (
                <span
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ width: 4, height: 4, background: active ? "#fff" : s.couleur }}
                />
              )}
            </span>
            {/* label */}
            <span
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[5px] px-1.5 py-0.5 text-[10px] font-bold shadow-[0_1px_3px_rgba(0,0,0,.45)]"
              style={{
                top: active ? 22 : 18,
                background: "rgba(255,255,255,.92)",
                color: active ? s.couleur : "#12364F",
                border: `1.5px solid ${s.couleur}`,
              }}
            >
              {s.nom}
              <span className="ml-1 text-[8px] font-normal" style={{ color: "#44617A" }}>
                {s.reseau}
              </span>
            </span>
          </button>
        );
      })}
      {/* légende overlay */}
      <div className="absolute bottom-2 left-2 flex flex-col gap-1 rounded-lg bg-white/90 px-2.5 py-2 text-[9.5px] font-semibold shadow-[0_1px_4px_rgba(0,0,0,.3)] backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-[#1B6CA8] bg-white" />
          capteur EduMed
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-[#D96C2C] bg-white" />
          station Vigicrues
        </div>
      </div>
      {/* compass */}
      <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[10px] font-bold text-[#44617A] shadow-[0_1px_3px_rgba(0,0,0,.3)]">
        N↑
      </div>
    </div>
  );
}

const ICON_SATELLITE =
  "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2";
const ICON_SCHEMA =
  "M3 3h18v18H3zM3 9h18M9 3v18";

export default function CarteBassin({ actives = [], disponibles, onSelect, compact }: Props) {
  const [mode, setMode] = useState<"schema" | "satellite">("schema");
  return (
    <div className="relative">
      {/* toggle button */}
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => setMode((m) => (m === "schema" ? "satellite" : "schema"))}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.75rem] font-semibold transition",
            mode === "satellite"
              ? "border-bleu-fonce bg-bleu text-white"
              : "border-[var(--filet-fort)] bg-carte text-encre-2 hover:border-bleu hover:text-encre",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={mode === "schema" ? ICON_SATELLITE : ICON_SCHEMA} />
          </svg>
          {mode === "schema" ? "Vue satellite" : "Vue schéma"}
        </button>
      </div>
      {mode === "schema" ? (
        <SchemaView actives={actives} disponibles={disponibles} onSelect={onSelect} compact={compact} />
      ) : (
        <SatelliteView actives={actives} disponibles={disponibles} onSelect={onSelect} compact={compact} />
      )}
    </div>
  );
}
