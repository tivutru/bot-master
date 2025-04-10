module.exports = function({ api, global, client, models, Users, Threads, Currencies, utils }) {
	const stringSimilarity = require('string-similarity');
	const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const logger = require("../../utils/log.js");
	return async function({ event }) {
		const dateNow = Date.now();
		var { body: contentMessage, senderID, threadID, messageID} = event;
		const { allowInbox, PREFIX, ADMINBOT, DeveloperMode, adminOnly, keyAdminOnly } = global.config;
		const a = global.config.ADMINBOT.includes(senderID)

		senderID = parseInt(senderID);
		threadID = parseInt(threadID);

		if (client.userBanned.has(senderID) || client.threadBanned.has(threadID) || allowInbox == false && senderID == threadID) return;
		const threadSetting = client.threadSetting.get(parseInt(threadID)) || {};
		const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex((threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : PREFIX )})\\s*`);
		if (!prefixRegex.test(contentMessage)) return;
		
        //////////////////////////////////////////
		//======admin only and admind only======//
		//////////////////////////////////////////
		if(!a && adminOnly == true) {
			if(!a && adminOnly == true) return api.sendMessage('[ MODE ] - Chỉ admin bot mới có thể sử dụng bot', threadID, messageID) 
		   }

		//////////////////////////////////////////
		//=========Get command user use=========//
		//////////////////////////////////////////

		const [matchedPrefix] = contentMessage.match(prefixRegex);
		const args = contentMessage.slice(matchedPrefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();
		const commandBanned = client.commandBanned.get(senderID) || [];
		if (commandBanned.includes(commandName)) return;
		var command = client.commands.get(commandName);
		if (!command) {
			var allCommandName = [];
			const commandValues = client.commands.values();
			for (const cmd of commandValues) allCommandName.push(cmd.config.name);
			const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
			if (checker.bestMatch.rating >= 0.5) command = client.commands.get(checker.bestMatch.target);
			else return api.sendMessage(`Sai lệnh rồi\nCó phải ý bạn là\n - [ "${checker.bestMatch.target}" ] phải không?`, threadID);
		}

		////////////////////////////////////////
		//========= Check threadInfo =========//
		////////////////////////////////////////
		
		var threadInfo = (client.threadInfo.get(threadID) || await Threads.getInfo(threadID));
if (!threadInfo || Object.keys(threadInfo).length === 0) { // Kiểm tra threadInfo có hợp lệ không
    try {
        threadInfo = await api.getThreadInfo(event.threadID);
        await Threads.setData(threadID, { name: threadInfo.name, threadInfo });
        client.threadInfo.set(threadID, threadInfo);
    }
    catch {
        logger("Không thể lấy thông tin của nhóm!", "error");
    }
}


		////////////////////////////////////////
		//========= Check permssion =========//
		///////////////////////////////////////

		var permssion = 0;
		const find = threadInfo.adminIDs.find(el => el.id == senderID);
		
		if (ADMINBOT.includes(senderID.toString())) permssion = 2;
		else if (!ADMINBOT.includes(senderID) && find) permssion = 1;

		if (command.config.hasPermssion > permssion) return api.sendMessage(`Bạn không đủ quyền hạn để có thể sử dụng lệnh "${command.config.name}"`, event.threadID, event.messageID);

		//////////////////////////////////////
		//========= Check cooldown =========//
		//////////////////////////////////////

		if (!client.cooldowns.has(command.config.name)) client.cooldowns.set(command.config.name, new Map());
		const timestamps = client.cooldowns.get(command.config.name);
		const cooldownAmount = (command.config.cooldowns || 1) * 1000;
		if (timestamps.has(senderID)) {
			const expirationTime = timestamps.get(senderID) + cooldownAmount;
			if (dateNow < expirationTime) return api.setMessageReaction('⏱', event.messageID, (err) => (err) ? logger('Đã có lỗi xảy ra khi thực thi setMessageReaction', 2) : '', true);
		}

		///////////////////////////////////
		//========= Run command =========//
		///////////////////////////////////

		try {
			command.run({ api, global, client, event, args, models, Users, Threads, Currencies, utils, permssion });
			timestamps.set(senderID, dateNow);
			
			if (DeveloperMode == true) {
				const moment = require("moment-timezone");
				const time = moment.tz("Asia/Ho_Chi_minh").format("HH:MM:ss L");
				logger(`[ ${time} ] Command Executed: ${commandName} | User: ${senderID} | Arguments: ${args.join(" ")} | Group: ${threadID} | Process Time: ${(Date.now()) - dateNow}ms`, "[ DEV MODE ]");
			}
			return;
		}
		catch (error) {
			logger(error + " tại lệnh: " + command.config.name, "error");
			return api.sendMessage("Đã có lỗi xảy ra khi thực khi lệnh đó. Lỗi: " + error, threadID);
		}
	};
};