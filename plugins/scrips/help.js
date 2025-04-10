module.exports.config = {
    name: "help",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Hoàng & Quân",
    description: "Hướng dẫn cho người mới",
    commandCategory: "system",
    usages: "help [Text]",
    cooldowns: 5,
};

module.exports.run = function ({ api, event, args, client, global }) {
    let { senderID, threadID, messageID } = event;
    const { commands } = client;
    const command = commands.get(args[0]);
    const threadSetting = client.threadSetting.get(event.threadID.toString()) || {};

    if (!command) {
        const arrayInfo = [];
        const page = parseInt(args[0]) || 1;
        const numberOfOnePage = 15;
        let i = 0;
        var group = [],
            msg = "====PLUGINS====\n";
        for (var [name] of commands) {
            arrayInfo.push(name);
        }
        arrayInfo.sort((a, b) => a.data - b.data);
        const startSlice = numberOfOnePage * page - numberOfOnePage;
        i = startSlice;
        const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);
        for (let item of returnArray) msg += `${++i}/ ${item}\n`;
        const t = `❗Trang (${page}/${Math.ceil(arrayInfo.length / numberOfOnePage)})\nDùng &help + Số trang\nĐể xem các lệnh trên Bot\nHiện tại có ${arrayInfo.length} lệnh trên bot này`;
        return api.sendMessage(msg + t, threadID, messageID);
    }

    // Lấy thông tin về lệnh cụ thể
    const commandInfo =
        `=== ${command.config.name.toUpperCase()} ===\n` +
        `❯ Phiên Bản: ${command.config.version}\n` +
        `❯ Quyền Hạn: ${command.config.hasPermssion}\n` +
        `❯ Nguồn: ${command.config.credits}\n` +
        `❯ Mô Tả: ${command.config.description}\n` +
        `❯ Danh Mục Lệnh: ${command.config.commandCategory}\n` +
        `❯ Sử Dụng: ${command.config.usages}\n` +
        `❯ Thời Gian Chờ: ${command.config.cooldowns}s\n`;

    return api.sendMessage(
        commandInfo +
        `❯ Tiền Tố: ${(threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX}`, event.threadID
    );
};
