import CarteBassin from "../components/CarteBassin";
import { Icone, ICONES } from "../components/ui";
import { STATIONS } from "../data/hydro";

interface Props {
  aller: (i: number) => void;
  valide: boolean[];
  bilanDeverrouille: boolean;
}

const ETAPES = [
  { i: 1, ico: ICONES.cube, titre: "Observer", sous: "Le modèle 3D de crue", txt: "Manipule la maquette numérique du bassin : étiage, crue décennale, centennale, record 2024, bassin de rétention.", duree: "10 min" },
  { i: 2, ico: ICONES.courbe, titre: "Analyser", sous: "Les limnigrammes des stations", txt: "Lis les vraies courbes de hauteur d’eau enregistrées par les capteurs des collèges et de Vigicrues, mesure pics et temps de montée.", duree: "20 min" },
  { i: 3, ico: ICONES.balance, titre: "Raisonner", sous: "Aléa × Enjeux = Risque", txt: "Croise scénarios de crue et zones exposées pour prédire le niveau de risque et justifier ton raisonnement.", duree: "15 min" },
  { i: 4, ico: ICONES.diplome, titre: "Retenir", sous: "Bilan-correction", txt: "L’essentiel à retenir : notions clés, savoir-faire, bons réflexes. Déverrouillé par le code du professeur.", duree: "10 min" },
];

