module.exports.config = {
		name: "add",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Gia Quân",
	description: "thêm tv vào nhóm",
	commandCategory: "system",
	usages: "add kèm link facebook",
	cooldowns: 5,
};
const qs = require('querystring');
const axios = require('axios')
// get id from to id.traodoisub.com
// Thay thế getUID bằng findUid trong thông báo lỗi
async function findUid(link) {
  const response = await axios.post("https://id.traodoisub.com/api.php", qs.stringify({ link }));
  const uid = response.data.id;
  if (!uid) {
    const err = new Error(response.data.error);
    for (const key in response.data)
      err[key] = response.data[key];
    throw err;
  }
  return uid;
}


module.exports.run = async function ({ api, event, args, Threads, Users }) {
  const { threadID, messageID } = event;

const link = args.join(" ")
if(!args[0]) return api.sendMessage('Vui lòng nhập link hoặc id người dùng muốn thêm vào nhóm!', threadID, messageID);
var { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(threadID);
if(link.indexOf(".com/")!==-1) {
    for (const item of args) {
      let uid;
      if (isNaN(item)) {
        try {
          uid = await findUid(item);
        }
        catch (err) {
          console.log(err.message, item);
          api.sendMessage(err.message, event.threadID)
          continue;
        }
      }
      else uid = item;

    api.addUserToGroup(uid, threadID, (err) => {
    if (participantIDs.includes(uid)) return api.sendMessage(`Thành viên đã có mặt trong nhóm`, threadID, messageID);
    if (err) return api.sendMessage(`Không thể thêm thành viên vào nhóm`, threadID, messageID);
    else if (approvalMode && !adminIDs.some(item => item.id == api.getCurrentUserID())) return api.sendMessage(`Đã thêm người dùng vào danh sách phê duyệt`, threadID, messageID);
    else return api.sendMessage(`Thêm thành viên vào nhóm thành công`, threadID, messageID);
    });
     }
    }
  else { 
    var uidUser = args[0] 
    api.addUserToGroup(uidUser, threadID, (err) => {
    if (participantIDs.includes(uidUser)) return api.sendMessage(`Thành viên đã có mặt trong nhóm`, threadID, messageID);
    if (err) return api.sendMessage(`Không thể thêm thành viên vào nhóm`, threadID, messageID);
    else if (approvalMode && !adminIDs.some(item => item.id == api.getCurrentUserID())) return api.sendMessage(`Đã thêm người dùng vào danh sách phê duyệt`, threadID, messageID);
    else return api.sendMessage(`Thêm thành viên vào nhóm thành công`, threadID, messageID);
    });
  }
      }