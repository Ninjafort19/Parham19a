
require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent]
});

let ticketCount = 0;

client.once('ready', () => {
  console.log(`🎟️ Bot is ready as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'create_ticket') {
    const existing = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.id}`);
    if (existing) return interaction.reply({ content: 'شما یک تیکت باز دارید.', ephemeral: true });

    ticketCount++;
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: process.env.TICKET_CATEGORY_ID,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: process.env.SUPPORT_ROLE_ID,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        }
      ]
    });

    const closeButton = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('بستن تیکت')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);

    await channel.send({
      content: `<@${interaction.user.id}> تیکت شما ایجاد شد.`,
      components: [row]
    });

    await interaction.reply({ content: 'تیکت شما ساخته شد.', ephemeral: true });
  }

  if (interaction.customId === 'close_ticket') {
    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm_close')
      .setLabel('تأیید بستن')
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel_close')
      .setLabel('لغو')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

    await interaction.reply({ content: 'آیا مطمئنی می‌خوای تیکت رو ببندی؟', components: [row], ephemeral: true });
  }

  if (interaction.customId === 'confirm_close') {
    await interaction.channel.send('🔒 این تیکت بسته شد و به‌زودی حذف می‌شود.');
    setTimeout(() => interaction.channel.delete(), 5000);
  }

  if (interaction.customId === 'cancel_close') {
    await interaction.reply({ content: 'بستن تیکت لغو شد.', ephemeral: true });
  }
});

client.on('ready', async () => {
  const channel = await client.guilds.cache.get(process.env.GUILD_ID)?.channels.fetch();
  console.log('✅ Bot is connected to the server.');
});

client.login(process.env.DISCORD_TOKEN);
