const redis = require("redis");
const client = redis.createClient({});

client.connect();

client.on("connect", async () => {
  console.log("Redis connected");
});


client.on("error", async (err) => {
  console.log(err.message);
});

client.on("ready",async  () => {
  console.log("Redis ready");
});

client.on("end",async  () => {
  console.log("Redis disconnected");
});

process.on("SIGINT", async () => {
  await client.quit();
  process.exit(0);
});



module.exports = client;
