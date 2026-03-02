import { useState } from "react";
import { Code, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import EmbedForm from "./EmbedForm";
import EmbedPreview from "./EmbedPreview";
import { defaultEmbed, type EmbedData } from "./types";

const EmbedBuilder = () => {
  const [embed, setEmbed] = useState<EmbedData>({ ...defaultEmbed });

  const generateJson = () => {
    const obj: Record<string, any> = {};
    if (embed.title) obj.title = embed.title;
    if (embed.description) obj.description = embed.description;
    if (embed.url) obj.url = embed.url;
    if (embed.color) obj.color = parseInt(embed.color.replace("#", ""), 16);
    if (embed.author_name) {
      obj.author = { name: embed.author_name };
      if (embed.author_icon_url) obj.author.icon_url = embed.author_icon_url;
      if (embed.author_url) obj.author.url = embed.author_url;
    }
    if (embed.thumbnail_url) obj.thumbnail = { url: embed.thumbnail_url };
    if (embed.image_url) obj.image = { url: embed.image_url };
    if (embed.fields.length > 0) {
      obj.fields = embed.fields.map(f => ({
        name: f.name || "​",
        value: f.value || "​",
        inline: f.inline,
      }));
    }
    if (embed.footer_text || embed.footer_icon_url) {
      obj.footer = {};
      if (embed.footer_text) obj.footer.text = embed.footer_text;
      if (embed.footer_icon_url) obj.footer.icon_url = embed.footer_icon_url;
    }
    if (embed.timestamp) obj.timestamp = new Date().toISOString();
    return JSON.stringify(obj, null, 2);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(generateJson());
    toast.success("JSON copiado!");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Form */}
      <Card className="p-5 bg-sidebar border-border overflow-y-auto max-h-[700px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-primary inline-block" />
            Editor
          </h3>
          <Button variant="outline" size="sm" onClick={copyJson}>
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar JSON
          </Button>
        </div>
        <EmbedForm embed={embed} onChange={setEmbed} />
      </Card>

      {/* Preview */}
      <Card className="border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-sidebar">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Preview</span>
        </div>
        <div className="bg-[#36393f] min-h-[400px]">
          <EmbedPreview embed={embed} />
        </div>
      </Card>
    </div>
  );
};

export default EmbedBuilder;
