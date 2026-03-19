const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

// ── /clear ──
async function handleClear(interaction, tenant) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: "❌ Você não tem permissão para limpar mensagens.", ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;
  let totalDeleted = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const msgs = await channel.messages.fetch({ limit: 100 });
      if (msgs.size === 0) { hasMore = false; break; }

      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const recent = msgs.filter((m) => m.createdTimestamp > twoWeeksAgo);
      const old = msgs.filter((m) => m.createdTimestamp <= twoWeeksAgo);

      if (recent.size >= 2) {
        const deleted = await channel.bulkDelete(recent, true);
        totalDeleted += deleted.size;
      } else if (recent.size === 1) {
        await recent.first().delete();
        totalDeleted += 1;
      }

      for (const [, m] of old) {
        try { await m.delete(); totalDeleted++; } catch {}
      }

      if (msgs.size < 100) hasMore = false;
      await new Promise((r) => setTimeout(r, 1000));
    } catch { hasMore = false; }
  }

  await interaction.editReply({ content: `✅ Canal limpo! ${totalDeleted} mensagem(ns) deletada(s).` });
}

// ── /ban ──
async function handleBan(interaction, tenant) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return interaction.reply({ content: "❌ Você não tem permissão para banir membros.", ephemeral: true });
  }

  const targetUser = interaction.options.getUser("usuario");
  const reason = interaction.options.getString("motivo") || "Sem motivo especificado";
  if (!targetUser) return interaction.reply({ content: "❌ Especifique um usuário.", ephemeral: true });

  await interaction.deferReply({ ephemeral: true });

  try {
    await interaction.guild.members.ban(targetUser, { reason, deleteMessageSeconds: 604800 });
    await interaction.editReply({
      embeds: [new EmbedBuilder().setTitle("🔨 Usuário Banido").setDescription(`<@${targetUser.id}> foi banido por <@${interaction.user.id}>.`).addFields({ name: "Motivo", value: reason }).setColor(0x2B2D31).setTimestamp()],
    });
  } catch {
    await interaction.editReply({ content: "❌ Erro ao banir o usuário." });
  }
}

// ── /kick ──
async function handleKick(interaction, tenant) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
    return interaction.reply({ content: "❌ Você não tem permissão para expulsar membros.", ephemeral: true });
  }

  const targetUser = interaction.options.getUser("usuario");
  const reason = interaction.options.getString("motivo") || "Sem motivo especificado";
  if (!targetUser) return interaction.reply({ content: "❌ Especifique um usuário.", ephemeral: true });

  await interaction.deferReply({ ephemeral: true });

  try {
    await interaction.guild.members.kick(targetUser, reason);
    await interaction.editReply({
      embeds: [new EmbedBuilder().setTitle("👢 Usuário Expulso").setDescription(`<@${targetUser.id}> foi expulso por <@${interaction.user.id}>.`).addFields({ name: "Motivo", value: reason }).setColor(0x2B2D31).setTimestamp()],
    });
  } catch {
    await interaction.editReply({ content: "❌ Erro ao expulsar o usuário." });
  }
}

module.exports = { handleClear, handleBan, handleKick };
