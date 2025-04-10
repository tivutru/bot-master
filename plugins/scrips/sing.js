module.exports.config = {
  name: 'sing',
  version: '1.0.0',
  hasPermssion: 0,
  credits: 'Hoàng Quân',
  description: 'Phát nhạc hoặc video thông qua link YouTube hoặc từ khoá tìm kiếm',
  commandCategory: 'Tiện ích',
  usages: 'sing < keyword/url >',
  usePrefix: true,
  cooldowns: 5,
  dependencies: [
      "moment-timezone",
      "axios",
      "fs-extra",
      "@distube/ytdl-core",
      "@ffmpeg-installer/ffmpeg",
      "fluent-ffmpeg"
  ]
};

module.exports.onLoad = () => {
  const fs = require("fs-extra");
  const request = require("request");
  const dirMaterial = __dirname + `/cache/noprefix/`;
  if (!fs.existsSync(dirMaterial + "noprefix")) fs.mkdirSync(dirMaterial, { recursive: true });
  if (!fs.existsSync(dirMaterial + "ytb.jpeg")) request("https://i.imgur.com/CqgfBW8.jpeg").pipe(fs.createWriteStream(dirMaterial + "ytb.jpeg"));
};

const mediaSavePath = __dirname + '/cache/Youtube/';
const key = "AIzaSyABEksrRH1dCRtako02uWygK9HxunyDW5c";

module.exports.handleReply = async function ({ api, event, handleReply, client }) {
  const { threadID, messageID, body, senderID } = event;
  const { author, videoID, IDs, type: reply_type } = handleReply;
  if (senderID != author) return;

  const { createWriteStream, createReadStream, unlinkSync, existsSync, mkdirSync, statSync } = require('fs-extra');
  const moment = require('moment-timezone');
  const axios = require('axios');

  const downloadMedia = async (videoID, type) => {
      const filePath = `${mediaSavePath}${Date.now()}${senderID}.${(type == 'video') ? 'mp4' : 'm4a'}`;
      try {
          if (!existsSync(mediaSavePath)) mkdirSync(mediaSavePath, { recursive: true });
          const ytdl = require('@distube/ytdl-core');
          const ffmpeg = require('fluent-ffmpeg');
          const stream = ytdl('https://www.youtube.com/watch?v=' + videoID, type == 'video' ? { quality: '18' } : { filter: 'audioonly' });

          await new Promise((resolve, reject) => {
              if (type == 'video') {
                  stream.pipe(createWriteStream(filePath))
                      .on('error', reject)
                      .on('close', resolve);
              } else {
                  ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
                  ffmpeg(stream)
                      .audioCodec("aac")
                      .save(filePath)
                      .on("error", reject)
                      .on("end", resolve);
              }
          });

          return { filePath, error: 0 };
      } catch (e) {
          console.log(e);
          return { filePath, error: 1 };
      }
  };

  switch (reply_type) {
      case 'download': {
          const { filePath, error } = await downloadMedia(videoID, body == '1' ? 'video' : 'audio');
          const videoInfo = (await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoID}&key=${key}`)).data.items[0];
          const mediaData = {
              title: videoInfo.snippet.title,
              duration: prettyTime(videoInfo.contentDetails.duration)
          };

          if (error != 0) {
              api.sendMessage('→ Đã có lỗi xảy ra.', threadID, messageID);
              if (existsSync(filePath)) unlinkSync(filePath);
          } else {
              api.unsendMessage(handleReply.messageID);
              const sizeLimit = (body == '1') ? 50 * 1024 * 1024 : 26 * 1024 * 1024;
              if (statSync(filePath).size > sizeLimit) {
                  api.sendMessage('→ Không thể gửi vì kích thước tệp quá lớn.', threadID, messageID);
                  unlinkSync(filePath);
              } else {
                  api.sendMessage({
                      body: `📥 𝗧𝗔̉𝗜 𝗫𝗨𝗢̂́𝗡𝗚 𝗧𝗛𝗔̀𝗡𝗛 𝗖𝗢̂𝗡𝗚! 🎉
⏱ Thời lượng: ${mediaData.duration}`,
                      attachment: createReadStream(filePath)
                  }, threadID, err => {
                      if (err) api.sendMessage('→ Gửi file lỗi.', threadID, messageID);
                      if (existsSync(filePath)) unlinkSync(filePath);
                  }, messageID);
              }
          }
          break;
      }
      case 'list': {
          if (isNaN(body) || body < 1 || body > IDs.length) {
              return api.sendMessage('→ Vui lòng chọn số hợp lệ từ danh sách.', threadID, messageID);
          }
          api.unsendMessage(handleReply.messageID);
          const chosenID = IDs[parseInt(body) - 1];
          const videoInfo = (await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${chosenID}&key=${key}`)).data.items[0];
          const title = videoInfo.snippet.title;
          const duration = prettyTime(videoInfo.contentDetails.duration);

          api.sendMessage(`
🎬 𝗟𝘂̛̣𝗮 𝗖𝗵𝗼̣𝗻 𝗧𝗮̉𝗶 𝗩𝗲̂̀:

1. 📹 Video
2. 🎵 Âm thanh`, threadID, (error, info) => {
              if (!error) {
                  client.handleReply.push({
                      type: 'download',
                      name: this.config.name,
                      messageID: info.messageID,
                      author: senderID,
                      videoID: chosenID
                  });
              }
          }, messageID);
          break;
      }
  }
};

