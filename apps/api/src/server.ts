import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT ?? 5000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Invalid PORT environment variable");
}

app.listen(port, () => {
  console.log(`ProjectFlow API running at http://localhost:${port}`);
});
