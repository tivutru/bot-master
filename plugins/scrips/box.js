module.exports.config = {
  name: "box",
  version: "1.0.1", // Updated version
  hasPermssion: 0,
  credits: "Hoàng",
  description: "Các cài đặt của nhóm chat.",
  commandCategory: "box",
  usages: "[name/emoji/info/id]", // Added "id" option
  cooldowns: 1,
  dependencies: ["request", "fs-extra"]
};

module.exports.run = async ({ api, event, args }) => {
  const fs = require("fs-extra");
  const request = require("request");

  if (args.length == 0) {
    return api.sendMessage(
      `Bạn có thể dùng:\n/box emoji [icon]\n\n/box name [tên box cần đổi]\n\n/box info => Toàn bộ thông tin của nhóm !\n\n/box id => Lấy ID của nhóm`,
      event.threadID,
      event.messageID
    );
  }

  if (args[0] == "name") {
    var content = args.join(" ");
    var c = content.slice(4, 99) || event.messageReply.body;
    api.setTitle(`${c} `, event.threadID);
  }

  if (args[0] == "emoji") {
    const name = args[1] || event.messageReply.body;
    api.changeThreadEmoji(name, event.threadID);
  }

  if (args[0] == "info") {
    var threadInfo = await api.getThreadMain(event.threadID);
    let threadMem = threadInfo.participantIDs.length;
    var gendernam = [];
    var gendernu = [];
    var nope = [];
    for (let z in threadInfo.userInfo) {
      var gioitinhone = threadInfo.userInfo[z].gender;
      var nName = threadInfo.userInfo[z].name;

      if (gioitinhone == "MALE") {
        gendernam.push(z + gioitinhone);
      } else if (gioitinhone == "FEMALE") {
        gendernu.push(gioitinhone);
      } else {
        nope.push(nName);
      }
    }
    var nam = gendernam.length;
    var nu = gendernu.length;
    let qtv = threadInfo.adminIDs.length;
    let sl = threadInfo.messageCount;
    let icon = threadInfo.emoji;
    let threadName = threadInfo.threadName;
    let id = threadInfo.threadID;
    var listad = "";
    var qtv2 = threadInfo.adminIDs;
    for (let i = 0; i < qtv2.length; i++) {
      const infu = await api.getUserInfoMain(qtv2[i].id);
      const name = infu[qtv2[i].id].name;
      listad += "•" + name + "\n";
    }
    let sex = threadInfo.approvalMode;
    var pd = sex == false ? "tắt" : sex == true ? "bật" : "Kh";
    var pdd = sex == false ? "❎" : sex == true ? "✅" : "⭕";
    var callback = () =>
      api.sendMessage(
        {
          body: `Tên box: ${threadName}\nID Box: ${id}\n${pdd} Phê duyệt: ${pd}\nEmoji: ${icon || "Like "}\n-Thông tin:\nTổng ${threadMem} thành viên\n👨‍🦰Nam: ${nam} thành viên \n👩‍🦰Nữ: ${nu} thành viên\n\n🕵️‍♂️Với ${qtv} quản trị viên gồm:\n${listad}\nTổng số tin nhắn: ${sl} tin.`,
          attachment: fs.createReadStream(__dirname + "/cache/1.png")
        },
        event.threadID,
        () => fs.unlinkSync(__dirname + "/cache/1.png"),
        event.messageID
      );
    return request(encodeURI(`${threadInfo.imageSrc}`))
      .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
      .on("close", () => callback());
  }

  if (args[0] == "id") {
    api.sendMessage(`ID của nhóm là: ${event.threadID}`, event.threadID, event.messageID);
  }
};
