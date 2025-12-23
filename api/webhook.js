
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const { Redis } = require('@upstash/redis');
const crypto = require('crypto');
const config = require('./setting'); // Memanggil file setting.js

const redis = new Redis({
    url: config.redisUrl,
    token: config.redisToken,
});

module.exports = async (req, res) => {
    const token = config.botToken;
    if (!token) return res.status(200).send('Token Missing');
    const bot = new Telegraf(token);

    const isOwner = (id) => id.toString() === config.ownerId;

    const getMainMenu = (userId) => {
        const buttons = [
            [Markup.button.callback('📊 Info Sistem', 'info_user'), Markup.button.callback('👤 Owner', 'view_owner')],
            [Markup.button.callback('🎟️ Upload Token VIP', 'upload_token')]
        ];
        if (isOwner(userId)) {
            buttons.unshift([Markup.button.callback('➕ API Key', 'setup_key'), Markup.button.callback('📜 List Keys', 'list_keys')]);
            buttons.push([Markup.button.callback('👥 List User VIP', 'list_user')]);
        }
        return Markup.inlineKeyboard(buttons);
    };

    bot.start((ctx) => {
        const msg = isOwner(ctx.from.id) ? "Halo Boss! Gunakan menu di bawah untuk mengelola bot." : "Halo! Selamat datang di XdpzQ-AI.";
        ctx.replyWithMarkdown(msg, getMainMenu(ctx.from.id));
    });

    // --- FITUR OWNER ---
    bot.command('adduser', async (ctx) => {
        if (!isOwner(ctx.from.id)) return;
        await redis.set(`state:${ctx.from.id}`, 'vip_1');
        ctx.reply("🛠️ *Tambah VIP*\n1. Masukkan Nama AI:");
    });

    bot.action('setup_key', (ctx) => {
        if (isOwner(ctx.from.id)) {
            redis.set(`state:${ctx.from.id}`, 'awaiting_key');
            ctx.reply('Kirimkan API Key OpenRouter:');
        }
    });

    // --- MESSAGE HANDLER ---
    bot.on('text', async (ctx) => {
        const userId = ctx.from.id;
        const text = ctx.message.text;
        const stateRaw = await redis.get(`state:${userId}`);

        // Handle States (Add User, Key, etc)
        if (stateRaw === 'vip_1' && isOwner(userId)) {
            await redis.set(`temp_vip:${userId}`, JSON.stringify({ aiName: text }));
            await redis.set(`state:${userId}`, 'vip_2');
            return ctx.reply("2. Masukkan Nama Owner:");
        }
        // ... (Lanjutkan logika state seperti kode sebelumnya)

        if (text.startsWith('/')) return;

        // --- LOGIKA CHAT AI ---
        const keys = await redis.smembers('apikeys:pool');
        if (keys.length === 0) return ctx.reply("⚠️ API Key OpenRouter belum dikonfigurasi oleh owner.");

        let aiName = config.botName, ownerName = config.defaultOwnerName;
        const userVip = await redis.get(`user_vip:${userId}`);
        if (userVip) {
            const d = await redis.get(`vip_token:${userVip}`);
            if (d) { aiName = d.aiName; ownerName = d.ownerName; }
        }

        await ctx.sendChatAction('typing');
        await redis.incr(`chat_count:${userId}`);

        try {
            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'deepseek/deepseek-chat',
                messages: [
                    { role: 'system', content: config.persona(aiName, ownerName) },
                    { role: 'user', content: text }
                ]
            }, { 
                headers: { 'Authorization': `Bearer ${keys[0]}` },
                timeout: 30000 
            });

            const aiMsg = response.data.choices[0].message.content;
            ctx.reply(aiMsg);
        } catch (e) {
            ctx.reply("❌ Terjadi kesalahan pada server AI atau API Key tidak valid.");
        }
    });

    if (req.method === 'POST') await bot.handleUpdate(req.body);
    res.status(200).send('OK');
};
