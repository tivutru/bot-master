module.exports.config = {
    name: "gỡ",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Quân Cắt Moi",
    description: "Gỡ tin nhắn của Bot",
    commandCategory: "System",
    usages: "gỡ",
    cooldowns: 0,
    dependencies: [],
};

module.exports.run = async function ({ api, event }) {
    if (event.type !== "message_reply") return api.sendMessage("Loại tin nhắn không hợp lệ", event.threadID, event.messageID);

    if (!event.messageReply) return api.sendMessage("Không tìm thấy tin nhắn phản hồi", event.threadID, event.messageID);

    let { senderID } = event;
    if (event.messageReply.senderID !== api.getCurrentUserID()) return api.sendMessage("Không thể gỡ tin nhắn của người khác", event.threadID, event.messageID);

    return api.unsendMessage(event.messageReply.messageID, err => (err) ? api.sendMessage("Lỗi khi gỡ tin nhắn", event.threadID, event.messageID) : '');
};
