
import dotenv from "dotenv";
import {
  Client,
  GatewayIntentBits,
  messageLink,
  IntentsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonComponent,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const roles = [
    {
        id: '1241755605585105017',
        label : 'Red'
    },
    {
        id: '1241755913195356233',
        label : 'Blue'
    },
    {
        id: '1241756151213850664',
        label : 'Green'
    }
]

client.on("ready", async(c) => {
  try {
    const channel = await client.channels.cache.get('1241008147066519596')
    if(!channel) return;

    const row = new ActionRowBuilder();
    roles.forEach((role) => {
        row.components.push(
            new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Primary)
        )
    }) 
    await channel.send({
        content: 'Claim or remove a role below ',
        components: [row]
    })
    process.exit()
  } catch (error) {
    console.log(error)
  }
});


client.login(process.env.TOKEN);
