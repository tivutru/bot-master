module.exports.config = {
    name: "boxinfo",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Hoàng Quân",
    description: "Kiểm tra thông tin nhóm",
    commandCategory: "general",
    usages: "info",
    cooldowns: 20,
  };
 
  module.exports.run = async ({ event, api, Users }) => {
    const request = require("request");
    const fs = require("fs-extra");
  try {
    const dataThread = await api.getThreadInfo(event.threadID);
    var maleUser = [], femaleUser = [], adminName = [], arrayUserData = [], threadImgSrc = dataThread.imageSrc;

    for (const userData of dataThread.userInfo) {
    userData.gender == "MALE" ? maleUser.push(userData) : femaleUser.push(userData);
    arrayUserData.push(userData);
    }

    for (const arrayAdmin of dataThread.adminIDs) {
        const name = await Users.getNameUser(arrayAdmin.id);
        adminName.push(name);
    }

    const approvalMode = dataThread.approvalMode == true ? "Bật" : "Tắt";

    const body = "💳 Tên box: " + dataThread.threadName + "\n👤 Phê duyệt thành viên: " + approvalMode + "\n🗣 Số tin nhắn: " + dataThread.messageCount + " tin" + "\nEmoji hiện tại của nhóm: " + dataThread.emoji +"\n👥 Tổng số thành viên: " + dataThread.participantIDs.length + " người" + "\nTrong đấy: " + " \n- 👦 Nam: " + maleUser.length + "\n- 👩 Nữ: " + femaleUser.length + "\n👮‍♂️ Quản trị viên nhóm gồm: " + adminName.join(", ");

    request(threadImgSrc || "https://wallpapercave.com/download/black-background-png-wp2831915?nocache=1").pipe(fs.createWriteStream(__dirname + `/cache/${event.threadID}-boxIMG.png`)).on("close", () => api.sendMessage({ body, attachment: fs.createReadStream(__dirname + `/cache/${event.threadID}-boxIMG.png`)}, event.threadID, () => fs.unlinkSync(__dirname + `/cache/${event.threadID}-boxIMG.png`)));
    return;
}
catch (e) {
    return api.sendMessage("Không thể lấy thông tin nhóm của bạn!", event.threadID, event.messageID);
}
  }