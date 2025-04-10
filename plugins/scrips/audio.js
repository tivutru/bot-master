const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_API = "http://localhost:8888/soundcloud";
let searchResults = {};

module.exports.config = {
    name: "audio",
    version: "1.1.0",
    hasPermission: 0,
    credits: "Hoàng Quân",
    description: "Tìm và tải nhạc SoundCloud",
    commandCategory: "Tiện ích",
    usages: "audio <tên bài hát>",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args, client }) => {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    if (!query) return api.sendMessage("❌ Vui lòng nhập tên bài hát cần tìm!", threadID, messageID);

    try {
        const res = await axios.get(`${BASE_API}?search=${encodeURIComponent(query)}&limit=10`);
        const data = res.data;

        if (!data.success || !data.results || data.results.length === 0)
            return api.sendMessage("❌ Không tìm thấy bài hát nào!", threadID, messageID);

        let msg = "🎶 𝗗𝗔𝗡𝗛 𝗦𝗔́𝗖𝗛 𝗕𝗔̀𝗜 𝗛𝗔́𝗧 𝗧𝗜̀𝗠 𝗧𝗛𝗔̂́𝗬:\n\n";
        data.results.forEach((item, index) => {
            msg += `${index + 1}. ${item.dataMusic.title}\n   👤 ${item.author.username}\n\n`;
        });
        msg += "📩 Reply số tương ứng để tải bài hát.";

        searchResults[threadID] = data.results;
        api.sendMessage(msg, threadID, (err, info) => {
            client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                threadID,
                author: event.senderID,
                type: "download"
            });
        });
    } catch (err) {
        console.error("[SoundCloud Search Error]", err);
        api.sendMessage("❌ Lỗi khi tìm kiếm bài hát!", threadID, messageID);
    }
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
    const { threadID, messageID, senderID, body } = event;
    if (handleReply.author !== senderID) return;

    const index = parseInt(body) - 1;
    const list = searchResults[threadID];
    if (isNaN(index) || index < 0 || index >= (list?.length || 0)) {
        return api.sendMessage("❌ Số bạn chọn không hợp lệ!", threadID, messageID);
    }

    const song = list[index];
    delete searchResults[threadID];

    api.sendMessage(`🔄 Đang tải: ${song.dataMusic.title}`, threadID);

    try {
        const res = await axios.get(`${BASE_API}?url=${encodeURIComponent(song.dataMusic.permalink_url)}`);
        const streamLink = res.data?.dataMusic?.linkDownload?.[0]?.url;

        if (!streamLink) return api.sendMessage("❌ Không lấy được link tải bài hát!", threadID);

        const filePath = path.join(__dirname, 'cache', `${Date.now()}.mp3`);
        const writer = fs.createWriteStream(filePath);

        const response = await axios({
            method: 'get',
            url: streamLink,
            responseType: 'stream'
        });

        response.data.pipe(writer);
        writer.on('finish', () => {
            api.sendMessage({
                body: `✅ 𝗧𝗮̉𝗶 𝘅𝘂𝗼̂́𝗻𝗴 𝘁𝗵𝗮̀𝗻𝗵 𝗰𝗼̂𝗻𝗴:\n🎵 ${song.dataMusic.title}`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath));
        });

        writer.on('error', () => {
            api.sendMessage("❌ Lỗi khi lưu file nhạc!", threadID);
        });
    } catch (err) {
        console.error("[SoundCloud Download Error]", err);
        api.sendMessage("❌ Có lỗi khi tải bài hát!", threadID);
    }
};
