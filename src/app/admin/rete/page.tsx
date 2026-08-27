import { getAdminGraphData } from "@/lib/admin-queries";
import { getBrainAreaContent, getSiteSettings } from "@/lib/queries";
import { buildGraphNodes, buildGraphLinks } from "@/lib/graph";
import { mergeBrainAreaContent } from "@/lib/brain-areas";
import { BrainGraphLoader } from "@/components/graph/BrainGraphLoader";

export default async function AdminRetePage() {
  const [{ sections, entries, connections }, areaRows, settings] = await Promise.all([
    getAdminGraphData(),
    getBrainAreaContent(),
    getSiteSettings(),
  ]);

  const nodes = buildGraphNodes(sections, entries);
  const links = buildGraphLinks(connections);
  const areaContent = mergeBrainAreaContent(areaRows);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Rete</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Anteprima della rete 3D. Attiva la modalità modifica per trascinare i
        punti sulla superficie del cervello (trascinarlo in una zona diversa
        ne aggiorna anche l&apos;area cerebrale) o modificare il testo delle
        zone e della pagina.
      </p>

      {nodes.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nessun contenuto ancora.
        </p>
      ) : (
        <div className="mt-8">
          <BrainGraphLoader
            nodes={nodes}
            links={links}
            areaContent={areaContent}
            noteText={settings.rete_note ?? "Clicca una zona colorata per scoprire a cosa corrisponde."}
          />
        </div>
      )}
    </div>
  );
}
