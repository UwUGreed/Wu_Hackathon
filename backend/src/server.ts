import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT_NUM, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT_NUM}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Plaid env:   ${env.PLAID_ENV}`);
  console.log(`   Frontend:    ${env.FRONTEND_ORIGIN}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${env.PORT_NUM} is already in use.`);
    console.error("Another backend dev server is probably already running.");
    console.error("Stop the existing process, or choose a different PORT and update the Vite proxy to match.");
    process.exit(1);
  }

  console.error("Failed to start server:", error);
  process.exit(1);
});
