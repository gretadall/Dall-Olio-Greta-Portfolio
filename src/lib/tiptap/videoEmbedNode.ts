import { Node, mergeAttributes } from "@tiptap/core";

export type VideoProvider = "youtube" | "vimeo" | "upload";

export interface VideoEmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (options: {
        provider: VideoProvider;
        src: string;
      }) => ReturnType;
    };
  }
}

export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      provider: {
        default: "upload",
        parseHTML: (element) => element.getAttribute("data-provider"),
        renderHTML: (attributes) => ({ "data-provider": attributes.provider }),
      },
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-src"),
        renderHTML: (attributes) => ({ "data-src": attributes.src }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-video-embed]" }];
  },

  renderHTML({ node }) {
    const provider = node.attrs.provider as VideoProvider;
    const src = node.attrs.src as string;

    const wrapperAttrs = mergeAttributes(this.options.HTMLAttributes, {
      "data-video-embed": "",
      "data-provider": provider,
      "data-src": src,
      class: "video-embed",
    });

    if (provider === "upload") {
      return [
        "div",
        wrapperAttrs,
        ["video", { src, controls: "true", style: "width: 100%;" }],
      ];
    }

    return [
      "div",
      wrapperAttrs,
      [
        "iframe",
        {
          src,
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: "true",
          frameborder: "0",
          style: "width: 100%; aspect-ratio: 16 / 9;",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideoEmbed:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },
});
