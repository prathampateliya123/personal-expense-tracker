import http from "node:http";
import https from "node:https";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const MAX_HEADER_SIZE = 64 * 1024;

function patchCreateServer(mod) {
  const original = mod.createServer;
  if (original.__headerSizePatched) return;
  function patched(...args) {
    if (typeof args[0] === "function") {
      return original.call(this, { maxHeaderSize: MAX_HEADER_SIZE }, args[0]);
    }
    if (args[0] && typeof args[0] === "object") {
      args[0] = { ...args[0], maxHeaderSize: MAX_HEADER_SIZE };
    }
    return original.apply(this, args);
  }
  patched.__headerSizePatched = true;
  mod.createServer = patched;
}

patchCreateServer(http);
patchCreateServer(https);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 8000,
    strictPort: true,
    host: true,
    cors: true,
    allowedHosts: true
  },
  preview: {
    port: 8000,
    strictPort: true,
    host: true,
    cors: true,
    allowedHosts: true
  }
});
