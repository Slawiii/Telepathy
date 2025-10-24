require('dotenv').config();
require('events').EventEmitter.prototype._maxListeners = 50;
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');

const channels = ['1122345751754842212'];

const checkAndJoin = async (client, channelId) => {
  try {
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
      console.error('Channel not found with ID: ${channelId}');
      return;
    }

    const guild = channel.guild;
    const member = guild.members.cache.get(client.user.id);

    if (!member) {
      console.error('Bot is not a member of the guild (${guild.name}) associated with the channel ID: ${channelId}');
      return;
    }

    const userVoiceState = guild.voiceStates.cache.get(member.id);

    if (!userVoiceState || !userVoiceState.channelId) {
      const voiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfMute: false,
        selfDeaf: false,
      });

      voiceConnection.once('stateChange', (state) => {
        if (state.status === 'CONNECTED') {
          console.log('${member.displayName} is in ${guild.name}');
          console.log('Bot joined voice channel ${channel.name} in ${guild.name}');
        }
      });

      voiceConnection.on('error', (error) => {
        console.error('Error in voice connection:', error);
      });

      voiceConnection.removeAllListeners();
    }
  } catch (error) {
    console.error('Error checking and joining:', error);
  }
};

channels.forEach((channelId) => {
  const client = new Client({ checkUpdate: false });

  client.once('ready', () => {
    checkAndJoin(client, channelId);
    setInterval(() => checkAndJoin(client, channelId), 5000);
  });

  client.login(process.env.DISCORD_TOKEN);
});
