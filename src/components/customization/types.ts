export interface EmbedField {
  id: string;
  name: string;
  value: string;
  inline: boolean;
}

export interface EmbedData {
  color: string;
  author_name: string;
  author_icon_url: string;
  author_url: string;
  title: string;
  url: string;
  description: string;
  thumbnail_url: string;
  image_url: string;
  footer_text: string;
  footer_icon_url: string;
  timestamp: boolean;
  fields: EmbedField[];
}

export const defaultEmbed: EmbedData = {
  color: "#5865F2",
  author_name: "",
  author_icon_url: "",
  author_url: "",
  title: "Título do Embed",
  url: "",
  description: "Esta é a descrição do embed. Você pode usar **negrito**, *itálico* e outros formatos.",
  thumbnail_url: "",
  image_url: "",
  footer_text: "",
  footer_icon_url: "",
  timestamp: false,
  fields: [],
};
