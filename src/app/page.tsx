import { getPublishedSections } from "@/lib/queries";
import { SectionCard } from "@/components/SectionCard";

export default async function Home() {
  const sections = await getPublishedSections();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Ciao, sono Greta
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Questo non è un CV. È un ritratto più completo di chi sono, oltre a
        competenze ed esperienze: valori, viaggi, attitudini e molto altro.
      </p>

      {sections.length === 0 ? (
        <p className="mt-12 text-sm text-zinc-500 dark:text-zinc-400">
          Nessuna sezione pubblicata ancora.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
