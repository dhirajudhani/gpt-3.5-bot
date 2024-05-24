require('dotenv/config');
const { Client, IntentsBitField,EmbedBuilder, GatewayIntentBits, messageLink } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('The bot is online!');
});

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);


client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    message.reply({
      content: "Hii I am bot",
    });
  });
  
  client.on("interactionCreate", (interaction) => {
    if (interaction.commandName === "ping") {
      interaction.reply("Pong!");
    }
    if (interaction.commandName === "hey") {
      interaction.reply("Hey! How you doing");
    }
    if (interaction.commandName === "add") {
      const num1 = interaction.options.get("first-number").value;
      const num2 = interaction.options.get("second-number").value;
      interaction.reply(`The sum is ${num1 + num2} `);
    }
    if (interaction.commandName === "embed") {
      const embed = new EmbedBuilder()
        .setTitle("Embed title")
        .setDescription("This is a embed description")
        .setColor('Random')
        .addFields({
          name: "Field title",
          value: "Some random value",
          inline: true
        },
        {
          name: "2nd Field title",
          value: "Some random value",
          inline: true
        })
        .setURL('https://discord.js.org/')
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .setImage('https://i.imgur.com/AfFp7pu.png')
        .setTimestamp()
        .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
  
      interaction.reply({embeds : [embed]})
    }
  
    if(interaction.isButton()){
  
      const role = interaction.guild.roles.cache.get(interaction.customId);
      if(!role){
        interaction.reply({
          content: "I couldn't find that role",
          ephemeral: true
        })
        return;
      }
      const hasRole = interaction.member.roles.cache.has(role.id);
      if(hasRole){
          interaction.member.roles.remove(role);
          interaction.editReply(`The role ${role} has been removed`)
          return
      }
      interaction.member.roles.add(role)
      interaction.editReply(`The role ${role} has been added`)
    }
  });
  

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;
  if (message.content.startsWith('!')) return;

  let conversationLog = [
    { role: 'system', content: 'You are a friendly chatbot.' },
  ];

  try {
    await message.channel.sendTyping();
    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();
    
    prevMessages.forEach((msg) => {
      if (msg.content.startsWith('!')) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id == client.user.id) {
        conversationLog.push({
          role: 'assistant',
          content: msg.content,
          name: msg.author.username
            .replace(/\s+/g, '_')
            .replace(/[^\w\s]/gi, ''),
        });
      }

      if (msg.author.id == message.author.id) {
        conversationLog.push({
          role: 'user',
          content: msg.content,
          name: message.author.username
            .replace(/\s+/g, '_')
            .replace(/[^\w\s]/gi, ''),
        });
      }
    });

    const result = await openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
        // max_tokens: 256, // limit token usage
      })
      .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
      });
    message.reply(result.data.choices[0].message);
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(process.env.TOKEN);