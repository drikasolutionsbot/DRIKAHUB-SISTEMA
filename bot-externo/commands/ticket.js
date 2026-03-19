const {
  SlashCommandBuilder,
} = require("discord.js");
const { getStoreConfig } = require("../supabase");
const { sendWithIdentity } = require("../handlers/webhookSender");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Enviar painel de tickets no canal atual"),

  async execute(interaction, tenant) {
    const storeConfig = await getStoreConfig(tenant.id);
    const embedColor = parseInt((storeConfig?.ticket_embed_color || "#5865F2").replace("#", ""), 16);

    const embed = new EmbedBuilder()
      .setTitle(storeConfig?.ticket_embed_title || "🎫 Ticket de Suporte")
      .setDescription(storeConfig?.ticket_embed_description || "Clique no botão abaixo para abrir um ticket de suporte.")
      .setColor(embedColor);

    if (storeConfig?.ticket_embed_footer) embed.setFooter({ text: storeConfig.ticket_embed_footer });
    if (storeConfig?.ticket_embed_image_url) embed.setImage(storeConfig.ticket_embed_image_url);
    if (storeConfig?.ticket_embed_thumbnail_url) embed.setThumbnail(storeConfig.ticket_embed_thumbnail_url);

    const button = new ButtonBuilder()
      .setCustomId(`ticket_open_${tenant.id}_${interaction.channel.id}`)
      .setLabel(storeConfig?.ticket_embed_button_label || "📩 Abrir Ticket")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await sendWithIdentity(interaction.channel, tenant, { embeds: [embed], components: [row] });
    await interaction.reply({ content: "✅ Painel de tickets enviado!", ephemeral: true });
  },
};
