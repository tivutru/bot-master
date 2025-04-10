module.exports.config = {
    name: "tile",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Hoàng Quân",
    description: "Xem tỉ lệ hợp hau",
    commandCategory: "system",
    usages: "tile [@]",
    cooldowns: 5,
};

module.exports.run = function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");

    // Lấy ID của người được tag
    var mention = Object.keys(event.mentions)[0];
    if (!mention) return api.sendMessage("Bạn cần phải tag 1 người bạn muốn xem tỉ lệ hợp nhau", event.threadID, event.messageID);

    var name = event.mentions[mention].replace("@", "");
    var namee = event.mentions[event.senderID].replace("@", "");
    var tle = Math.floor(Math.random() * 101);

    var arraytag = [];
    arraytag.push({ id: mention, tag: name });
    arraytag.push({ id: event.senderID, tag: namee });

    // Lấy avatar của người được tag
    let Avatar = axios.get(`https://graph.facebook.com/${mention}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" }).data;
    fs.writeFileSync(__dirname + "/src/avt.png", Buffer.from(Avatar, "utf-8"));
    // Lấy avatar của người gửi tin nhắn
    let Avatar2 = axios.get(`https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" }).data;
    fs.writeFileSync(__dirname + "/src/avt2.png", Buffer.from(Avatar2, "utf-8"));

    var imglove = [];
    imglove.push(fs.createReadStream(__dirname + "/src/avt.png"));
    imglove.push(fs.createReadStream(__dirname + "/src/avt2.png"));
    var msg = { body: `Tỉ lệ hiểu ý giữa ${namee} và ${name} là ${tle}% 🥰`, mentions: arraytag, attachment: imglove };
    return api.sendMessage(msg, event.threadID, event.messageID);
}
