module.exports.config = {
    name: "kick",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "Hoàng Quân",
    description: "Xoá người bạn cần xoá khỏi nhóm bằng cách tag",
    commandCategory: "other",
    usages: "kick [tag]",
    cooldowns: 0,
    dependencies: []
};

module.exports.run = function ({ api, event }) {
    const mention = Object.keys(event.mentions);
    return api.getThreadInfo(event.threadID, (err, info) => {
        if (err) return api.sendMessage("Đã có lỗi xảy ra!", event.threadID);
        if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) return api.sendMessage('Cần quyền quản trị viên nhóm\nVui lòng thêm và thử lại!', event.threadID, event.messageID);
        if (!mention[0]) return api.sendMessage("Bạn phải tag người cần kick", event.threadID);
        if (info.adminIDs.some(item => item.id == event.senderID)) {
            mention.forEach(userID => {
                setTimeout(() => {
                    api.removeUserFromGroup(userID, event.threadID)
                        .then(() => {
                            api.sendMessage(`Đã kick người dùng có ID: ${userID}`, event.threadID);
                        })
                        .catch(() => {
                            api.sendMessage(`Không thể kick người dùng có ID: ${userID}`, event.threadID);
                        });
                }, 3000);
            });
        }
    });
};
