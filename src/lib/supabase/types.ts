// Hand-written to match supabase/migrations/*.sql. Once the project is linked,
// prefer regenerating with `supabase gen types typescript` and replacing this file.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      sections: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          background_image_path: string | null;
          background_opacity: number;
          sort_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sections"]["Row"]> & {
          slug: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["sections"]["Row"]>;
        Relationships: [];
      };
      entries: {
        Row: {
          id: string;
          section_id: string;
          slug: string;
          title: string;
          description: string | null;
          body: string | null;
          period_start: string | null;
          period_end: string | null;
          location: string | null;
          metadata: Record<string, unknown>;
          sort_order: number;
          is_published: boolean;
          graph_x: number | null;
          graph_y: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["entries"]["Row"]> & {
          section_id: string;
          slug: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["entries"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "entries_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "sections";
            referencedColumns: ["id"];
          },
        ];
      };
      entry_media: {
        Row: {
          id: string;
          entry_id: string;
          storage_path: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["entry_media"]["Row"]> & {
          entry_id: string;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["entry_media"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "entry_media_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "entries";
            referencedColumns: ["id"];
          },
        ];
      };
      likes: {
        Row: {
          entry_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["likes"]["Row"]> & {
          entry_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["likes"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "likes_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          entry_id: string;
          user_id: string;
          body: string;
          is_hidden: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["comments"]["Row"]> & {
          entry_id: string;
          user_id: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "comments_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["follows"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["follows"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "follows_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      connections: {
        Row: {
          id: string;
          from_entry_id: string;
          to_entry_id: string;
          label: string;
          bidirectional: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["connections"]["Row"]> & {
          from_entry_id: string;
          to_entry_id: string;
          label: string;
        };
        Update: Partial<Database["public"]["Tables"]["connections"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "connections_from_entry_id_fkey";
            columns: ["from_entry_id"];
            isOneToOne: false;
            referencedRelation: "entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_to_entry_id_fkey";
            columns: ["to_entry_id"];
            isOneToOne: false;
            referencedRelation: "entries";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          id: boolean;
          site_title: string;
          tagline: string | null;
          owner_name: string | null;
          hero_photo_path: string | null;
          hero_photo_size: number;
          hero_photo_radius: number;
          primary_color: string;
          accent_color: string;
          font_choice: string;
          font_color: string | null;
          muted_color: string | null;
          background_color: string | null;
          background_image_path: string | null;
          linkedin_url: string | null;
          contact_email: string | null;
          splash_enabled: boolean;
          splash_image_path: string | null;
          splash_title: string | null;
          splash_message: string | null;
          splash_duration_seconds: number;
          nav_home_label: string;
          nav_rete_label: string;
          linkedin_label: string;
          contact_button_label: string;
          footer_text: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_settings"]["Row"]> & {
          id: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
