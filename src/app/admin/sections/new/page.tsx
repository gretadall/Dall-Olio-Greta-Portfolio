import { SectionForm } from "@/components/admin/SectionForm";
import { createSection } from "../actions";

export default function NewSectionPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl">Nuova sezione</h1>
      <SectionForm action={createSection} submitLabel="Crea sezione" />
    </div>
  );
}
