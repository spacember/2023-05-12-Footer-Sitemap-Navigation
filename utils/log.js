const fs = require('fs');
const date = new Date();

const log = (msg) => {
    const data = `DATE: ${date}\n` + `${msg}\n`;

    fs.appendFile("log.txt", data, (err) => {
        if (err) {
            console.log("An error occured while writing to File:");
            console.log(err);
        }
        console.log(data);
    });
};

module.exports = log;