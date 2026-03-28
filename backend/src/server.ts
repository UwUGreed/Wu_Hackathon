import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT_NUM, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT_NUM}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Plaid env:   ${env.PLAID_ENV}`);
  console.log(`   Frontend:    ${env.FRONTEND_ORIGIN}`);
});
