import { getPublicGraphData, getBrainAreaContent } from "@/lib/queries";
import { buildGraphNodes, buildGraphLinks } from "@/lib/graph";
import { mergeBrainAreaContent } from "@/lib/brain-areas";
import { BrainGraphLoader } from "@/components/graph/BrainGraphLoader";

export default async function RetePage() {
  const [{ sections, entries, connections }, areaRows] = await Promise.all([
    getPublicGraphData(),
    getBrainAreaContent(),
  ]);

  const nodes = buildGraphNodes(sections, entries);
  const links = buildGraphLinks(connections);
  const areaContent = mergeBrainAreaContent(areaRows);

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
          <p className="mb-3 text-sm text-muted">
            Il cervello ruota da solo — trascinalo per girarlo come vuoi.
            Clicca su un punto per vedere i suoi collegamenti, o su una zona
            colorata per scoprire a cosa corrisponde.
          </p>
          <BrainGraphLoader nodes={nodes} links={links} areaContent={areaContent} />
          <p className="mt-4 text-xs text-muted">
            Le aree cerebrali sono un&apos;interpretazione artistica, non un
            modello scientifico.
          </p>
        </div>
      )}
    </div>
  );
}
