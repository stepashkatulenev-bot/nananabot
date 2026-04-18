const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Telegraf } = require("telegraf");

// Инициализация
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.on("text", async (ctx) => {
    try {
        // 1. Включаем статус "печатает"
        await ctx.sendChatAction("typing");

        // 2. Подключаем модель (flash 1.5 — самая быстрая и стабильная в 2026)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 3. Запрос к ИИ
        const result = await model.generateContent(ctx.message.text);
        const response = await result.response;
        const text = response.text();

        // 4. Отправляем ответ
        await ctx.reply(text);

    } catch (e) {
        console.error(e);
        // Если модель недоступна, пробуем резервную (pro)
        try {
            const backupModel = genAI.getGenerativeModel({ model: "gemini-pro" });
            const res = await backupModel.generateContent(ctx.message.text);
            await ctx.reply(res.response.text());
        } catch (err) {
            await ctx.reply("Брат, какая-то суета с ключами или интернетом. Глянь логи!");
        }
    }
});

bot.launch().then(() => console.log("🚀 Бот на связи и печатает!"));
