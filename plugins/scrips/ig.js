module.exports.config = {
    name: "ig",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Hoàng Quân",
    description: "Random ảnh ig :D",
    commandCategory: "random-img",
    usages: "ig",
    cooldowns: 1,
    dependencies: ['axios', 'fs-extra']
};

module.exports.run = async ({ api, event }) => {
    const axios = require('axios');
    const fs = require("fs-extra");

    try {
        const response1 = await axios.get('http://localhost:8888/images/ig');
        const soluong = response1.data.count;

        const response2 = await axios.get(response1.data.url, { responseType: 'arraybuffer', url: response1.data.url });
        fs.writeFileSync(__dirname + "/cache/ig.png", Buffer.from(response2.data, "utf-8"));

        api.sendMessage({
            body: `Ảnh nè Bạn\nSố ảnh hiện có: ${soluong}\nAuthor: Hoàng Quân`,
            attachment: fs.createReadStream(__dirname + `/cache/ig.png`)
        }, event.threadID);
    } catch (error) {
        console.error("Unexpected error:", error);
    }
}
