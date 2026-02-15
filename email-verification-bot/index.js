require("dotenv").config();
const { MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin, LogService } = require("matrix-bot-sdk");

LogService.setLevel("info");

const homeserverUrl = process.env.HOMESERVER;
const accessToken = process.env.ACCESS_TOKEN;

if (!homeserverUrl || !accessToken) {
    console.error("Missing HOMESERVER or ACCESS_TOKEN in .env file");
    process.exit(1);
}

const storage = new SimpleFsStorageProvider("bot.json");
const client = new MatrixClient(homeserverUrl, accessToken, storage);

AutojoinRoomsMixin.setupOnClient(client);

async function startBot() {
    await client.start();
    console.log("Matrix bot started and syncing...");

    client.on("room.message", async (roomId, event) => {
        if (!event.content) return;

        const sender = event.sender;
        const body = event.content.body;

        const botUserId = await client.getUserId();
        if (sender === botUserId) return;

        console.log(`Message from ${sender}: ${body}`);

        if (body === "!ping") {
            await client.sendText(roomId, "Pong!");
        }
    });
}

startBot().catch(err => {
    console.error("Bot crashed:", err);
});
