import { Etete, Icone, ICONES } from "../components/ui";

export default function Modele3D({ suivant }: { suivant: () => void }) {
  return (
    <section className="etape">
      <Etete num="Étape 1 · Observer" titre="La simulation de crue — bassin de l'Huveaune" />
      <div className="relative mb-4 overflow-hidden rounded-xl border border-[var(--filet)] bg-[#0d1522] shadow-[var(--ombre)]">
        <a
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-[var(--filet-fort)] bg-carte/95 px-3 py-1 text-[0.75rem] font-semibold text-encre no-underline shadow-[var(--ombre)]"
          href="cruefinal.html"
          target="_blank"
          rel="noopener"
        >
          <Icone d={ICONES.externe} className="h-3.5 w-3.5" /> Ouvrir en grand
        </a>
        <iframe
          src="cruefinal.html"
          title="Modèle 3D de simulation de crue de l'Huveaune"
          loading="lazy"
          allow="fullscreen"
          className="block h-[62vh] w-full border-0 bg-[#0d1522] md:h-[78vh]"
        />
      </div>
      <div className="boite mb-4">
        <h3>Consignes d'observation</h3>
        <p className="legende m-0">Manipule la scène 3D ci-dessus : tourne la vue à la souris, molette pour zoomer. Active les scénarios en bas d'écran.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="chip"><b>Étiage</b> — la rivière au plus bas</span>
          <span className="chip"><b>Crue fréquente</b> — débordements localisés</span>
          <span className="chip"><b>Crue décennale</b> — T = 10 ans</span>
          <span className="chip"><b>Crue centennale</b> — T = 100 ans</span>
          <span className="chip"><b>Crue record 2024</b> — tempête Kirk, 77 m³/s</span>
          <span className="chip"><b>Bassin de rétention</b> — réduire l'aléa</span>
        </div>
        <p className="astuce mt-3">
          💡 Coche le <b>bassin de rétention</b> puis relance une crue fréquente : observe comment l'ouvrage diminue la hauteur d'eau. En crue centennale, l'ouvrage
          est saturé et ne suffit plus : le risque reste élevé.
        </p>
        <p className="note mt-2">
          Si la scène 3D ne s'affiche pas, le fichier <code>cruefinal.html</code> doit être placé à côté de cette page. Tu peux passer directement à l'analyse des
          limnigrammes, qui repose sur des données réelles.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="boite">
          <h3>Étiage — la rivière presque à sec</h3>
          <p className="m-0 text-[0.9rem]">
            À l'<b>étiage</b> (juillet 2022), le débit tombe à environ <b>0,07 m³/s</b> à Aubagne, pour un débit moyen annuel proche de 0,8 m³/s. Le lit est à sec par
            endroits à Aubagne et à Saint-Giniez (Marseille).
          </p>
        </div>
        <div className="boite">
          <h3>Crue — quelques heures suffisent</h3>
          <p className="m-0 text-[0.9rem]">
            Le même cours d'eau peut passer de la sécheresse à une <b>crue dévastatrice</b> en quelques heures d'orage : 77 m³/s le 8 octobre 2024, soit plus de{" "}
            <b>1 000 fois</b> le débit d'étiage.
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button type="button" className="btn btn--action" onClick={suivant}>
          Passer à l'analyse des limnigrammes <Icone d={ICONES.fleche} className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
