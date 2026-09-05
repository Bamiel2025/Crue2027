import { useState } from "react";
import { Etete, Icone, ICONES } from "../components/ui";

export default function BilanTab({ deverrouille }: { deverrouille: boolean }) {
  const [pleinEcran, setPleinEcran] = useState(false);

  return (
    <section className="etape">
      <Etete num="Bilan-correction" titre="L’essentiel à retenir — Cycle 4" valide={deverrouille} tamponTexte="CORRIGÉ ✓" />

      {/* Infographie : Comprendre les risques de crues */}
      <div className="boite mb-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="!mb-0">Infographie — Comprendre les risques de crues</h3>
            <p className="legende m-0">Document de référence illustrant le croisement entre l’aléa, la vulnérabilité et les enjeux.</p>
          </div>
          <button
            type="button"
            className="btn btn--fantome btn--petit inline-flex items-center gap-1.5"
            onClick={() => setPleinEcran(true)}
          >
            <Icone d={ICONES.externe} className="h-4 w-4" />
            Afficher en grand / Plein écran
          </button>
        </div>
        <div
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-[var(--filet)] bg-carte shadow-sm transition hover:shadow-md"
          onClick={() => setPleinEcran(true)}
        >
          <img
            src="images/comprendre-les-risques-de-crues.jpg"
            alt="Infographie Comprendre les risques de crues"
            className="max-h-[500px] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-encre/10 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-full bg-encre/90 px-4 py-2 font-mono text-[0.82rem] font-bold text-white shadow-lg backdrop-blur">
              <Icone d={ICONES.externe} className="h-4 w-4" /> Cliquer pour agrandir en plein écran
            </span>
          </div>
        </div>
      </div>

      {/* Modal plein écran de l'infographie */}
      {pleinEcran && (
        <div
          className="modal-fond fixed inset-0 z-[1500] flex flex-col bg-[rgba(10,28,44,.92)] p-4 backdrop-blur-sm"
          onClick={() => setPleinEcran(false)}
        >
          <div className="flex items-center justify-between pb-3 text-white">
            <h3 className="m-0 font-titres text-lg font-bold text-white">
              Comprendre les risques de crues — Infographie
            </h3>
            <button
              type="button"
              className="btn btn--fantome btn--petit text-white"
              onClick={() => setPleinEcran(false)}
            >
              <Icone d={ICONES.croix} className="h-5 w-5" /> Fermer
            </button>
          </div>
          <div
            className="relative flex flex-1 items-center justify-center overflow-auto rounded-xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="images/comprendre-les-risques-de-crues.jpg"
              alt="Infographie Comprendre les risques de crues"
              className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      <div className="boite mb-4">
        <h3>① Les trois notions clés (et une quatrième)</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Aléa", <>Phénomène naturel potentiellement dangereux. Il se décrit par son <b>intensité</b> (hauteur d’eau, débit, vitesse) et sa <b>fréquence</b> — la <b>période de retour T</b> : une crue dite « décennale » revient <i>en moyenne</i> tous les 10 ans, pas nécessairement tous les 10 ans !</>],
            ["Enjeux", <>Ce qui est exposé : <b>personnes</b>, habitations, collège, gymnase, routes, activités économiques… Un même aléa ne produit pas le même risque selon ce qui se trouve sur son passage.</>],
            ["Risque", <>Croisement de l’aléa et des enjeux. <b>Risque = Aléa × Enjeux</b>. Sans enjeu (un champ, une zone vide), il peut y avoir une crue mais pas de risque pour la population.</>],
            ["Prévention", <>On ne supprime pas l’aléa, on peut le <b>réduire</b> (bassin de rétention, méandres, digues) et surtout <b>réduire la vulnérabilité</b> des enjeux : PPRI, règles de construction, information, exercices d’évacuation, vigilance crues.</>],
          ].map(([t, c]) => (
            <div key={t as string} className="rounded-lg border border-[var(--filet)] bg-carte p-3">
              <h4 className="m-0 mb-1 font-titres text-[0.98rem] font-bold text-bleu-fonce">{t}</h4>
              <p className="m-0 text-[0.88rem]">{c}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div className="boite">
          <h3>② Ce qu’il faut savoir faire</h3>
          <ul className="m-0 list-disc pl-5 text-[0.88rem] leading-relaxed">
            <li><b>Lire un limnigramme</b> : repérer le pic (hauteur max et heure), le temps de montée, la vitesse de montée, la durée de la décrue — et vérifier l’échelle de l’axe !</li>
            <li><b>Relier pluie et crue</b> : le hyétogramme précède toujours le pic ; le décalage est le temps de réponse du bassin.</li>
            <li><b>Comparer des stations</b> : l’onde de crue se propage de l’amont vers l’aval (≈ 5 à 8 km/h sur l’Huveaune) et grossit avec les affluents.</li>
            <li><b>Associer intensité et fréquence</b> : plus une crue est rare, plus elle peut être intense (centennale &gt; décennale &gt; fréquente).</li>
            <li><b>Déterminer un risque</b> : croiser la zone exposée et le scénario, en tenant compte de la vulnérabilité de l’enjeu.</li>
            <li><b>Proposer des mesures</b> : réduction de l’aléa (ouvrages) ou de la vulnérabilité (aménagement, prévision, alerte).</li>
          </ul>
        </div>
        <div className="boite">
          <h3>③ Exemples locaux — l’Huveaune</h3>
          <p className="legende m-0">
            Fleuve côtier des Bouches-du-Rhône et du Var (48 km), de Nans-les-Pins à la mer à Marseille, très urbanisé sur son cours aval. Temps de réponse très court : la crue arrive en <b>quelques heures</b> après de fortes pluies.
          </p>
          <div className="note mt-2">
            <b>10 mars 2024</b> — tempête Monica : record du débit moyen journalier (26,6 m³/s) à Aubagne après 36 h de pluie.
            <br /><b>8 octobre 2024</b> — tempête Kirk : pointe instantanée record de 77 m³/s, montée en ≈ 8 h, vigilance orange.
            <br /><b>Juillet 2022</b> — étiage sévère : ≈ 0,07 m³/s, lit à sec par endroits.
          </div>
          <p className="legende m-0 mt-2">
            Les mesures des capteurs des collèges Ubelka (Auriol) et des 16 Fontaines (Saint-Zacharie) alimentent l’observatoire <b>EduMed-Obs</b> : de vraies données scientifiques produites par des élèves.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="boite">
          <h3>④ Les bons réflexes en cas de crue</h3>
          <ul className="m-0 list-disc pl-5 text-[0.88rem] leading-relaxed">
            <li>S’informer : <b>vigilance crues</b> et vigilance météo (jaune → orange → rouge).</li>
            <li>Ne pas aller voir la rivière, ne pas traverser une route inondée (30 cm d’eau emportent une voiture).</li>
            <li>Se réfugier en hauteur, ne pas rester en sous-sol ni au rez-de-chaussée.</li>
            <li>Ne pas aller chercher les enfants à l’école : ils y sont en sécurité (PPMS).</li>
            <li>Suivre les consignes des autorités.</li>
          </ul>
        </div>
        <div className="boite">
          <h3>⑤ À retenir</h3>
          <div className="succes-bloc">
            <b>Risque = Aléa × Enjeux.</b>
            <br />• L’aléa a une intensité et une fréquence (période de retour).
            <br />• Le limnigramme décrit l’intensité : pic, temps de montée, durée.
            <br />• Les enjeux sont les personnes et les biens exposés.
            <br />• La vulnérabilité peut être réduite par la prévention.
            <br />• Les ouvrages (bassin, méandres) réduisent l’aléa mais ne l’annulent pas.
          </div>
        </div>
      </div>
    </section>
  );
}
