const timeUnsend = 1;
const axios = require("axios");
const fs = require("fs");

module.exports.config = {
    name: "dhbc",
    version: "1.2.0",
    hasPermission: 0,
    credits: "Hoàng Quân",
    description: "Đuổi hình bắt chữ trên chính messenger của bạn!!!",
    commandCategory: "game",
    usages: "[1/2]",
    cooldowns: 10
};

module.exports.handleReply = async function ({
    client,
    event,
    Users,
    api,
    handleReply
}) {
    const { tukhoa, suggestions } = handleReply;
    const { threadID, messageID, senderID } = event;
    const thread = require('./cache/checktt.json');
    const pathA = require('path');
    const path = pathA.join(__dirname, 'cache', 'checktt.json');

    if (!event.isGroup) return api.sendMessage('Không phải là một nhóm lên không thể dùng', threadID, messageID);

    var threadData = thread.find(i => i.threadID == threadID && i.threadID !== undefined);

    client.handleReply = client.handleReply || [];

    switch (handleReply.type) {
        case "choosee": {
            switch (event.body) {
                case "2": {
                    api.unsendMessage(handleReply.messageID);
                    const res = await axios.get(`https://raw.githubusercontent.com/J-JRT/api1/mainV2/data.json`);
                    const length1 = res.data.doanhinh.length;
                    const dataGame = res.data.doanhinh[Math.floor(Math.random() * length1)];
                    const tukhoadung = dataGame.tukhoa;
                    const suggestions = dataGame.suggestions;
                    const fs = require("fs-extra");
                    const sokitu = dataGame.sokitu;
                    const anh1 = dataGame.link1;
                    const anh2 = dataGame.link2;

                    const [Avatar, Avatar2] = await Promise.all([
                        axios.get(anh1, { responseType: "arraybuffer" }),
                        axios.get(anh2, { responseType: "arraybuffer" })
                    ]);

                    fs.writeFileSync(__dirname + "/cache/dhbc/anh1.png", Buffer.from(Avatar.data, "utf-8"));
                    fs.writeFileSync(__dirname + "/cache/dhbc/anh2.png", Buffer.from(Avatar2.data, "utf-8"));

                    var imglove = [
                        fs.createReadStream(__dirname + "/cache/dhbc/anh1.png"),
                        fs.createReadStream(__dirname + "/cache/dhbc/anh2.png")
                    ];

                    var msg = {
                        body: `Vui lòng reply tin nhắn này để trả lời:\nGợi ý: ${sokitu}\n\nReply: Gợi ý - để xem gợi ý 2`,
                        attachment: imglove
                    };

                    api.sendMessage(msg, event.threadID, (error, info) => {
                        client.handleReply.push({
                            type: "reply",
                            name: module.exports.config.name,
                            author: event.senderID,
                            messageID: info.messageID,
                            tukhoa: tukhoadung,
                            suggestions: suggestions
                        });
                    });

                    break;
                }
                case "1": {
                    api.unsendMessage(handleReply.messageID);
                    const res = await axios.get(`https://raw.githubusercontent.com/J-JRT/api1/mainV2/data2.json`);
                    const length2 = res.data.doanhinh.length;
                    const dataGame = res.data.doanhinh[Math.floor(Math.random() * length2)];
                    const tukhoadung = dataGame.tukhoa;
                    const suggestions = dataGame.suggestions;
                    const fs = require("fs-extra");
                    const sokitu = dataGame.sokitu;
                    const anh1 = dataGame.link;

                    const Avatar = await axios.get(anh1, { responseType: "arraybuffer" });

                    fs.writeFileSync(__dirname + "/cache/dhbc/anh1.png", Buffer.from(Avatar.data, "utf-8"));

                    var imglove = [
                        fs.createReadStream(__dirname + "/cache/dhbc/anh1.png")
                    ];

                    var msg = {
                        body: `Vui lòng reply tin nhắn này để trả lời:\nGợi ý: ${sokitu}\n\nReply: Gợi ý - để xem gợi ý 2`,
                        attachment: imglove
                    };

                    api.sendMessage(msg, event.threadID, (error, info) => {
                        client.handleReply.push({
                            type: "reply2",
                            name: module.exports.config.name,
                            author: event.senderID,
                            messageID: info.messageID,
                            tukhoa: tukhoadung,
                            suggestions: suggestions
                        });
                    });

                    break;
                }
            }

            const choose = parseInt(event.body);
            if (isNaN(event.body) || choose > 2 || choose < 1) {
                api.sendMessage("Vui lòng nhập 1 con số nằm trong danh sách.", event.threadID, event.messageID);
            }

            break;
        }
        case "reply": {
            const dapan = event.body;
            if (dapan.toLowerCase() == "gợi ý") {
                api.sendMessage(`Gợi ý cho bạn là: \n${suggestions}`, event.threadID, event.messageID);
            } else {
                if (dapan.toLowerCase() == tukhoa) {
                    const userInfo = await api.getUserInfoMain(senderID);
                    const name1 = userInfo[senderID] ? userInfo[senderID].name : 'Người Dùng Không Xác Định';
                    setTimeout(function () {
                        api.unsendMessage(handleReply.messageID);
                    }, timeUnsend * 1000);
                    api.sendMessage(`${name1} đã trả lời chính xác!\nĐáp án: ${tukhoa}`, event.threadID, event.messageID);
                } else {
                    api.sendMessage(`Sai rồi nha :v`, event.threadID, event.messageID);
                }
            }
        
            break;
        }
        
        case "reply2": {
            const dapan1 = event.body;
            if (dapan1.toLowerCase() == "gợi ý") {
                api.sendMessage(`Gợi ý cho bạn là: \n${suggestions}`, event.threadID, event.messageID);
            } else {
                if (dapan1.toLowerCase() == tukhoa) {
                    const userInfo = await api.getUserInfoMain(senderID);
                    const name1 = userInfo[senderID] ? userInfo[senderID].name : 'Người Dùng Không Xác Định';
                    setTimeout(function () {
                        api.unsendMessage(handleReply.messageID);
                    }, timeUnsend * 1000);
                    api.sendMessage(`${name1} đã trả lời chính xác!\nĐáp án: ${tukhoa}`, event.threadID, event.messageID);
                } else {
                    api.sendMessage(`Sai rồi nha :v`, event.threadID, event.messageID);
                }
            }
        
            break;
        }
        

        default:
            break;
    }
};

