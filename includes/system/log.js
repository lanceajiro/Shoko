const moment = require("moment-timezone");
const gradient = require('gradient-string');

// Define gradient colors
const colors = {
    blue: gradient("#0000ff", "#243aff", "#4687f0"),
    red: gradient("#ff0000", "#ff0000", "#ff0000"),
    yellow: gradient("#ffd700", "#ffff00", "#ff8c00")
};

// Get the current time in the specified timezone
const getTime = () => moment.tz("Asia/Manila").format("HH:mm:ss");

// Core logging function
const log = (text, color, prefix = `[${getTime()}] [ Shoko ] » `, overwrite = false) => {
    const output = color(`${prefix}${text}`);
    if (overwrite) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(output);
    } else {
        console.log(output);
    }
};

// Exported log methods
module.exports = {
    hm: (text) => log(text, colors.blue),
    sys: (text) => log(text, colors.blue, `[${getTime()}] [ System ] » `),
    data: (text) => log(text, colors.blue, `[${getTime()}] [ Database ] » `),
    cache: (text) => log(text, colors.blue, `[${getTime()}] [ Cache ] » `),
    inf: (text, overwrite = false) => log(text, colors.blue, `[${getTime()}] [ Info ] » `, overwrite),
    plain: (text) => log(text, colors.blue, ''),
    warn: (text) => log(text, colors.yellow),
    erro: (text) => log(text instanceof Error ? text.stack : text, colors.red),

    // Animated counting function
    animateCount: async (finalCount, prefix = "Commands: ", delay = 50) => {
        for (let i = 0; i <= finalCount; i++) {
            module.exports.inf(`${prefix}${i}`, true);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        console.log(); // Move to the next line after animation
    }
};
