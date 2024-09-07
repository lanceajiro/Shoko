const fs = require('fs');
const path = require('path');
const log = require('./log');

// Define the cache directory
const cacheDir = path.join(__dirname, '../../commands/cache');

// Function to create the cache directory if it doesn't exist
function create() {
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }
}

// Function to clear the cache directory
function clear() {
    if (fs.existsSync(cacheDir)) {
        const files = fs.readdirSync(cacheDir);
        if (files.length > 0) {
            const deletedFiles = [];
            files.forEach((file) => {
                const filePath = path.join(cacheDir, file);
                try {
                    fs.unlinkSync(filePath);
                    deletedFiles.push(file); // Collect deleted files
                } catch (err) {
                    log.erro('Error deleting file: ' + filePath + ' ' + err.message);
                }
            });
            if (deletedFiles.length > 0) {
                log.sys(`${deletedFiles.length} cache files have been cleared: ${deletedFiles.join(', ')}`);
            }
        }
    }
}

// Function to watch the cache directory for new files with a delay before detecting
function watch() {
    if (fs.existsSync(cacheDir)) {
        fs.watch(cacheDir, (eventType, filename) => {
            if (eventType === 'rename' && filename) {
                setTimeout(() => {
                    const files = fs.readdirSync(cacheDir);
                    if (files.length > 0) {
                        log.sys(`${files.length} cache files detected. Clearing cache now.`);
                        clear();
                    }
                }, 5000); // 5-second delay before detecting
            }
        });
    } else {
        log.erro('Cache directory does not exist. Cannot watch for changes.');
    }
}

// Automatically create the cache directory and start watching it
create();
watch();

module.exports = {
    create,
    clear,
    watch
};