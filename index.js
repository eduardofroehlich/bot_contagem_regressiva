require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const TARGET_DATE = new Date('2025-01-28T19:30:00Z'); // Data da inauguração do servidor
const COMMANDS = [
    {
        name: 'inauguracao',
        description: 'Verifica quantos dias faltam para a inauguração.',
    },
    {
        name: 'testar',
        description: 'Testa o envio da mensagem de contagem regressiva.',
    },
];

client.once('ready', async () => {
    console.log(`Bot ${client.user.tag} está online!`);

    // Registra os comandos de barra
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: COMMANDS }
        );
        console.log('Comandos de barra registrados com sucesso!');
    } catch (error) {
        console.error('Erro ao registrar comandos de barra:', error);
    }

    scheduleDailyMessage();
});

function scheduleDailyMessage() {
    const now = new Date();
    const next8am = new Date(now);

    // Configura para o próximo dia, caso já tenha passado das 8h
    next8am.setHours(8, 0, 0, 0);
    if (now.getTime() > next8am.getTime()) {
        next8am.setDate(next8am.getDate() + 1);
    }

    const timeUntilNext8am = next8am - now;

    setTimeout(() => {
        sendCountdownMessage();
        setInterval(sendCountdownMessage, 24 * 60 * 60 * 1000); // 24 horas
    }, timeUntilNext8am);
}

function sendCountdownMessage() {
    const channelId = process.env.CHANNEL_ID;
    const channel = client.channels.cache.get(channelId);

    if (!channel) {
        console.error('Canal não encontrado. Verifique o ID do canal no arquivo .env.');
        return;
    }

    const now = new Date();
    const difference = Math.ceil((TARGET_DATE - now) / (1000 * 60 * 60 * 24)); // Diferença em dias

    const message = difference > 0
        ? `@everyone Bom dia! Faltam ${difference} dias para a inauguração do servidor em ${TARGET_DATE.toLocaleDateString('pt-BR')}!`
        : 'Bom dia! Hoje é o grande dia da inauguração do servidor! 🎉';

    channel.send(message).catch(console.error);
}

// Lida com os comandos de barra
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'inauguracao') {
        const now = new Date();
        const difference = Math.ceil((TARGET_DATE - now) / (1000 * 60 * 60 * 24)); // Diferença em dias

        const response = difference > 0
            ? `Faltam ${difference} dias para a inauguração em ${TARGET_DATE.toLocaleDateString('pt-BR')}!`
            : 'Hoje é o grande dia da inauguração! 🎉';

        await interaction.reply(response);
    }
});

// Login do bot
client.login(process.env.TOKEN);
