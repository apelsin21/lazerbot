const fs = require('node:fs');
const path = require('node:path');
const { Collection, Client, Events, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { channel_id, token } = require('./config.json');
const { user_data } = require('./storage.json')
const utils = require('./utils.js');
const https = require("https");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

global.data = user_data;

client.commands = new Collection();

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

var baseurl = "https://ddnet.org/players/?json2=";

function save_and_exit() {
    console.log("Caught killing signal, saving and exiting");

    utils.save(global.data);

    process.exit();
}
process.on('SIGINT', save_and_exit);  // CTRL+C
process.on('SIGQUIT', save_and_exit); // Keyboard quit
process.on('SIGTERM', save_and_exit); // `kill` command

function update_times(channel, data) {
    return data.map(async (a) => {
        await utils.sleep(1000);

        var old_time = a.time;
        var new_time = await utils.get_current_time(a.ddnet_name);

        console.log(`comparing old: ${old_time} new: ${new_time} for ${a.ddnet_name}`);

        if(old_time != null && new_time < old_time) {
            var displayTime = utils.buildTimeFromDec(new_time);
            var oldDisplayTime = utils.buildTimeFromDec(old_time);
            var secondsFaster = ((old_time - new_time) + "").substring(0, 5);
            channel.send(`@${a.discord_name} (${a.ddnet_name}) got a new record, ${displayTime}!!!!\n It is ${secondsFaster} seconds faster than earlier: ${oldDisplayTime}`);
        }

        a.time = new_time;

        return a;
    });
}

function check_for_new_times(old, updated) {
    updated.forEach(a => {
    });
}

async function mainloop() {

    const channel = client.channels.cache.get(channel_id);

    if(global.data.length > 0) {
        console.log("Tracking " + global.data.reduce((a,b) => { return a += "@" + b.discord_name + ": " + b.ddnet_name + ", "}, ""));
    } else {
        console.log("No users yet.");
    }

     while(true) {
        await Promise.all(update_times(channel, global.data)).then(updated_userdata => {
            global.data = updated_userdata;
        }).catch(e => {
            console.log('Error fetching time for user: ' + e);
        });

        await utils.sleep(5000);
    };
}

client.once(Events.ClientReady, async (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    await mainloop();
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token);
