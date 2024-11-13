const {initUser} = require("./models/user");


async function initDB() {
    try {
        await initUser();
        console.log('All models synced successfully.')
    } catch (error) {
        console.error('Something went wrong:', error);
    }
}


initDB();

