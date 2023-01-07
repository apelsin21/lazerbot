const { SlashCommandBuilder } = require('discord.js');
const utils = require('../utils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackme')
        .setDescription('Add user to keep track of')
        .addStringOption(option =>
            option
                .setName('ddnet_name')
                .setDescription('The DDNet name')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const ddnet_name = interaction.options.getString('ddnet_name');

        if(utils.contains_discord_name(global.data, interaction.user.username)) {
            await interaction.editReply("Already tracking this discord user. Can only keep track of one DDNet<->Discord user relationship. Am dumb.");
            return;
        }
        if(utils.contains_ddnet_name(global.data, ddnet_name)) {
            await interaction.editReply("Already tracking this ddnet user for someone. Can only keep track of one DDNet<->Discord user relationship. Am dumb.");
            return;
        }
        if(!utils.ddnet_user_exists(ddnet_name)) {
            await interaction.editReply(`The DDNet user \"${ddnet_name}\" doesn't exist. Check special chars.`);
            return;
        }

        var new_user={
            discord_name: interaction.user.username,
            ddnet_name: ddnet_name
        };

        global.data.push(new_user);

        utils.save(global.data);

        var msg = `Now tracking @${new_user.discord_name} as DDNet user ${new_user.ddnet_name}.`;
        console.log(msg);
        await interaction.editReply(msg);
    },
};
