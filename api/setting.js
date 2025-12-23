module.exports = {
    // --- KREDENSIAL UTAMA ---
    botToken: "8585698683:AAHVVVKtNg37GHMvz34Mmn4IwMGBirQ5vIQ", 
    redisUrl: "https://top-starling-47196.upstash.io",
    redisToken: "AbhcAAIncDE3OGVhMWE4YjU0ZGY0ZmJlOThjYTJiODM5ZThmZTY0ZnAxNDcxOTY",
    
    // --- PENGATURAN BOT ---
    botName: "XdpzQ-AI",
    ownerId: "7341190291", 
    defaultOwnerName: "XdpzQ",
    defaultWa: "6285736486023",
    
    // --- INSTRUKSI AI (Aman & Profesional) ---
    persona: (aiName, ownerName) => {
        return `Halo! Saya adalah ${aiName}, asisten AI yang cerdas dan sopan. Saya diciptakan oleh ${ownerName}. Saya siap membantu menjawab pertanyaan Anda dengan cara yang bermanfaat dan positif.`;
    },

    owner: {
        name: "XdpzQ",
        whatsapp: "6285736486023",
        waLink: (num) => `https://wa.me/${num.replace(/[^0-9]/g, '')}`
    }
};
