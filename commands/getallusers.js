const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getuserstracked')
        .setDescription('Get all usernames being tracked'),
    async execute(interaction) {
        await interaction.reply(`getuserstracked This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
    },
};
