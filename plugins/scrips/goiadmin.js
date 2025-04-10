const fs = require("fs");

module.exports.config = {
    name: "goiadmin",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Hoàng Quân",
    description: "Gọi admin",
    commandCategory: "Không cần dấu lệnh",
    usages: "noprefix",
    cooldowns: 5,
};

module.exports.event = function({ api, event }) {
    var { threadID, messageID } = event;
    
    if (event.body && (event.body.indexOf("@Quắn Một Đời Liêm Khiết") == 0 || 
        event.body.indexOf("anh quắn") == 0 ||
        event.body.indexOf("Anh quắn") == 0 ||
        event.body.indexOf("@Nguyễn Hoàng Quân") == 0 ||
        event.body.indexOf("Quắn") == 0 ||
        event.body.indexOf("Quân") == 0)) {
        
        var msg = {
            body: "Gọi admin tao làm con cặc gì 🙂, yêu không mà gọi, đang bận địt, gọi nữa tao xiên chết mẹ mày 🙂", 
            attachment: fs.createReadStream(__dirname + `/noprefix/xien.jpg`)
        };
        return api.sendMessage(msg, threadID, messageID);
    }
};

module.exports.run = function({ api, event, client, __GLOBAL }) {
    // Thực thi mã trong hàm run nếu cần
};
