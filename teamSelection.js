const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');

const handleTeamSelection = async (channel) => {
  const descriptionText = `**Team Yellow runs Tuesdays and Thursdays from 8:30pm to 11pm**\n**Team focus is currently: Mythic 2 Bosses/week**`;

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('green')
        .setLabel('Green')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('blue')
        .setLabel('Blue')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('red')
        .setLabel('Red')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('yellow')
        .setLabel('Yellow')
        .setStyle(ButtonStyle.Secondary)
    );

  const messages = await channel.messages.fetch({ limit: 10 });
  const botMessage = messages.find(msg => msg.author.bot && msg.content.includes('Which team are you interested in?'));

  if (!botMessage) {
    await channel.send({ content: `${descriptionText}\n\nWhich team are you interested in?`, components: [row] });
  }
};

const handleInteraction = async (interaction) => {
  if (!interaction.isButton()) return;

  let response;
  switch (interaction.customId) {
    case 'green':
      response = 'You chose the Green team! Green symbolizes growth and harmony.';
      break;
    case 'blue':
      response = 'You chose the Blue team! Blue represents calm and wisdom.';
      break;
    case 'red':
      response = 'You chose the Red team! Red stands for passion and energy.';
      break;
    case 'yellow':
      response = 'You chose the Yellow team! Yellow signifies happiness and positivity. A private channel has been created for you.';
      break;
  }

  await interaction.reply({ content: response, ephemeral: true });

  if (interaction.customId === 'yellow') {
    const userId = interaction.user.id;
    const guild = interaction.guild;
    const categoryId = '1264771704010444891';

    const nickname = interaction.member ? interaction.member.displayName : interaction.user.username;
    const channelName = `yellow-team-${nickname.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const category = guild.channels.cache.get(categoryId);
    console.log(`Fetched category: ${category ? category.name : 'not found'}`);

    if (!category) {
      console.error(`Category not found with ID: ${categoryId}`);
      return;
    }

    if (category.type !== ChannelType.GuildCategory) {
      console.error(`Channel with ID ${categoryId} is not a category.`);
      return;
    }

    const adminRole = guild.roles.cache.find(role => role.name === 'Admin');
    const permissionOverwrites = [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: userId,
        allow: [PermissionFlagsBits.ViewChannel]
      }
    ];

    if (adminRole) {
      permissionOverwrites.push({
        id: adminRole.id,
        allow: [PermissionFlagsBits.ViewChannel]
      });
    }

    const newChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites
    });

    const notifyUser = await interaction.client.users.fetch('215518311000047616');
    if (notifyUser) {
      notifyUser.send(`${nickname} has selected the Yellow team and a private channel has been created.`);
    }

    // Asking for inputs in the new channel
    const inGameNameQuestion = await newChannel.send('Please provide your In-Game Name:');
    const filter = response => response.author.id === userId;
    const inGameNameCollector = newChannel.createMessageCollector({ filter, max: 1, time: 60000 });

    inGameNameCollector.on('collect', async inGameNameMessage => {
      const inGameName = inGameNameMessage.content;
      const wowheadQuestion = await newChannel.send('Please provide your Wowhead Profile Link:');
      const wowheadCollector = newChannel.createMessageCollector({ filter, max: 1, time: 60000 });

      wowheadCollector.on('collect', wowheadMessage => {
        const wowheadProfileLink = wowheadMessage.content;
        newChannel.send(`Thank you! Here is the information you provided:\n**In-Game Name**: ${inGameName}\n**Wowhead Profile Link**: ${wowheadProfileLink}`);
      });

      wowheadCollector.on('end', collected => {
        if (collected.size === 0) {
          newChannel.send('You did not provide a Wowhead Profile Link in time.');
        }
      });
    });

    inGameNameCollector.on('end', collected => {
      if (collected.size === 0) {
        newChannel.send('You did not provide an In-Game Name in time.');
      }
    });
  }
};

module.exports = { handleTeamSelection, handleInteraction };
