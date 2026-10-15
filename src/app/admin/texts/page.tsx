import { getUiTexts } from "@/lib/queries";
import { UiTextsForm } from "@/components/admin/UiTextsForm";

export default async function AdminTextsPage() {
  const texts = await getUiTexts();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-4xl">Testi del sito</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Tutte le scritte fisse dell&apos;interfaccia: titoli, pulsanti, etichette, menu. Puoi
          cambiarle anche direttamente sul sito con <span className="text-foreground">✎ Modifica</span>.
          Nei titoli, una parola tra asterischi (es. <span className="text-foreground">*credo*</span>)
          diventa rosa in corsivo; <span className="text-foreground">{"{n}"}</span> è il numero che
          cambia da solo.
        </p>
      </div>
      <UiTextsForm texts={texts} />
    </div>
  );
}
