import { getAdminGraphData } from "@/lib/admin-queries";
import { NetworkGraph } from "@/components/graph/NetworkGraph";
import { buildGraphNodes, buildGraphLinks } from "@/lib/graph";
import { saveGraphPositions } from "./actions";

export default async function AdminRetePage() {
  const { sections, entries, connections } = await getAdminGraphData();

  const nodes = buildGraphNodes(sections, entries);
  const links = buildGraphLinks(connections);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Rete</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Trascina i pallini per sistemarli come preferisci, poi salva. La
        disposizione salvata è quella che vedranno tutti i visitatori.
      </p>

      {nodes.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nessun contenuto ancora.
        </p>
      ) : (
        <div className="mt-8">
          <NetworkGraph
            nodes={nodes}
            links={links}
            editable
            onSave={saveGraphPositions}
          />
        </div>
      )}
    </div>
  );
}
