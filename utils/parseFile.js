const mammoth = require("mammoth");
const path = require("path")

async function parseFile({ fileName, fileType }) {

    if (fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {

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

    } else if (fileType == "application/pdf") {

        // pdf file parsing

    } else if (fileType == "text/plain") {

        // txt file parsing

    }

}

module.exports = parseFile;