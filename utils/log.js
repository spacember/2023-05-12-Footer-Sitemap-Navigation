const fs = require('fs');

const log = (msg) => {
    const data = `${msg}\n`;

    fs.appendFile("log.txt", data, (err) => {
        if (err) {
            console.log("An error occured while writing to File:");
            console.log(err);
        }
        console.log(data);
    });
};

module.exports = log;