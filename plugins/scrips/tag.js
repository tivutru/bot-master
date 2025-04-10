module.exports.config = {
  name: "tag",
  version: "1.1.6",
  hasPermssion: 0,
  credits: "Hoàng Quân",
  description: "Tag một người nào đó một số lần nhất định",
  commandCategory: "Hình Ảnh",
  usages: "tag @taggedUser <number>",
  cooldowns: 5,
};

module.exports.run = async function({ api, args, Users, event }) {
  const { threadID, messageID, senderID, mentions } = event;
  const mention = Object.keys(mentions)[0];

  // Kiểm tra xem có người được tag không
  if (!mention) {
      return api.sendMessage("Bạn cần tag một người nào đó!", threadID, messageID);
  }

  // Debug: In ra args để kiểm tra đầu vào thực tế
  console.log("Args received:", args);

  // Lấy số cuối cùng trong args (nếu là số) làm số lần tag
  const lastArg = args[args.length - 1];
  const times = /^[0-9]+$/.test(lastArg) ? parseInt(lastArg, 10) : NaN;

  if (isNaN(times) || times <= 0) {
      return api.sendMessage("Bạn cần nhập một số lần tag hợp lệ!", threadID, messageID);
  }

  const tagName = mentions[mention].replace("@", "");

  for (let i = 0; i < times; i++) {
      setTimeout(() => {
          api.sendMessage({
              body: `ra đây chơi em ${tagName}`,
              mentions: [{
                  tag: tagName,
                  id: mention
              }]
          }, threadID);
      }, i * 2000);
  }

  // Gửi tin nhắn cuối cùng
  setTimeout(() => {
      api.sendMessage(`Done tag ${tagName}`, threadID, messageID);
  }, times * 2000);
};
