import { createFileRoute } from "@tanstack/react-router";
// Vite inlines the image as a data URI string; we strip the prefix to get raw base64.
import heroDataUri from "../../../public/images/campus-hero.jpg?inline";

const base64 = heroDataUri.split(",")[1] ?? "";
const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

export const Route = createFileRoute("/api/campus-hero")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(bytes, {
          headers: {
            "content-type": "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
