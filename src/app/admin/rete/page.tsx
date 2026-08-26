import { getAdminGraphData } from "@/lib/admin-queries";
import { getBrainAreaContent } from "@/lib/queries";
import { buildGraphNodes, buildGraphLinks } from "@/lib/graph";
import { mergeBrainAreaContent } from "@/lib/brain-areas";
import { BrainGraphLoader } from "@/components/graph/BrainGraphLoader";

export default async function AdminRetePage() {
  const [{ sections, entries, connections }, areaRows] = await Promise.all([
    getAdminGraphData(),
    getBrainAreaContent(),
  ]);

  const nodes = buildGraphNodes(sections, entries);
  const links = buildGraphLinks(connections);
  const areaContent = mergeBrainAreaContent(areaRows);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Rete</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Anteprima della rete 3D. Attiva la modalità modifica per trascinare i
        punti sulla superficie del cervello o modificare il testo delle zone
        — per spostare un nodo in un&apos;altra area cerebrale, apri il
        contenuto e cambia &quot;Area cerebrale&quot; nel suo modulo di
        modifica.
      </p>

      {nodes.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nessun contenuto ancora.
        </p>
      ) : (
        <div className="mt-8">
          <BrainGraphLoader nodes={nodes} links={links} areaContent={areaContent} />
        </div>
      )}
    </div>
  );
}