export default function Accueil({ aller, valide, bilanDeverrouille }: Props) {
  const n = valide.filter(Boolean).length;
  return (
    <section className="etape">
      {/* HERO */}
      <div className="relative mb-5 overflow-hidden rounded-2xl border border-[var(--filet)] shadow-[var(--ombre-forte)]">
        <img src="images/huveaune-hero.jpg" alt="L’Huveaune en crue sous un ciel d’orage, en Provence" className="h-[380px] w-full object-cover md:h-[440px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,30,45,.88)] via-[rgba(10,30,45,.55)] to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <p className="m-0 mb-2 font-mono text-[0.72rem] font-bold uppercase tracking-[2px] text-cyan-clair">Atelier interactif · Cycle 4 · Géographie / SVT</p>
          <h1 className="m-0 max-w-[16ch] font-titres text-4xl font-black leading-[1.05] text-white md:text-5xl">
            L’Huveaune en crue
          </h1>
          <p className="mb-5 mt-3 max-w-[52ch] text-[0.98rem] leading-relaxed text-white/90">
            Comprendre l’<b>aléa</b>, repérer les <b>enjeux</b>, évaluer le <b>risque</b> — à partir d’un modèle 3D et des données mesurées sur le terrain par les collèges du bassin versant.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn--action" onClick={() => aller(1)}>
              Commencer la mission <Icone d={ICONES.fleche} className="h-4 w-4" />
            </button>
            <button type="button" className="btn btn--fantome" onClick={() => aller(2)}>
              <Icone d={ICONES.courbe} className="h-4 w-4" /> Voir les limnigrammes
            </button>
            {n > 0 && (
              <span className="rounded-full bg-white/15 px-3 py-1.5 font-mono text-[0.78rem] font-bold text-white backdrop-blur">
                Progression : {n}/3 activités {bilanDeverrouille && "· bilan ouvert"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CHIFFRES CLÉS */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { v: "48 km", l: "de la source (Nans-les-Pins) à la mer (Marseille)" },
          { v: "≈ 520 km²", l: "de bassin versant, très urbanisé à l’aval" },
          { v: "77 m³/s", l: "pointe record à Aubagne le 8 oct. 2024" },
          { v: "0,07 m³/s", l: "à l’étiage de juillet 2022 — soit 1 000 fois moins" },
        ].map((c) => (
          <div key={c.v} className="boite !px-4 !py-3">
            <p className="m-0 font-mono text-xl font-bold text-bleu">{c.v}</p>
            <p className="legende m-0 mt-1 leading-snug">{c.l}</p>
          </div>
        ))}
      </div>

      {/* PARCOURS */}
      <div className="boite mb-5">
        <h3>Ta mission en 4 étapes</h3>
        <p className="legende m-0 mb-3">
          Tu es stagiaire au <b>Syndicat du bassin versant de l’Huveaune</b>. Avant la prochaine saison des pluies, tu dois expliquer au conseil municipal
          comment la rivière se comporte en crue et quels quartiers sont les plus exposés.
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {ETAPES.map((e) => {
            const fait = e.i >= 2 && e.i <= 4 && valide[e.i - 2];
            const verrou = e.i === 4 && !bilanDeverrouille;
            return (
              <button
                key={e.i}
                type="button"
                onClick={() => aller(e.i)}
                className="group relative flex flex-col items-start rounded-xl border border-[var(--filet)] bg-carte p-4 text-left transition hover:-translate-y-0.5 hover:border-bleu hover:shadow-[var(--ombre)]"
              >
                <div className="mb-3 flex w-full items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-encre text-carte group-hover:bg-bleu">
                    <Icone d={e.ico} />
                  </span>
                  <span className="font-mono text-[0.7rem] text-encre-2">Étape {e.i} · {e.duree}</span>
                </div>
                <p className="m-0 font-titres text-lg font-bold">{e.titre}</p>
                <p className="m-0 mb-2 text-[0.82rem] font-semibold text-bleu-fonce">{e.sous}</p>
                <p className="legende m-0">{e.txt}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-bleu">
                  {verrou ? (
                    <>
                      <Icone d={ICONES.verrou} className="h-3.5 w-3.5" /> Code requis
                    </>
                  ) : fait ? (
                    <>
                      <Icone d={ICONES.check} className="h-3.5 w-3.5 text-vert" /> <span className="text-vert">Validée</span>
                    </>
                  ) : (
                    <>
                      Ouvrir <Icone d={ICONES.fleche} className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CARTE + DONNÉES LOCALES */}
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="boite">
          <h3>Le bassin versant et ses stations de mesure</h3>
          <p className="legende m-0 mb-2">
            Depuis 2021, les collèges du bassin (Ubelka à Auriol, les 16 Fontaines à Saint-Zacharie) et les spéléologues du CDSC13 relèvent la hauteur
            d’eau avec des capteurs de pression, en complément des stations <b>Vigicrues</b> de Roquevaire et d’Aubagne. Ces données sont publiées sur
            l’observatoire <b>EduMed-Obs</b> (Université Côte d’Azur).
          </p>
          <CarteBassin actives={[]} />
          <div className="mt-2 flex flex-wrap gap-2">
            {STATIONS.map((s) => (
              <span key={s.id} className="chip">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.couleur }} />
                {s.nom} <b>{s.reseau}</b>
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="boite">
            <h3>Pourquoi cette rivière ?</h3>
            <p className="legende m-0">
              L’Huveaune est un <b>fleuve côtier méditerranéen</b> : petit bassin, pentes fortes, sols vite saturés, villes construites au bord de l’eau. Après un
              orage cévenol ou une tempête d’automne, la crue peut arriver en <b>quelques heures</b>. C’est un cas d’école pour étudier le risque inondation
              en classe… avec des données mesurées à deux pas du collège.
            </p>
          </div>
          <div className="boite bg-carte-chaude">
            <h3>Ce que tu vas savoir faire</h3>
            <ul className="m-0 list-disc pl-5 text-[0.86rem] leading-relaxed">
              <li>Lire un <b>limnigramme</b> et un <b>hyétogramme</b> (pic, temps de montée, décrue).</li>
              <li>Comparer plusieurs crues et plusieurs stations (amont → aval).</li>
              <li>Distinguer <b>aléa</b>, <b>enjeux</b>, <b>vulnérabilité</b> et <b>risque</b>.</li>
              <li>Proposer des mesures de prévention adaptées.</li>
            </ul>
          </div>
          <a
            className="boite flex items-center gap-3 !py-3 text-[0.84rem] no-underline transition hover:border-bleu"
            href="https://edumed.unice.fr/data-center/hydro/hydro-data/bv-huveaune.php"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan/15 text-bleu">
              <Icone d={ICONES.externe} />
            </span>
            <span>
              <b className="block text-encre">Source des données : EduMed-Obs · HYDRO Huveaune</b>
              <span className="text-encre-2">edumed.unice.fr — fichiers CSV et visualisation Csview</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
