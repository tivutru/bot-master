module.exports.config = {
	name: "load",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Hoàng Quân",
	description: "Kiểm tra ping của bot",
	commandCategory: "system",
	usages: "load",
	cooldowns: 5,
	info: [
		{
			key: 'Text',
			type: 'Văn Bản',
			example: 'load',
			code_by: `Code By Hoàng Quân`
		}
	]
};

module.exports.run = async ({ api, event }) => {
	const timeStart = Date.now();
	
	// Gửi "Ping Ping..." trước
	api.sendMessage("⏱ Ping Ping...", event.threadID, async (err, info) => {
		if (err) return console.log("❌ Không thể gửi tin nhắn:", err);
		
		// Sau 1s thì sửa lại nội dung để hiển thị ping
		setTimeout(() => {
			const ping = Date.now() - timeStart;
			api.editMessage(`✅ Say Ok\n📶 Ping: ${ping}ms`, info.messageID, (editErr) => {
				if (editErr) console.log("❌ Không thể sửa tin nhắn:", editErr);
			});
		}, 1000);
	});
};
