const { SlashCommandBuilder } = require('discord.js');
const utils = require('../utils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getallrecords')
        .setDescription('Get all records for all users being tracked'),
    async execute(interaction) {
        if(!global.data || global.data.length < 1) {
            console.log("/getallrecords no users");
            await interaction.reply("Not currently tracking any users.");
            return;
        }

        await interaction.deferReply();

        var msg = "";

        for(const a of global.data) {
            var time = await utils.get_current_time(a.ddnet_name);
            msg += `@${a.discord_name} (${a.ddnet_name}) : ${utils.buildTimeFromDec(time)}\n`;
        }

        await interaction.editReply(msg);
    },
};
