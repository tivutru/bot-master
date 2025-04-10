module.exports.config = {
	name: "uptime",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Hoàng Quân",
	description: "Kiểm tra thời gian bot đã online",
	commandCategory: "system",
	usages: "uptime",
	cooldowns: 5,

};

module.exports.run = async ({ api, event, client }) => {
	const time = process.uptime(),
		hours = Math.floor(time / (60 * 60)),
		minutes = Math.floor((time % (60 * 60)) / 60),
		seconds = Math.floor(time % 60);

	const timeStart = Date.now();
	return api.sendMessage("Ok get time...", event.threadID, () => api.sendMessage(` ${hours}h: ${minutes}m: ${seconds}s.\n\=====UPTIME=====`, event.threadID, event.messageID));
}