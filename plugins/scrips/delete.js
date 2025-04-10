const fs = require('fs');

module.exports.config = {
  name: "delete",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "projectbot",
  description: "delete",
  commandCategory: "quản trị viên",
  usages: "delete sotnnhan",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args, Threads, getText }) => {
  // Get group data in json format
  const { threadID, senderID, messageID, type, mentions } = event,
    thread = require('../strick/data.json');
  if (event.isGroup == false) return api.sendMessage(('Không phải là một nhóm lên không thể locmen'), threadID, messageID);
  const data = thread.find(i => i.threadID == threadID);

  if (!data) return api.sendMessage("Data not found for this thread", threadID);

  if (!args[0]) return api.sendMessage("locmen + sotinnhan", threadID);
  if (isNaN(parseInt(args[0]))) return api.sendMessage("Bạn phải nhập một số", threadID);
  let input = parseInt(args[0]);

  // Start counting successes and counting errors
  let count = 0, count1 = 0,
    dataThread = (await Threads.getData(event.threadID)).threadInfo;
  if (!dataThread.adminIDs.some(item => item.id == api.getCurrentUserID())) return api.sendMessage(('Bạn phải nhập một số'), event.threadID, event.messageID);
  var Array = [];
  for (const user of data.data) {
    try {
      // Check the number of messages from input and avoid bot accounts
      if (user.exp <= input && user.id != api.getCurrentUserID()) {
        // Start deleting users
        await api.removeUserFromGroup(user.id, threadID);
        count++;
      }
    } catch (e) { count1++ }
  }
  if (count == 0) return api.sendMessage(('Không tìm thấy người dùng ít hơn %1 tin nhắn để xóa', input), threadID);
  if (count != 0) msg += ('Đã xoá %1 người dùng ít hơn %2 tin nhắn khỏi nhóm.', count, input);
  if (count1 != 0) msg += ('Không thể xóa %1 người dùng', count1);
  return api.sendMessage(msg, threadID);
}
