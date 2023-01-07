const { SlashCommandBuilder } = require('discord.js');
const utils = require('../utils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackmenot')
        .setDescription('Remove user from tracking'),
    async execute(interaction) {
        await interaction.deferReply();

        if(!utils.contains_discord_name(global.data, interaction.user.username)) {
            await interaction.editReply("I am not tracking you.");
            return;
        }
        
        global.data = utils.removeUserFromData(global.data, interaction.user.username);

        utils.save(global.data);

        var msg = `Stopped tracking @${interaction.user.username}.`;

        console.log(msg);
        await interaction.editReply(msg);
    },
};
