const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = "6655961643:AAGXLmpRYphB4RKergrYPmsz977Z50ONVCc";
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const chatMessage = msg.text;

  const channels = [
    {
      id: "Muz_Yurak_offical",
      name: "Muz Yurak",
    },
    {
      id: "Sh_Zuxriddin",
      name: "Sharipov Zuxriddin",
    },
  ];

  const keyboard = channels.map((channel) => [
    {
      text: channel.name,
      url: `https://t.me/${channel.id}`,
    },
  ]);

  const options = {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  };

  async function checkSubscribedChannels() {
    const subscribedChannels = [];

    for (const channel of channels) {
      try {
        const member = await bot.getChatMember(`@${channel.id}`, chatId);
        const result = member.status !== "left" && member.status !== "kicked";
        subscribedChannels.push(result);
      } catch (error) {
        console.error(error.message);
        subscribedChannels.push(false);
      }
    }

    const trueAll = subscribedChannels.every((element) => element === true);
    const falseAll = subscribedChannels.every((element) => element === false);

    if (falseAll) {
      const reOffer = bot.sendMessage(
        chatId,
        `Hello, Subscribe to our channels:`,
        options
      );
      setTimeout(() => {
        bot.sendMessage(
          chatId,
          "Subscribe to all channels and send /start to the bot again."
        );
      }, 500);
      return reOffer;
    } else if (trueAll) {
      const reOffer = bot.sendMessage(
        chatId,
        "Thank you, you have successfully subscribed to all our channels"
      );
      setTimeout(() => {
        bot.sendMessage(chatId, "Please send us instagram video link");
      }, 500);

      trueAll &&
        bot.on("message", (chat) => {
          const url = chat.text;
          url.includes("https://www.instagram.com/") &&
            bot.sendMessage(chatId, "Video is loading...");
          url.includes("https://www.instagram.com/") &&
            fetchData(url)
              .then((response) => {
                response.map((items) => {
                  bot.sendVideo(chatId, items.url);
                });
              })
              .catch((error) => {
                console.error(error.message);
                bot.sendMessage(
                  chatId,
                  "Sorry, a system error has occurred or the api the bot is using has reached its limit!"
                );
              });
          url !== "/start" &&
            !url.includes("https://www.instagram.com/") &&
            bot.sendMessage(chatId, "Please send us instagram video link");
        });

      return reOffer;
    } else {
      const reOffer = bot.sendMessage(
        chatId,
        `You are not subscribed to all our channels:`,
        options
      );
      setTimeout(() => {
        bot.sendMessage(
          chatId,
          "Subscribe to all channels and send /start to the bot again."
        );
      }, 500);
      return reOffer;
    }
  }

  await checkSubscribedChannels();
});

async function fetchData(req) {
  const options = {
    method: "GET",
    url: "https://instagram-post-reels-stories-downloader.p.rapidapi.com/instagram/",
    params: {
      url: req,
    },
    headers: {
      "X-RapidAPI-Key": "3585b13aa5msh5bd3266d799932ap167184jsn9e2d2e746f31",
      "X-RapidAPI-Host":
        "instagram-post-reels-stories-downloader.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data.result;
  } catch (error) {
    console.error(error.message);
  }
}
