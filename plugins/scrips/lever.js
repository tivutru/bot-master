module.exports.config = {
	name: "lever",
	version: "0.0.1-beta",
	hasPermssion: 1,
	credits: "Hoàng Quân",
	description: "Thông báo lever cho từng nhóm, người dùng",
	commandCategory: "system",
	usages: "lever",
	dependencies: ["fs-extra"],
	cooldowns: 5,
	envConfig: {
		unsendMessageAfter: 5
	}
};


module.exports.event = async function({ api, event, Currencies, Users, client }) {
    const { threadID, senderID } = event;
    const { createReadStream, existsSync, mkdirSync } = require("fs-extra");

    const threadData = client.threadSetting.get(threadID.toString()) || {};

    if (typeof threadData["customRankup"] !== "undefined" && threadData["customRankup"] === false) return;
    if (client.inProcess === true) return;

    var exp = parseInt((await Currencies.getData(senderID)).exp);
    exp += 1;

    if (isNaN(exp)) return;

    const curLevel = Math.floor((Math.sqrt(1 + (4 * exp / 3) + 1) / 2));
    const level = Math.floor((Math.sqrt(1 + (4 * (exp + 1) / 3) + 1) / 2));

    if (level > curLevel && level !== 1) {
        const nameUser = (await Users.getData(senderID)).name || (await Users.getInfo(senderID)).name;
        const customRankupMessage = (typeof threadData.customRankup === "undefined") ? `Trình độ chém gió của ${nameUser} đã đạt tới lever ${level}` : threadData.customRankup;
        const message = customRankupMessage
            .replace(/\{name}/g, nameUser)
            .replace(/\{level}/g, level);

        if (existsSync(__dirname + "/cache/customRankup/")) mkdirSync(__dirname + "/cache/customRankup/", { recursive: true });

        let arrayContent;
        if (existsSync(__dirname + `/cache/customRankup/vip.gif`)) {
            arrayContent = { body: message, attachment: createReadStream(__dirname + `/cache/customRankup/vip.gif`), mentions: [{ tag: nameUser, id: senderID }] };
        } else {
            arrayContent = { body: message, mentions: [{ tag: nameUser, id: senderID }] };
        }

        api.sendMessage(arrayContent, threadID);
    }

    await Currencies.setData(senderID, { exp });
    return;
};

module.exports.run = async function({ api, event, Threads, client }) {
    let settings = (await Threads.getData(event.threadID)).settings;
    settings.customRankup = !settings.customRankup;

    await Threads.setData(event.threadID, { settings });
    client.threadSetting.set(event.threadID, settings);

    return api.sendMessage(`Đã ${(settings.customRankup === true) ? "bật" : "tắt"} thành công thông báo rankup tùy chỉnh!`, event.threadID);
};