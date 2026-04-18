const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Telegraf } = require("telegraf");
const { exec } = require("child_process");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const runCommand = (command) => {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve(Ошибка: ${error.message});
                return;
            }
            resolve(stdout  stderr  "Выполнено успешно.");
        });
    });
};

bot.on("text", async (ctx) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const systemPrompt = `Ты - автономный ИИ. Ты работаешь на Linux-сервере.
        Если пользователь просит что-то сделать с системой, напиши команду в формате EXEC: команда.
        Пример: если просят список файлов, пиши EXEC: ls -la.
        Запрос пользователя: ${ctx.message.text}`;

        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        if (text.includes("EXEC:")) {
            const cmd = text.split("EXEC:")[1].trim();
            ctx.reply(⚙️ Выполняю команду: ${cmd});
            const output = await runCommand(cmd);
            ctx.reply(📄 Результат:\n${output});
        } else {
            ctx.reply(text);
        }
    } catch (e) {
        ctx.reply("Ошибка: " + e.message);
    }
});

bot.launch().then(() => console.log("Бот запущен!"));
