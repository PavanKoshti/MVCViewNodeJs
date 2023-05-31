const mongoose = require('mongoose');

module.exports = {

    //DATABASE CONNECTION

    connectDB: async function () {
        try {
            mongoose.connect(process.env.DB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).then(() => console.log("Database Connected Successfully!")).catch(err => console.log("Error While Get Connect DB", err));

        } catch (error) {
            console.log("Error while Connect DB --> ", error);
        }
    }

}