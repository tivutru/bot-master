const fs = require('fs');
const path = require('path');

let defaultGreeting = "Xin chào!";
let greetingsData = {};
const greetingsFilePath = path.join(__dirname, 'cache','greetings.json');

// Hàm để đọc dữ liệu từ tệp greetings.json
function loadGreetingsData() {
    try {
        if (fs.existsSync(greetingsFilePath)) {
            const data = fs.readFileSync(greetingsFilePath);
            greetingsData = JSON.parse(data);
            console.log("Đã đọc greetings.json thành công.");
        } else {
            // Nếu tệp không tồn tại, tạo một đối tượng rỗng
            fs.writeFileSync(greetingsFilePath, JSON.stringify(greetingsData, null, 2));
            console.log("Đã tạo greetings.json mới.");
        }
    } catch (error) {
        console.error("Lỗi khi đọc file greetings.json:", error);
    }
}

// Hàm để cập nhật tệp greetings.json với dữ liệu mới
function updateGreetingsFile() {
    try {
        fs.writeFileSync(greetingsFilePath, JSON.stringify(greetingsData, null, 2));
        console.log("Đã cập nhật greetings.json thành công.");
    } catch (error) {
        console.error("Lỗi khi ghi file greetings.json:", error);
    }
}

// Gọi hàm loadGreetingsData() khi bot khởi động để đảm bảo rằng dữ liệu đã được load từ tệp greetings.json
loadGreetingsData();

module.exports.config = {
    name: "sethi",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Hoàng Quân",
    description: "sethi",
    commandCategory: "Không cần dấu lệnh",
    usages: "/sethi <câu chào mới> hoặc /sethi del",
    cooldowns: 5,
    slash: true // Bật tính năng slash command
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const subCommand = args[0].toLowerCase();

    if (subCommand === "del") {
        delete greetingsData[threadID];
        updateGreetingsFile(); // Cập nhật file greetings.json sau khi xóa câu chào
        api.sendMessage("Đã xóa tất cả các câu chào đã cài đặt từ trước.", threadID, messageID);
        return;
    }

    const newGreeting = args.join(" ").trim();

    if (!newGreeting) {
        return api.sendMessage("Vui lòng nhập câu chào mới hoặc sử dụng /sethi del để xóa tất cả các câu chào đã cài đặt từ trước.", threadID, messageID);
    }

    greetingsData[threadID] = newGreeting;
    updateGreetingsFile(); // Cập nhật file greetings.json sau khi thêm câu chào mới
    api.sendMessage(`Đã cập nhật câu chào mới cho nhóm này thành: ${newGreeting}`, threadID, messageID);
};

module.exports.event = async function ({ event, api, Users }) {
    const { threadID, senderID } = event;
    const userInfo = await api.getUserInfo(senderID);
    const name1 = userInfo[senderID] ? userInfo[senderID].name : 'Người Dùng Không Xác Định';
    if (event.body && ["hi", "hello", "hii", "hai", "chào"].includes(event.body.toLowerCase())) {
        const files = fs.readdirSync(path.join(__dirname, 'cache', 'hi'));
        if (files.length > 0) {
            const randomFile = files[Math.floor(Math.random() * files.length)];
            const imagePath = path.join(__dirname, 'cache', 'hi', randomFile);

            const greeting = greetingsData[threadID] || defaultGreeting;
            try {
                api.sendMessage({
                    body: `${greeting} ${name1}`,
                    mentions: [{ tag: name1,id:senderID }],
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID, event.messageID);
            } catch (error) {
                console.error("Lỗi khi gửi tin nhắn:", error);
                api.sendMessage("Đã xảy ra lỗi khi gửi tin nhắn.", threadID, event.messageID);
            }
            return;
        } else {
            api.sendMessage(`Không có ảnh trong thư mục "cache/hi".`, threadID, event.messageID);
        }
    }
};

