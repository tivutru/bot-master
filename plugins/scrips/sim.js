module.exports.config = {
  name: "sim",
  version: "4.3.6",
  hasPermssion: 0,
  credits: "Hoàng Quân",
  description: "Similari",
  commandCategory: "Chat cùng sim",
  usages: "[args]",
  cooldowns: 5,
  dependencies: [
      "axios"
  ]
};

const axios = require("axios");

const similari = async (a) => {
  const g = (a) => encodeURIComponent(a);
  try {
      const { data: j } = await axios({
          url: `http://localhost:8888/sim?type=ask&&ask=${g(a)}`,
          method: "GET",
      });
      return { error: false, data: j };
  } catch (p) {
      return { error: true, data: {} };
  }
};

module.exports.onLoad = async function () {
  if (typeof global.sim === "undefined") {
      global.sim = {};
  }
  if (typeof global.sim.similari === "undefined") {
      global.sim.similari = new Map();
  }
};

module.exports.event = async function ({ api: b, event: a }) {
  const { threadID: c, messageID: d, senderID: e, body: f } = a;
  const g = (e) => b.sendMessage(e, c, d);

  if (global.sim.similari.has(c)) {
      if (e === b.getCurrentUserID() || f === "" || d === global.sim.similari.get(c)) {
          return;
      }
      var { data: h, error: i } = await similari(f, b, a);
      if (i === true) {
          return;
      }
      if (h.success === false) {
          g(h.error);
          return;
      }
      if (h.simsay) {
          g(`Sim said\n[ ${h.simsay} ]`);
      }
  }
};

module.exports.run = async function ({ api: b, event: a, args: c }) {
  const { threadID: d, messageID: e } = a;
  const f = (c) => b.sendMessage(c, d, e);

  if (c.length === 0) {
      return f("Nói gì đi :))");
  }

  switch (c[0]) {
      case "on":
          return global.sim.similari.has(d)
              ? f("Chưa tắt Simsimi kìa :))")
              : (global.sim.similari.set(d, e), f("Simsimi on."));
      case "off":
          return global.sim.similari.has(d)
              ? (global.sim.similari.delete(d), f("Simsimi off."))
              : f("Chưa bật Simsimi kìa :))");
      default:
          axios
              .get(encodeURI(`http://localhost:8888/sim?type=ask&&ask=${c.join(" ")}`))
              .then((res) => {
                  if (res.data.simsay === "Em Không Biết Nó Là Gì!" || res.data.simsay === "Em Không Biết Nó Là Gì!") {
                      b.sendMessage("Em không biết đó là gì", d, e);
                  } else {
                      b.sendMessage(`Sim said\n[ ${res.data.simsay} ]`, d, e);
                  }
              });
  }
};
