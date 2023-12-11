import { createNextRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Sets up our uploadthing endpoints
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});
