const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Telegraf } = require("telegraf");
const { exec } = require("child_process");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const runCommand = (cmd) => {
    return new Promise((res) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) return res("Error: " + err.message);
            res(stdout || stderr || "Done");
        });
    });
};

bot.on("text", async (ctx) => {
    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
        const result = await model.generateContent("You are a Linux bot. Use EXEC: command for actions. User: " + ctx.message.text);
        const text = result.response.text();
        if (text.includes("EXEC:")) {
            const cmd = text.split("EXEC:")[1].trim();
            ctx.reply("⚙️ Running: " + cmd);
            const out = await runCommand(cmd);
            ctx.reply("📄 " + out);
        } else { ctx.reply(text); }
    } catch (e) { ctx.reply("Err: " + e.message); }
});

bot.launch().then(() => console.log("OK"));
