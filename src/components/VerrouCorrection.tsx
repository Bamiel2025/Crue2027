import { useState } from "react";
import { Icone, ICONES, Modal } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  titre?: string;
  isUnlocked: boolean;
  onUnlock: () => void;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}

export function VerrouCorrection({
  titre = "Section réservée à la correction",
  isUnlocked,
  onUnlock,
  children,
  hint = "Cette partie contient les réponses ou éléments de correction. Demande le code à ton·ta professeur·e.",
  className,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (code.trim() === "2027") {
      onUnlock();
      setModalOpen(false);
      setCode("");
      setError("");
    } else {
      setError(code.trim() ? "Code incorrect — demande le bon code à ton·ta professeur·e." : "Entre le code pour déverrouiller.");
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-[var(--filet)] bg-carte p-6 text-center shadow-[var(--ombre)]", className)}>
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-rouge/10 text-rouge">
        <Icone d={ICONES.verrou} className="h-6 w-6" />
      </div>
      <h3 className="mb-1 font-titres text-lg font-bold text-encre">{titre}</h3>
      <p className="legende mx-auto max-w-md text-[0.88rem] leading-relaxed">{hint}</p>
      <div className="mt-4">
        <button
          type="button"
          className="btn btn--action btn--petit inline-flex items-center gap-2"
          onClick={() => {
            setCode("");
            setError("");
            setModalOpen(true);
          }}
        >
          <Icone d={ICONES.verrou} className="h-3.5 w-3.5" />
          Déverrouiller avec le code professeur
        </button>
      </div>

      {modalOpen && (
        <Modal
          titre={titre}
          onClose={() => setModalOpen(false)}
          className={cn(shake && "ratee")}
          actions={
            <>
              <button type="button" className="btn btn--fantome btn--petit" onClick={() => setModalOpen(false)}>
                Annuler
              </button>
              <button type="button" className="btn btn--action btn--petit" onClick={handleSubmit}>
                Déverrouiller
              </button>
            </>
          }
        >
          <p className="m-0 text-[0.92rem]">
            Entre le code de correction (<b>2027</b>) pour déverrouiller cet élément :
          </p>
          <label className="champ" htmlFor="codeCorrection">Code de déverrouillage</label>
          <input
            id="codeCorrection"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            placeholder="••••"
            value={code}
            autoFocus
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="!text-center font-mono !text-lg !tracking-[0.35em]"
          />
          <p className={cn("m-0 mt-1 min-h-[1.2em] text-[0.8rem]", error && "text-rouge")} aria-live="polite">
            {error}
          </p>
        </Modal>
      )}
    </div>
  );
}