module.exports.run = async function ({
    args,
    api,
    event,
    client,
}) {
    if (!event.isGroup) {
        return api.sendMessage('Không phải là một nhóm lên không thể dùng', event.threadID, event.messageID);
    }

    client.handleReply = client.handleReply || [];

    if (!args[0]) {
        return api.sendMessage(`Vui lòng thêm chế độ chơi:\n\n1: Một ảnh\n2: Hai ảnh\n\nVui lòng reply tin nhắn này để chọn chế độ`, event.threadID, (error, info) => {
            client.handleReply.push({
                type: "choosee",
                name: module.exports.config.name,
                author: event.senderID,
                messageID: info.messageID
            });
        });
    }

    if (args[0] == '1') {
        api.unsendMessage(handleReply.messageID);
        const res = await axios.get(`https://raw.githubusercontent.com/J-JRT/api1/mainV2/data2.json`);
        const length2 = res.data.doanhinh.length;
        const dataGame = res.data.doanhinh[Math.floor(Math.random() * length2)];
        const tukhoadung = dataGame.tukhoa;
        const suggestions = dataGame.suggestions;
        const fs = require("fs-extra");
        const sokitu = dataGame.sokitu;
        const anh1 = dataGame.link;

        const Avatar = await axios.get(anh1, { responseType: "arraybuffer" });

        fs.writeFileSync(__dirname + "/cache/dhbc/anh1.png", Buffer.from(Avatar.data, "utf-8"));

        var imglove = [
            fs.createReadStream(__dirname + "/cache/dhbc/anh1.png")
        ];

        var msg = {
            body: `Vui lòng reply tin nhắn này để trả lời:\nGợi ý: ${sokitu}\n\nReply: Gợi ý - để xem gợi ý 2`,
            attachment: imglove
        };

        api.sendMessage(msg, event.threadID, (error, info) => {
            client.handleReply.push({
                type: "reply2",
                name: module.exports.config.name,
                author: event.senderID,
                messageID: info.messageID,
                tukhoa: tukhoadung,
                suggestions: suggestions
            });
        });
    }

    if (args[0] == '2') {
        api.unsendMessage(handleReply.messageID);
        const res = await axios.get(`https://raw.githubusercontent.com/J-JRT/api1/mainV2/data.json`);
        const length1 = res.data.doanhinh.length;
        const dataGame = res.data.doanhinh[Math.floor(Math.random() * length1)];
        const tukhoadung = dataGame.tukhoa;
        const suggestions = dataGame.suggestions;
        const fs = require("fs-extra");
        const sokitu = dataGame.sokitu;
        const anh1 = dataGame.link1;
        const anh2 = dataGame.link2;

        const [Avatar, Avatar2] = await Promise.all([
            axios.get(anh1, { responseType: "arraybuffer" }),
            axios.get(anh2, { responseType: "arraybuffer" })
        ]);

        fs.writeFileSync(__dirname + "/cache/dhbc/anh1.png", Buffer.from(Avatar.data, "utf-8"));
        fs.writeFileSync(__dirname + "/cache/dhbc/anh2.png", Buffer.from(Avatar2.data, "utf-8"));

        var imglove = [
            fs.createReadStream(__dirname + "/cache/dhbc/anh1.png"),
            fs.createReadStream(__dirname + "/cache/dhbc/anh2.png")
        ];

        var msg = {
            body: `Vui lòng reply tin nhắn này để trả lời:\nGợi ý: ${sokitu}\n\nReply: Gợi ý - để xem gợi ý 2`,
            attachment: imglove
        };

        api.sendMessage(msg, event.threadID, (error, info) => {
            client.handleReply.push({
                type: "reply",
                name: module.exports.config.name,
                author: event.senderID,
                messageID: info.messageID,
                tukhoa: tukhoadung,
                suggestions: suggestions
            });
        });
    }
};
