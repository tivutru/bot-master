module.exports.config = {
	name: "setname",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Hoàng Quân",
	description: "Đổi biệt danh trong nhóm của bạn hoặc của người bạn tag",
	commandCategory: "other",
	usages: "setname [name]",
	cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
	const name = args.join(" ");
	const mention = Object.keys(event.mentions)[0];

	try {
		if (!mention) {
			// Nếu không tag ai, đổi biệt danh của người gửi
			await api.changeNickname(name, event.threadID, event.senderID);
			return api.sendMessage(`✅ Đã đổi biệt danh của bạn thành: ${name}`, event.threadID);
		} else {
			// Nếu tag ai đó, đổi biệt danh của họ
			const newName = name.replace(event.mentions[mention], "").trim();
			await api.changeNickname(newName, event.threadID, mention);
			return api.sendMessage(`✅ Đã đổi biệt danh của người được tag thành: ${newName}`, event.threadID);
		}
	} catch (err) {
		console.error("Lỗi khi đổi biệt danh:", err);
		return api.sendMessage("❌ Đã xảy ra lỗi khi đổi biệt danh.", event.threadID);
	}
}
