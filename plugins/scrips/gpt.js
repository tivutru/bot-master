const axios = require("axios");

module.exports.config = {
  name: "gpt",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Quân/ đổi cái djt con cụ nhà m",
  description: "Trò chuyện với ChatGPT qua API",
  commandCategory: "AI",
  usages: "[prompt]",
  cooldowns: 2
};

// Hàm gọi API ChatGPT của bạn
async function callGPT(prompt) {
  try {
    const res = await axios.get(`http://localhost:8899/gpt?text=${encodeURIComponent(prompt)}`);
    if (res.data?.success) {
      return { data: res.data };
    } else {
      return { error: true, message: res.data.message || "Không có phản hồi từ GPT." };
    }
  } catch (err) {
    return { error: true, message: "Không thể gọi API GPT." };
  }
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("❌ Bạn chưa nhập nội dung để hỏi.", threadID, messageID);
  }

  if (!global.gptChat) global.gptChat = new Map();
  global.gptChat.set(threadID, senderID);

  api.sendMessage({ body: "🤖 Đang hỏi GPT...", typing: true }, threadID);

  const { data, error, message } = await callGPT(prompt).catch(err => {
    console.error("❌ GPT Error:", err);
    return { error: true, message: "GPT gặp lỗi xử lý." };
  });

  if (error) return api.sendMessage(message || "GPT không phản hồi.", threadID, messageID);
  return api.sendMessage(`🤖 GPT: ${data.reply}`, threadID, messageID);
};

module.exports.event = async function ({ api, event }) {
  try {
    const { threadID, messageID, senderID, body, mentions } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    // Fix lỗi: đảm bảo gptChat tồn tại
    if (!global.gptChat) global.gptChat = new Map();
    if (!global.gptChat.has(threadID)) return;

    const botID = api.getCurrentUserID();
    if (!mentions || !Object.keys(mentions).includes(botID.toString())) return;
    if (!body) return;

    const prompt = body.replace(/@.+?\s?/, "").trim();
    if (prompt.length < 1) return;

    console.log(`[GPT ASK] ${prompt}`);
    api.sendMessage({ body: "", typing: true }, threadID);

    const { data, error, message } = await callGPT(prompt).catch(err => {
      console.error("❌ GPT Event Error:", err);
      return { error: true, message: "GPT gặp lỗi xử lý." };
    });

    if (error) return send(message || "GPT không phản hồi.");
    return send(`🤖 GPT: ${data.reply}`);
  } catch (err) {
    console.error("❌ Lỗi ngoài event GPT:", err);
  }
};
