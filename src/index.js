import { Client } from "discord.js";
import { OpenAI } from "openai";
import dotenv from 'dotenv'

dotenv.config()

const client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
});

client.on('ready', () => {
    console.log('The bot is ready to chat!!')
})

const IGNORE_PREFIX = "!"
const CHANNELS = ["1241796350878945365"]

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
})

async function fetchOpenAIResponse(messageContent) {
    const systemMessage = {
        role: 'system',
        content: 'Chat gpt is a friendly chat bot.'
    };
    const userMessage = {
        role: 'user',
        content: messageContent
    };

    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [systemMessage, userMessage]
            });
            return response.choices[0].message.content;
        } catch (error) {
            if (error.status === 429) {
                const retryAfter = error.headers['retry-after'] || 2 ** attempt;
                console.warn(`Rate limit exceeded. Retrying in ${retryAfter} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            } else {
                console.error('OpenAI error:', error);
                throw error;
            }
        }
    }
    throw new Error('Failed to fetch response from OpenAI after several attempts.');
}

client.on('messageCreate', async (message) => {
    if(message.author.bot) return; // stops the multiple replying condition
    if(message.content.startsWith(IGNORE_PREFIX)) return;
    if(!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;

    try {
        const responseContent = await fetchOpenAIResponse(message.content);
        await message.reply(responseContent);
    } catch (error) {
        console.error('Failed to fetch response from OpenAI:', error);
        await message.reply('Sorry, I am currently experiencing high traffic. Please try again later.');
    }
});

client.login(process.env.TOKEN);
