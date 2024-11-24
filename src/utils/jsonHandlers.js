const fs = require('fs/promises');

async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading JSON from ${filePath}:`, error.message);
        throw error;
    }
}

async function writeJSON(filePath, jsonData) {
    try {
        const jsonString = JSON.stringify(jsonData, null, 2);
        await fs.writeFile(filePath, jsonString, 'utf8');
        console.log(`JSON written successfully to ${filePath}`);
    } catch (error) {
        console.error(`Error writing JSON to ${filePath}:`, error.message);
        throw error;
    }
}

module.exports = {readJSON, writeJSON};