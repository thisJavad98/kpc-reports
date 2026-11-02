import { serve } from "@hono/node-server";
import { app } from "./index.js";

const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`KPC Reports API listening on http://localhost:${port}`);
});
