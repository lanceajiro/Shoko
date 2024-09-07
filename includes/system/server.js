const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const os = require('os');

function createServer() {
    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server);

    // Serve static files from the 'public' directory
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    io.on('connection', (socket) => {
        socket.on('requestDashboardData', async () => {
            try {
                const data = await getDashboardData();
                socket.emit('dashboardUpdate', data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                socket.emit('error', { message: 'Failed to fetch dashboard data' });
            }
        });

        socket.on('disconnect', () => {
            // Handle disconnect if needed
        });
    });

    const updateInterval = 1000; // 1 second
    setInterval(async () => {
        try {
            const data = await getDashboardData();
            io.emit('dashboardUpdate', data);
        } catch (error) {
            console.error('Error in periodic update:', error);
        }
    }, updateInterval);

    return { app, server, io };
}

async function getDashboardData() {
    try {
        const [botInfo, ownerName, uptimeString, osInfo, ramUsage, ping] = await Promise.all([
            getBotInfo(),
            getOwnerName(global.config.operator[0]),
            formatUptime(process.uptime()),
            getOsInfo(),
            getRamUsage(),
            getPing()
        ]);

        return {
            ...botInfo,
            botOwner: ownerName,
            uptime: uptimeString,
            os: osInfo,
            ramUsage: `${ramUsage}%`,
            ping: `${ping}`,
            serverTime: new Date().toLocaleString()
        };
    } catch (error) {
        console.error('Error in getDashboardData:', error);
        throw error;
    }
}

function getBotInfo() {
    try {
        const botInfo = global.client.info;
        return {
            botName: botInfo.first_name,
            botId: botInfo.id,
            botUsername: botInfo.username,
            commandCount: global.client.commands.size,
            userCount: global.data.users.size,
            groupCount: global.data.groups.size
        };
    } catch (error) {
        console.error('Error in getBotInfo:', error);
        return {
            botName: 'Unknown',
            botId: 'Unknown',
            botUsername: 'Unknown',
            commandCount: 0,
            userCount: 0,
            groupCount: 0
        };
    }
}

async function getOwnerName(ownerId) {
    try {
        const ownerInfo = await global.client.bot.getChat(ownerId);
        return `${ownerInfo.first_name} ${ownerInfo.last_name || ''}`.trim();
    } catch (error) {
        console.error('Error in getOwnerName:', error);
        return 'Unknown Owner';
    }
}

function formatUptime(uptime) {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function getOsInfo() {
    try {
        return `${os.type()} ${os.release()}`;
    } catch (error) {
        console.error('Error in getOsInfo:', error);
        return 'Unknown OS';
    }
}

function getRamUsage() {
    try {
        const totalMem = os.totalmem();
        const usedMem = totalMem - os.freemem();
        return ((usedMem / totalMem) * 100).toFixed(2);
    } catch (error) {
        console.error('Error in getRamUsage:', error);
        return 0;
    }
}

function getPing() {
    return Math.floor(Math.random() * 100) + 1;
}

async function startServer() {
    try {
        const { server } = createServer();
        const port = process.env.PORT || global.config.port || 3000;
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

module.exports = { startServer };