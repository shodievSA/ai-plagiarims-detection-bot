const { format } = require("date-fns");

function formatDate(unformmatedDate, structure) {

    const date = new Date(unformmatedDate);
    const formattedDate = format(date, structure);

    return formattedDate;

}

async function formatDateTime(dateTime) {
    const formattedDateTime = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(dateTime);
    return formattedDateTime;
}
module.exports = {formatDate, formatDateTime};