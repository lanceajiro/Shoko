const Table = require('cli-table3');
const gradient = require('gradient-string');

function createTable() {
    const terminalWidth = process.stdout.columns || 45;
    const contentWidth = Math.floor(terminalWidth * 0.97);

    return new Table({
        chars: {
            'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
            'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
            'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
            'right': '║', 'right-mid': '╢', 'middle': '│'
        },
        colWidths: [contentWidth],
        wordWrap: true,
        style: { head: [], border: [] }
    });
}

function wrapString(str, maxLength) {
    const wrappedStr = [];
    let currentLine = '';

    str.split(' ').forEach(word => {
        if (currentLine.length + word.length + 1 > maxLength) {
            wrappedStr.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });

    if (currentLine.trim().length > 0) {
        wrappedStr.push(currentLine.trim());
    }

    return wrappedStr.join('\n');
}

function logMessage(msg) {
    const table = createTable();

    const gradient1 = gradient('red', 'yellow');
    const gradient2 = gradient('green', 'cyan');
    const gradient3 = gradient('blue', 'magenta');

    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        const chatId = msg.chat.id;
        const groupName = msg.chat.title || 'Unknown Group';
        table.push(
            [{ colSpan: 1, hAlign: 'left', content: gradient1(`Group: ${groupName} | ${chatId}`) }]
        );
    }

    if (msg.new_chat_member) {
        // User joined
        const newMember = msg.new_chat_member;
        const userName = [newMember.first_name, newMember.last_name].filter(Boolean).join(' ');
        const userId = newMember.id;
        table.push(
            [{ colSpan: 1, hAlign: 'left', content: gradient2(`User Joined: ${userName} | ${userId}`) }]
        );

        // Check if the user was added by someone else
        if (msg.from.id !== newMember.id) {
            const adderName = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ');
            const adderId = msg.from.id;
            table.push(
                [{ colSpan: 1, hAlign: 'left', content: gradient2(`Added by: ${adderName} | ${adderId}`) }]
            );
        }
    } else if (msg.left_chat_member) {
        // User left
        const leftMember = msg.left_chat_member;
        const userName = [leftMember.first_name, leftMember.last_name].filter(Boolean).join(' ');
        const userId = leftMember.id;
        table.push(
            [{ colSpan: 1, hAlign: 'left', content: gradient2(`User Left: ${userName} | ${userId}`) }]
        );

        // Check if the user was removed by someone else
        if (msg.from.id !== leftMember.id) {
            const removerName = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ');
            const removerId = msg.from.id;
            table.push(
                [{ colSpan: 1, hAlign: 'left', content: gradient2(`Removed by: ${removerName} | ${removerId}`) }]
            );
        }
    } else {
        // Regular message
        const userId = msg.from.id;
        const userName = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ');
        const messageText = wrapString(msg.text || 'Image, video, or special characters', 40);

        table.push(
            [{ colSpan: 1, hAlign: 'left', content: gradient2(`Name: ${userName} | ${userId}`) }],
            [{ colSpan: 1, hAlign: 'left', content: gradient3(`Message: ${messageText}`) }]
        );
    }

    console.log(table.toString());
}

module.exports = {
    logMessage
};