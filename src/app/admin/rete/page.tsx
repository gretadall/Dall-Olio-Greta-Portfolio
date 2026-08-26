import { getAdminGraphData } from "@/lib/admin-queries";
import { buildGraphNodes, buildGraphLinks } from "@/lib/graph";
import { BrainGraphLoader } from "@/components/graph/BrainGraphLoader";

export default async function AdminRetePage() {
  const { sections, entries, connections } = await getAdminGraphData();

  const nodes = buildGraphNodes(sections, entries);
  const links = buildGraphLinks(connections);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Rete</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Anteprima di come i visitatori vedono la rete 3D. Per spostare un
        nodo in un&apos;altra area cerebrale, apri il contenuto e cambia
        &quot;Area cerebrale&quot; nel suo modulo di modifica.
      </p>

      {nodes.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nessun contenuto ancora.
        </p>
      ) : (
        <div className="mt-8">
          <BrainGraphLoader nodes={nodes} links={links} />
        </div>
      )}
    </div>
  );
}
