const fs = require('fs').promises;
const path = require('path');

const groupDatabaseFilePath = path.join(__dirname, '../database/group.json');
const userDatabaseFilePath = path.join(__dirname, '../database/user.json');

const ensureDirectoryExists = async (dir) => {
    await fs.mkdir(dir, { recursive: true });
};

const ensureFileExists = async (filePath, defaultContent = '{}') => {
    try {
        await fs.access(filePath);
    } catch {
        await ensureDirectoryExists(path.dirname(filePath));
        await fs.writeFile(filePath, defaultContent);
    }
};

const loadDatabase = async (filePath) => {
    const data = await fs.readFile(filePath, 'utf-8');
    return new Map(Object.entries(JSON.parse(data)));
};

const saveDatabase = async (filePath, data) => {
    await fs.writeFile(filePath, JSON.stringify(Object.fromEntries(data), null, 4));
};

const loadGroups = async () => {
    await ensureFileExists(groupDatabaseFilePath);
    global.data.groups = await loadDatabase(groupDatabaseFilePath);
};

const loadUsers = async () => {
    await ensureFileExists(userDatabaseFilePath);
    global.data.users = await loadDatabase(userDatabaseFilePath);
};

const saveGroups = () => saveDatabase(groupDatabaseFilePath, global.data.groups);
const saveUsers = () => saveDatabase(userDatabaseFilePath, global.data.users);

// Fetch group information
const fetchGroupInfo = async (chatId, bot) => {
    try {
        const groupInfo = await bot.getChat(chatId);
        return {
            title: groupInfo.title,
            type: groupInfo.type,
            description: groupInfo.description || '',
            memberCount: await bot.getChatMemberCount(chatId),
            // Add any other relevant group information you want to fetch
        };
    } catch (error) {
        console.error(`Error fetching group info for ${chatId}:`, error);
        return null;
    }
};

// Fetch user information
const fetchUserInfo = async (userId, chatId, bot) => {
    try {
        const userInfo = await bot.getChatMember(chatId, userId);
        return {
            firstName: userInfo.user.first_name,
            lastName: userInfo.user.last_name || '',
            username: userInfo.user.username || '',
            isBot: userInfo.user.is_bot,
            languageCode: userInfo.user.language_code || '',
            // Add any other relevant user information you want to fetch
        };
    } catch (error) {
        console.error(`Error fetching user info for ${userId}:`, error);
        return null;
    }
};

const addGroup = async (chatId, bot) => {
    const id = chatId.toString();
    if (!global.data.groups.has(id)) {
        const groupInfo = await fetchGroupInfo(chatId, bot);
        if (groupInfo) {
            global.data.groups.set(id, {
                ai: false,
                bot: true,
                meme: false,
                event: true,
                onlyadmin: false,
                ...groupInfo
            });
            saveGroups();
            return `Group ${groupInfo.title} (${chatId}) added to the database.`;
        }
        return `Failed to fetch information for group ${chatId}.`;
    }
    return null;
};

const toggle = (chatId, setting, state) => {
    const id = chatId.toString();
    if (global.data.groups.has(id)) {
        const groupSettings = global.data.groups.get(id);
        if (setting in groupSettings) {
            groupSettings[setting] = state;
            saveGroups();
            return `${setting.charAt(0).toUpperCase() + setting.slice(1)} has been ${state ? 'enabled' : 'disabled'} for this group.`;
        }
        return `Invalid setting. Available settings are: ai, bot, meme, event, onlyadmin.`;
    }
    return `Group not found in the database.`;
};

const addUser = async (userId, chatId, bot) => {
    const id = userId.toString();
    if (!global.data.users.has(id)) {
        const userInfo = await fetchUserInfo(userId, chatId, bot);
        if (userInfo) {
            global.data.users.set(id, {
                exp: 0,
                level: 1,
                messageCount: 0,
                ...userInfo
            });
            saveUsers();
            return `User ${userInfo.firstName} (${userId}) added to the database.`;
        }
        return `Failed to fetch information for user ${userId}.`;
    }
    return null;
};

const rankUp = async (userId, chatId, bot) => {
    const user = global.data.users.get(userId.toString());
    if (user) {
        user.messageCount++;
        const requiredMessages = 5 * Math.pow(2, user.level - 1);
        if (user.messageCount >= requiredMessages) {
            user.level++;
            user.exp += requiredMessages;
            user.messageCount = 0;
            saveUsers();

            // Fetch latest user info
            const userInfo = await fetchUserInfo(userId, chatId, bot);
            if (userInfo) {
                const fullName = [userInfo.firstName, userInfo.lastName].filter(Boolean).join(' ');
                return `${fullName} has leveled up to level ${user.level}!`;
            }
            return `User ${userId} has leveled up to level ${user.level}!`;
        }
        saveUsers();
    }
    return null;
};

// Function to get the latest group info
const getGroupInfo = async (chatId, bot) => {
    const id = chatId.toString();
    if (global.data.groups.has(id)) {
        const storedInfo = global.data.groups.get(id);
        const latestInfo = await fetchGroupInfo(chatId, bot);
        if (latestInfo) {
            // Update stored info with latest fetch
            Object.assign(storedInfo, latestInfo);
            saveGroups();
        }
        return storedInfo;
    }
    return null;
};

// Function to get the latest user info
const getUserInfo = async (userId, chatId, bot) => {
    const id = userId.toString();
    if (global.data.users.has(id)) {
        const storedInfo = global.data.users.get(id);
        const latestInfo = await fetchUserInfo(userId, chatId, bot);
        if (latestInfo) {
            // Update stored info with latest fetch
            Object.assign(storedInfo, latestInfo);
            saveUsers();
        }
        return storedInfo;
    }
    return null;
};

module.exports = {
    loadGroups,
    loadUsers,
    saveGroups,
    saveUsers,
    addGroup,
    addUser,
    rankUp,
    toggle,
    getGroupInfo,
    getUserInfo
};