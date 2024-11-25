const { format } = require("date-fns");

function formatDate(unformmatedDate, structure) {

    const date = new Date(unformmatedDate);
    const formattedDate = format(date, structure);

    return formattedDate;

}

module.exports = formatDate;