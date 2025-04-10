/** Đổi Credit ? Bọn t đã không mã hóa cho mà edit rồi thì tôn trọng nhau tý đi ¯\_(ツ)_/¯ **/
module.exports.config = {
    name: "",    
    version: "1.0.0",
    hasPermssion: 0,
    credits: "hoangquan",
    description: "Random text",
    commandCategory: "sailenh",
    usages: "buooi",
    cooldowns: 0,
 
  };
  
  module.exports.run = async({api,event}) => {
  var hq = ["1 + 1 = 2",
"1+1=2",
"2 x 2 = 4",
"Chúc bạn 1 ngày tốt lành",
"Bạn đã biết",
"kẹo sữa mikita được làm từ sữa",
"Trái đất hình tròn",
"Em tên là...",
"Đây là project Bot"
]; 
 api.sendMessage(`[ Bạn có biết ]\n` + hq[Math.floor(Math.random() * hq.length)],event.threadID, event.messageID);
}