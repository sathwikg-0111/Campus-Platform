import { createFileRoute } from "@tanstack/react-router";

import campusHtml from "../../../public/campus.html?raw";

export const Route = createFileRoute("/api/campus")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(campusHtml, {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      },
    },
  },
});