module.exports.run = async function ({ api, event, args, client }) {
  const { threadID, messageID, senderID } = event;
  if (args.length == 0) return api.sendMessage('→ Vui lòng nhập từ khoá hoặc URL.', threadID, messageID);

  const input = args.join(' ');
  const urlPatten = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
  const isValidUrl = urlPatten.test(input);

  const axios = require('axios');

  const getBasicInfo = async (keyword) => {
      return (await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${keyword}&type=video&key=${key}`)).data.items;
  };

  try {
      if (isValidUrl) {
          let videoID = input.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
          videoID = (videoID[2] !== undefined) ? videoID[2].split(/[^0-9a-z_\-]/i)[0] : videoID[0];

          const videoInfo = (await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoID}&key=${key}`)).data.items[0];
          const title = videoInfo.snippet.title;
          const duration = prettyTime(videoInfo.contentDetails.duration);

          return api.sendMessage(`
🎬 𝗟𝘂̛̣𝗮 𝗖𝗵𝗼̣𝗻 𝗧𝗮̉𝗶 𝗩𝗲̂̀:

1. 📹 Video
2. 🎵 Âm thanh`, threadID, (error, info) => {
              if (!error) {
                  client.handleReply.push({
                      type: 'download',
                      name: this.config.name,
                      messageID: info.messageID,
                      author: senderID,
                      videoID
                  });
              }
          }, messageID);
      } else {
          const results = await getBasicInfo(input);
          let msg = `🔎 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 | 𝐊𝐞̂́𝐭 𝐪𝐮𝐚̉ 𝐜𝐡𝐨 𝐭𝐮̛̀ 𝐤𝐡𝐨́𝐚: "${input}"

`, IDs = [];

          for (let i = 0; i < results.length; i++) {
              const id = results[i].id.videoId;
              if (id) {
                  IDs.push(id);
                  const duration = prettyTime((await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${key}`)).data.items[0].contentDetails.duration);
                  msg += `📼 ${i + 1}. ${results[i].snippet.title}
⏱ ${duration}
━━━━━━━━━━━━━━
`;
              }
          }

          msg += '→ Reply chọn số để tải.';
          api.sendMessage(msg, threadID, (error, info) => {
              if (!error) {
                  client.handleReply.push({
                      type: 'list',
                      name: this.config.name,
                      messageID: info.messageID,
                      author: senderID,
                      IDs
                  });
              }
          }, messageID);
      }
  } catch (e) {
      api.sendMessage('→ Đã xảy ra lỗi:\n' + e.message, threadID, messageID);
  }
};

const prettyTime = (time) => {
  let h = 0, m = 0, s = 0;
  time = time.replace("PT", "");
  if (time.includes("H")) [h, time] = time.split("H");
  if (time.includes("M")) [m, time] = time.split("M");
  if (time.includes("S")) [s] = time.split("S");
  h = parseInt(h || 0), m = parseInt(m || 0), s = parseInt(s || 0);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
