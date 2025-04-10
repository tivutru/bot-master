module.exports.config = {
  name: "ghép",
  version: "1.1.1",
  hasPermssion: 0,
  credits: "KhanhMilo\nsửa bởi DinhPhuc",
  description: "Ghép đôi với một người trong nhóm khi được tag, ngược lại ghép ngẫu nhiên",
  commandCategory: "Nhóm",
  usages: "ghép",
  cooldowns: 1,
};

module.exports.run = async function ({ api, event, args, Threads, Users }) {
  const fs = require("fs-extra");
  const axios = require("axios");

  const botID = api.getCurrentUserID();
  let namee = "Người dùng";
  let threadInfo;
  let mentionedUserID = event.mentions[0] || null;

  try {
    namee = (await Users.getData(event.senderID)).name;
    threadInfo = (await Threads.getData(event.threadID)).threadInfo;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    return api.sendMessage("Lỗi khi lấy dữ liệu, vui lòng thử lại sau!", event.threadID);
  }

  const tle = Math.floor(Math.random() * 101);
  
  const downloadAndSaveImage = async (url, filePath) => {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(response.data));
    } catch (error) {
      console.error(`Lỗi khi tải ảnh từ ${url}:`, error);
    }
  };

  const gifCute = [
    "https://i.pinimg.com/originals/42/9a/89/429a890a39e70d522d52c7e52bce8535.gif",
    "https://i.imgur.com/HvPID5q.gif",
    "https://i.pinimg.com/originals/9c/94/78/9c9478bb26b2160733ce0c10a0e10d10.gif",
    "https://i.pinimg.com/originals/9d/0d/38/9d0d38c79b9fcf05f3ed71697039d27a.gif",
  ];

  let name, id;
  let arraytag = [{ id: event.senderID, tag: namee }];

  if (mentionedUserID && mentionedUserID !== botID && mentionedUserID !== event.senderID) {
    try {
      name = (await Users.getData(mentionedUserID)).name;
      arraytag.push({ id: mentionedUserID, tag: name });
      id = mentionedUserID;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu người được tag:", error);
      return api.sendMessage("Lỗi khi lấy dữ liệu người được tag!", event.threadID);
    }
  } else {
    const listUserID = event.participantIDs.filter(ID => ID !== botID && ID !== event.senderID);
    if (listUserID.length < 2) {
      return api.sendMessage("Không đủ người để ghép đôi!", event.threadID);
    }
    const shuffledUsers = listUserID.sort(() => Math.random() - 0.5);
    id = shuffledUsers[0];
    try {
      name = (await Users.getData(id)).name;
      arraytag.push({ id, tag: name });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu người ghép:", error);
      return api.sendMessage("Lỗi khi lấy dữ liệu người ghép!", event.threadID);
    }
  }

  await downloadAndSaveImage(`https://graph.facebook.com/${event.senderID}/picture?width=512&height=512&access_token=EAABsbCS1iHgBO46oFxSr2BSRBG5UM9ZBCXbcjDJnyybyNBwBbpl2ptKj25rZBtUOZBrUjy9bhdimpMFJ75vlkRMfTKVQeEZAZBcxtX645VEENHkv4Vc6VPrQhFaD8ipAvWwLTY9qYjPZAJCYPw6xUqy8WVGMrLL5K3M0jv9n7g9TytAISOQk4c7kBZCwRW158ZB02epM4NLeFgZDZD`, __dirname + "/cache/avt.png");
  await downloadAndSaveImage(gifCute[Math.floor(Math.random() * gifCute.length)], __dirname + "/cache/giflove.png");
  await downloadAndSaveImage(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=EAABsbCS1iHgBO46oFxSr2BSRBG5UM9ZBCXbcjDJnyybyNBwBbpl2ptKj25rZBtUOZBrUjy9bhdimpMFJ75vlkRMfTKVQeEZAZBcxtX645VEENHkv4Vc6VPrQhFaD8ipAvWwLTY9qYjPZAJCYPw6xUqy8WVGMrLL5K3M0jv9n7g9TytAISOQk4c7kBZCwRW158ZB02epM4NLeFgZDZD`, __dirname + "/cache/avt2.png");

  const imglove = [
    fs.createReadStream(__dirname + "/cache/avt.png"),
    fs.createReadStream(__dirname + "/cache/giflove.png"),
    fs.createReadStream(__dirname + "/cache/avt2.png"),
  ];

  const msg = {
    body: `\ud83e\udd70Ghép đôi thành công!\n\ud83d\udc8cChúc 2 bạn trăm năm hạnh phúc\n\ud83d\udc95Tỷ lệ hợp đôi: ${tle}%\n${namee} \ud83d\udc8b ${name}`,
    mentions: arraytag,
    attachment: imglove,
  };

  return api.sendMessage(msg, event.threadID, event.messageID).catch(error => {
    console.error("Lỗi khi gửi tin nhắn:", error);
  });
};
