require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { handleTeamSelection, handleInteraction } = require('./teamSelection');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

client.on('messageCreate', async msg => {
  if (msg.content.toLowerCase() === 'quote') {
    try {
      console.log('Fetching a quote...');
      const response = await axios.get('https://zenquotes.io/api/random');
      const quoteData = response.data[0];
      const quote = quoteData.q;
      const author = quoteData.a;
      msg.reply(`"${quote}" - ${author}`);
    } catch (error) {
      console.error('Error fetching quote:', error.response ? error.response.data : error.message);
      msg.reply('Sorry, I could not fetch a quote at the moment.');
    }
  }
});

const CHANNEL_ID = '1264766395271483452';

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (channel.isTextBased()) {
    await handleTeamSelection(channel);
    setInterval(async () => {
      await handleTeamSelection(channel);
    }, 60000); // Check every 60 seconds to ensure the message is present
  }
});

client.on('messageCreate', async msg => {
  if (msg.channel.id !== CHANNEL_ID) return;
  if (msg.content.toLowerCase() === 'team') {
    await handleTeamSelection(msg.channel);
  }
});

client.on('interactionCreate', async interaction => {
  await handleInteraction(interaction);
});

client.login(process.env.TOKEN)
  .then(() => console.log('Login successful'))
  .catch(error => {
    console.error('Error logging in:', error);
  });

client.login(process.env.TOKEN).catch(console.error);
