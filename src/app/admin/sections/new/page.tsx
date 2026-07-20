import { SectionForm } from "@/components/admin/SectionForm";
import { createSection } from "../actions";

export default function NewSectionPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Nuova sezione</h1>
      <SectionForm action={createSection} submitLabel="Crea sezione" />
    </div>
  );
}
