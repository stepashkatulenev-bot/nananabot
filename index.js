const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Telegraf } = require("telegraf");
const { exec } = require("child_process");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const runCommand = (command) => {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve("Error: " + error.message);
                return;
            }
            resolve(stdout  stderr  "Success");
        });
    });
};

bot.on("text", async (ctx) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = System: Linux. Action format EXEC: command. User: ${ctx.message.text};
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (text.includes("EXEC:")) {
            const cmd = text.split("EXEC:")[1].trim();
            ctx.reply("Running: " + cmd);
            const output = await runCommand(cmd);
            ctx.reply("Output:\n" + output);
        } else {
            ctx.reply(text);
        }
    } catch (e) {
        ctx.reply("Error: " + e.message);
    }
});

bot.launch().then(() => console.log("Bot is running!"));
