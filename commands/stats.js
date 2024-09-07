const os = require('os');
const process = require('process');
const axios = require('axios');

module.exports = {
    config: {
        name: "stats",
        author: "Lance Ajiro",
        description: "Display bot statistics",
        access: "operator",
        category: "operator",
        usage: ""
    },

    initialize: async function({ bot, chatId }) {
        try {
            const uptime = process.uptime(); 
            const uptimeString = formatUptime(uptime);

            const memoryUsage = process.memoryUsage();
            const memoryUsageMB = (memoryUsage.rss / (1024 * 1024)).toFixed(2);

            const cpuUsage = os.loadavg();
            const cpuUsageString = cpuUsage.map(avg => avg.toFixed(2)).join(', ');

            const totalCommands = global.client.commands.size;
            const totalUsers = global.data.users.size;
            const totalGroups = global.data.groups.size;

            const statsMessage = `
Bot Statistics

${global.config.symbols} Runtime: ${uptimeString}
${global.config.symbols} Memory usage: ${memoryUsageMB} MB           
${global.config.symbols} Total commands: ${totalCommands}
${global.config.symbols} Total users: ${totalUsers}
${global.config.symbols} Total groups: ${totalGroups}
            `;

            // Generate a random ID between 0 and 1000
            const id = Math.floor(Math.random() * 846);  // Generates a random integer between 0 and 1000
            const gh = "lanceajiro";
            const insta = "lance.cochangco";
            const fb = "Lance Cochangco";
            const bname = global.client.info.first_name;
            const hours = Math.floor((uptime % (3600 * 24)) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            // Make the API request to get the photo
            const res = await axios.get(
                `http://deku-rest-api.gleeze.com/canvas/uptime?id=${id}&instag=${insta}&ghub=${gh}&fb=${fb}&hours=${hours}&minutes=${minutes}&seconds=${seconds}&botname=${bname}`,
                { responseType: "stream" }
            );

            // Send the photo with the stats message as the caption using bot.sendPhoto
            await bot.sendPhoto(chatId, res.data, {
                caption: statsMessage.trim(),
            });
        } catch (error) {
            console.error('[ERROR]', error);
            bot.sendMessage(chatId, 'An error occurred while fetching the stats.');
        }
    }
};

function formatUptime(uptime) {
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
