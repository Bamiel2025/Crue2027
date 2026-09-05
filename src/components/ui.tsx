import { useEffect, type ReactNode } from "react";
import { cn } from "../utils/cn";

export function Icone({ d, className }: { d: string | string[]; className?: string }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-5 w-5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}

export const ICONES = {
  check: "M4 12.5 9.5 18 20 6.5",
  verrou: ["M5 10.5h14v10H5z", "M8 10.5V7a4 4 0 0 1 8 0v3.5"],
  reset: ["M3 12a9 9 0 1 0 3-6.7L3 8", "M3 3v5h5"],
  livre: ["M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z", "M19 19H6a2 2 0 0 0-2 2", "M9 7h6M9 11h6"],
  externe: ["M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", "M15 3h6v6", "M10 14 21 3"],
  maison: ["M3 11 12 3l9 8", "M5 10v10h14V10", "M10 20v-6h4v6"],
  cube: ["M12 2 3 7v10l9 5 9-5V7z", "M3 7l9 5 9-5", "M12 12v10"],
  courbe: ["M3 20h18", "M4 17c3 0 4-10 7-10s4 8 9 4"],
  balance: ["M12 3v18", "M5 21h14", "M3 8h18", "M6 8l-3 7h6z", "M18 8l-3 7h6z"],
  diplome: ["M4 4h16v12H4z", "M8 20l4-2 4 2v-4H8z", "M8 8h8M8 11h5"],
  download: ["M12 3v12", "M7 10l5 5 5-5", "M4 20h16"],
  pluie: ["M7 16a5 5 0 1 1 1-9.9A6 6 0 0 1 19.5 9 3.5 3.5 0 0 1 18 16z", "M8 19v2M12 18v3M16 19v2"],
  regle: ["M3 17 17 3l4 4L7 21z", "M8 16l2-2M11 13l2-2M14 10l2-2"],
  fleche: "M5 12h14M13 6l6 6-6 6",
  info: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 16v-4M12 8h.01"],
  oeil: ["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  croix: ["M18 6 6 18", "M6 6l12 12"],
};

export function Etete({
  num,
  titre,
  valide,
  tamponTexte = "VALIDÉ ✓",
  children,
}: {
  num: string;
  titre: string;
  valide?: boolean;
  tamponTexte?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative mb-4 rounded-xl border border-[var(--filet)] bg-carte px-5 py-5 shadow-[var(--ombre)]">
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-bleu/10 to-transparent to-40%" />
      <p className="relative m-0 mb-1 text-[0.72rem] font-bold uppercase tracking-[1.4px] text-bleu">{num}</p>
      <h2 className="relative m-0 font-titres text-2xl font-bold leading-tight" tabIndex={-1}>
        {titre}
      </h2>
      {children && <div className="relative mt-2">{children}</div>}
      {valide && <span className="tampon">{tamponTexte}</span>}
    </div>
  );
}

export function Modal({
  titre,
  onClose,
  children,
  actions,
  className,
}: {
  titre: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div
      className="modal-fond fixed inset-0 z-[1200] grid place-items-center bg-[rgba(10,28,44,.62)] p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        className={cn(
          "modal-boite max-h-[88vh] w-[min(560px,100%)] overflow-auto rounded-2xl bg-carte px-6 py-5 shadow-[var(--ombre-forte)]",
          className,
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="m-0 font-titres text-lg font-bold">{titre}</h3>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-md p-1 text-encre-2 hover:bg-papier">
            <Icone d={ICONES.croix} />
          </button>
        </div>
        {children}
        {actions && <div className="mt-4 flex justify-end gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 z-[1300] -translate-x-1/2 rounded-xl bg-encre px-5 py-3 text-[0.92rem] font-semibold text-carte shadow-[var(--ombre-forte)] transition-transform duration-300",
        message ? "translate-y-0" : "translate-y-[150%]",
      )}
    >
      {message}
    </div>
  );
}

export function Carte({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("boite", className)}>{children}</div>;
}
