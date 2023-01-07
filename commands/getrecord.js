const { SlashCommandBuilder } = require('discord.js');
const utils = require('../utils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getrecord')
        .setDescription('Get record of DDNet user')
        .addStringOption(option =>
            option
                .setName('ddnet_name')
                .setDescription('The DDNet name')
                .setRequired(true)),
    async execute(interaction) {
        const ddnet_name = interaction.options.getString('ddnet_name');
        const current_time = await utils.get_current_time(ddnet_name);

        await interaction.reply(`Current record of ${ddnet_name} is: ${utils.buildTimeFromDec(current_time)}`);
    },
};
