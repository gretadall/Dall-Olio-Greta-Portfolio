import { getPublicGraphData } from "@/lib/queries";
import { NetworkGraph } from "@/components/graph/NetworkGraph";
import { buildGraphNodes, buildGraphLinks } from "@/lib/graph";

export default async function RetePage() {
  const { sections, entries, connections } = await getPublicGraphData();

  const nodes = buildGraphNodes(sections, entries);
  const links = buildGraphLinks(connections);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Rete di connessioni
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Come le esperienze si intrecciano e contribuiscono a formare chi sono.
      </p>

      {nodes.length === 0 ? (
        <p className="mt-12 text-sm text-muted">
          Nessun contenuto pubblicato ancora.
        </p>
      ) : (
        <div className="mt-12">
          <NetworkGraph nodes={nodes} links={links} />
        </div>
      )}
    </div>
  );
}
