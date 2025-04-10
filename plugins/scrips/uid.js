module.exports.config = {
    name: "uid",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "YourName",
    description: "Lấy thông tin người dùng.",
    commandCategory: "other",
    usages: "uid",
    cooldowns: 5,
};
module.exports.run = function({ api, event }) {
    const mentions = event.mentions;

    if (Object.keys(mentions).length === 0) {
        // If no mentions, send the UID of the command invoker
        api.sendMessage(`Your UID: ${event.senderID}`, event.threadID, event.messageID);
    } else {
        // If there are mentions, send the name and UID of each mentioned user
        for (const userID in mentions) {
            const userName = mentions[userID].replace('@', '');
            api.sendMessage(`${userName}\n UID: ${userID}`, event.threadID);
        }
    }
};

