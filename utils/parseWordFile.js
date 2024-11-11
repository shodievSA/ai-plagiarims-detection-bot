const mammoth = require("mammoth");
const path = require("path")

async function parseWordFile(fileName) {

    const filePath = path.join(
        __dirname, "..", "word_files", fileName
    );

    try {

        const { value } = await mammoth.extractRawText(
            { path: filePath }
        );

        return value;

    } catch (error) {

        console.log(error);

    }

}

module.exports = parseWordFile;