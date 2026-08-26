"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { VideoEmbed } from "@/lib/tiptap/videoEmbedNode";
import { parseVideoUrl } from "@/lib/video-url";
import { legacyTextToHtml, looksLikeHtml } from "@/lib/rich-content";
import { createClient } from "@/lib/supabase/client";
import { getMediaUrl } from "@/lib/supabase/media";

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm ${
        active
          ? "bg-primary text-white"
          : "text-zinc-600 hover:bg-black/[.06] dark:text-zinc-300 dark:hover:bg-white/[.1]"
      }`}
    >
      {children}
    </button>
  );
}

async function uploadToMedia(mediaPathPrefix: string, entryId: string, file: File) {
  const supabase = createClient();
  const path = `${mediaPathPrefix}/${entryId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) throw error;
  return getMediaUrl(path);
}

export function RichBodyEditor({
  entryId,
  initialContent,
  mediaPathPrefix = "entries",
  fieldName = "body",
}: {
  entryId: string;
  initialContent: string;
  mediaPathPrefix?: string;
  fieldName?: string;
}) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [videoPromptOpen, setVideoPromptOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, TiptapImage, VideoEmbed],
    content: looksLikeHtml(initialContent)
      ? initialContent
      : legacyTextToHtml(initialContent),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "rich-content min-h-[200px] rounded-b-lg border border-t-0 border-black/[.12] px-4 py-3 text-sm outline-none dark:border-white/[.16]",
      },
    },
    onUpdate: ({ editor }: { editor: Editor }) => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = editor.getHTML();
      }
    },
  });

  useEffect(() => {
    if (editor && hiddenInputRef.current) {
      hiddenInputRef.current.value = editor.getHTML();
    }
  }, [editor]);

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploading(true);
    try {
      const url = await uploadToMedia(mediaPathPrefix, entryId, file);
      editor.chain().focus("end").setImage({ src: url }).run();
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploading(true);
    try {
      const url = await uploadToMedia(mediaPathPrefix, entryId, file);
      editor
        .chain()
        .focus("end")
        .setVideoEmbed({ provider: "upload", src: url })
        .run();
      setVideoPromptOpen(false);
    } finally {
      setUploading(false);
    }
  }

  function handleVideoUrlSubmit() {
    if (!editor) return;
    const parsed = parseVideoUrl(videoUrl);
    if (!parsed) {
      setVideoError("Non riconosco questo link. Usa un URL YouTube o Vimeo.");
      return;
    }
    editor
      .chain()
      .focus("end")
      .setVideoEmbed({ provider: parsed.provider, src: parsed.embedUrl })
      .run();
    setVideoUrl("");
    setVideoError(null);
    setVideoPromptOpen(false);
  }

  function handleSetLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del link:", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-black/[.12] bg-zinc-50 p-2 dark:border-white/[.16] dark:bg-zinc-900">
        <ToolbarButton
          label="Grassetto"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          label="Corsivo"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          label="Titolo"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Sottotitolo"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          label="Elenco puntato"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •—
        </ToolbarButton>
        <ToolbarButton
          label="Elenco numerato"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={handleSetLink}
        >
          🔗
        </ToolbarButton>

        <label className="cursor-pointer rounded px-2 py-1 text-sm text-zinc-600 hover:bg-black/[.06] dark:text-zinc-300 dark:hover:bg-white/[.1]">
          🖼 Immagine
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImagePick}
          />
        </label>

        <button
          type="button"
          onClick={() => setVideoPromptOpen((v) => !v)}
          className="rounded px-2 py-1 text-sm text-zinc-600 hover:bg-black/[.06] dark:text-zinc-300 dark:hover:bg-white/[.1]"
        >
          🎬 Video
        </button>

        {uploading && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Caricamento…
          </span>
        )}
      </div>

      {videoPromptOpen && (
        <div className="flex flex-wrap items-center gap-2 border-x border-black/[.12] bg-zinc-50 p-2 text-sm dark:border-white/[.16] dark:bg-zinc-900">
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Incolla link YouTube o Vimeo"
            className="flex-1 rounded border border-black/[.12] bg-transparent px-2 py-1 text-sm outline-none dark:border-white/[.16]"
          />
          <button
            type="button"
            onClick={handleVideoUrlSubmit}
            className="rounded border border-black/[.12] px-3 py-1 dark:border-white/[.16]"
          >
            Inserisci link
          </button>
          <span className="text-zinc-500 dark:text-zinc-400">oppure</span>
          <label className="cursor-pointer rounded border border-black/[.12] px-3 py-1 dark:border-white/[.16]">
            Carica file
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoFilePick}
            />
          </label>
          {videoError && <p className="w-full text-xs text-red-600">{videoError}</p>}
        </div>
      )}

      <EditorContent editor={editor} />
      <input ref={hiddenInputRef} type="hidden" name={fieldName} />
    </div>
  );
}
