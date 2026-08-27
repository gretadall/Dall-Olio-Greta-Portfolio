import { getPublicGraphData, getBrainAreaContent, getSiteSettings } from "@/lib/queries";
import { buildGraphNodes, buildGraphLinks } from "@/lib/graph";
import { mergeBrainAreaContent } from "@/lib/brain-areas";
import { BrainGraphLoader } from "@/components/graph/BrainGraphLoader";
import { EditableText } from "@/components/edit/EditableText";

export default async function RetePage() {
  const [{ sections, entries, connections }, areaRows, settings] = await Promise.all([
    getPublicGraphData(),
    getBrainAreaContent(),
    getSiteSettings(),
  ]);

  const nodes = buildGraphNodes(sections, entries);
  const links = buildGraphLinks(connections);
  const areaContent = mergeBrainAreaContent(areaRows);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <EditableText
        as="h1"
        className="text-3xl font-semibold tracking-tight"
        value={settings.rete_title ?? "Rete di connessioni"}
        target={{ table: "site_settings", field: "rete_title" }}
      />
      <EditableText
        as="p"
        className="mt-3 max-w-2xl text-muted"
        value={
          settings.rete_intro ??
          "Come le esperienze si intrecciano e contribuiscono a formare chi sono."
        }
        target={{ table: "site_settings", field: "rete_intro" }}
        multiline
      />

      {nodes.length === 0 ? (
        <p className="mt-12 text-sm text-muted">
          Nessun contenuto pubblicato ancora.
        </p>
      ) : (
        <div className="mt-12">
          <EditableText
            as="p"
            className="mb-3 text-sm text-muted"
            value={
              settings.rete_hint ??
              "Il cervello ruota da solo — trascinalo per girarlo come vuoi. Clicca su un punto per vedere i suoi collegamenti, o su una zona colorata per scoprire a cosa corrisponde."
            }
            target={{ table: "site_settings", field: "rete_hint" }}
            multiline
          />
          <BrainGraphLoader
            nodes={nodes}
            links={links}
            areaContent={areaContent}
            noteText={settings.rete_note ?? "Clicca una zona colorata per scoprire a cosa corrisponde."}
          />
          <EditableText
            as="p"
            className="mt-4 text-xs text-muted"
            value={
              settings.rete_disclaimer ??
              "Le aree cerebrali sono un'interpretazione artistica, non un modello scientifico."
            }
            target={{ table: "site_settings", field: "rete_disclaimer" }}
            multiline
          />
        </div>
      )}
    </div>
  );
}
