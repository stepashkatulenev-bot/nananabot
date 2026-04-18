const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Telegraf } = require("telegraf");
const { exec } = require("child_process");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const runCommand = (cmd) => {
    return new Promise((res) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) return res("Ошибка: " + err.message);
            res(stdout  stderr  "Готово");
        });
    });
};

bot.on("text", async (ctx) => {
    try {
        // ИСПОЛЬЗУЕМ ТЕРМИНАЛЬНУЮ ВЕРСИЮ МОДЕЛИ
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent("Ты — Linux-терминал с ИИ. Если юзер просит действие, используй формат EXEC: команда. Юзер пишет: " + ctx.message.text);
        const response = await result.response;
        const text = response.text();

        if (text.includes("EXEC:")) {
            const cmd = text.split("EXEC:")[1].trim();
            ctx.reply("⚙️ Запускаю: " + cmd);
            const out = await runCommand(cmd);
            ctx.reply("📄 Результат:\n" + out);
        } else {
            ctx.reply(text);
        }
    } catch (e) {
        console.error(e);
        ctx.reply("Бот временно перегружен или API ключ не активен. Проверь статус в Railway.");
    }
});

bot.launch().then(() => console.log("Бот в сети!"));
