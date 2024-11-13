const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

async function downloadWordFile({ fileURL, file, fileType }) {

    let directory;

    if (fileType == "application/pdf") {
        directory = "media/pdf_files"
    } else if (fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        directory = "media/word_files"
    } else if (fileType == "text/plain") {
        directory = "media/text_files"
    }

    const res = await fetch(fileURL.href);
    const buffer = await res.buffer();

    const filePath = path.join(
        __dirname, "..", directory, file.file_name
    );

    fs.writeFileSync(filePath, buffer);

}

module.exports = downloadWordFile;