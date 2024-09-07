const util = require('util');

exports.config = {
    name: 'eval', 
    author: 'Shinpei', 
    access: 'operator',
    description: 'Execute JavaScript code (operator only)', 
    category: 'operator', 
    usage: ['[code]'] 
};

exports.initialize = async function ({ bot, chatId, userId, args, msg, usages }) {
    // Function to execute when the command is called
    const code = args.join(' '); // Join arguments to form the code to execute

    if (!code) {
        return usages();
    }

    try {
        let result = await eval(code); // Execute the provided JavaScript code
        if (typeof result !== 'string') {
            result = util.inspect(result); // Convert non-string results to a string for display
        }

        bot.sendMessage(global.config.operator[0], `Result: ${result}`); // Send the result to the admin
    } catch (error) {
        console.error("Error executing command:", error);
        bot.sendMessage(chatId, `Error: ${error.message}`); // Notify the user of the error
    }
};
