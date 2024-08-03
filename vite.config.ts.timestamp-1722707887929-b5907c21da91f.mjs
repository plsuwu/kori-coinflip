// vite.config.ts
import { defineConfig } from "file:///home/please/Documents/Repositories/plsuwu/kori-coinflip/node_modules/vite/dist/node/index.js";
import { crx } from "file:///home/please/Documents/Repositories/plsuwu/kori-coinflip/node_modules/@crxjs/vite-plugin/dist/index.mjs";
import solidPlugin from "file:///home/please/Documents/Repositories/plsuwu/kori-coinflip/node_modules/vite-plugin-solid/dist/esm/index.mjs";

// src/manifest.ts
import { defineManifest } from "file:///home/please/Documents/Repositories/plsuwu/kori-coinflip/node_modules/@crxjs/vite-plugin/dist/index.mjs";
var manifest = defineManifest(async () => ({
  manifest_version: 3,
  name: "kori coinflip",
  version: "0.1.0",
  background: { service_worker: "src/lib/worker.tsx" },
  permissions: ["storage"],
  action: {
    default_popup: "index.html",
    default_icon: "public/kori.png"
  }
  // content_scripts: [
  // 	{
  // 		matches: ['http://*/*', 'https://*/*', '<all_urls>'],
  // 		js: ['src/lib/util/persist.tsx'],
  // 	},
  // 	{
  // 		matches: ['https://twitch.tv/kori'],
  // 		js: ['src/lib/util/socket.tsx'],
  // 	},
  // ],
}));
var manifest_default = manifest;

// vite.config.ts
var vite_config_default = defineConfig({
  plugins: [
    solidPlugin(),
    crx({ manifest: manifest_default })
  ],
  server: {
    port: 3e3
  },
  build: {
    target: "esnext",
    rollupOptions: {
      // input: {
      //   devtools: resolve(pagesDir, "devtools", "index.html"),
      //   panel: resolve(pagesDir, "panel", "index.html"),
      //   content: resolve(pagesDir, "content", "index.ts"),
      //   background: resolve(pagesDir, "background", "index.ts"),
      //   contentStyle: resolve(pagesDir, "content", "style.scss"),
      //   popup: resolve(pagesDir, "popup", "index.html"),
      //   newtab: resolve(pagesDir, "newtab", "index.html"),
      //   options: resolve(pagesDir, "options", "index.html"),
      // },
      // output: {
      //   entryFileNames: "src/pages/[name]/index.js",
      //   chunkFileNames: isDev
      //     ? "assets/js/[name].js"
      //     : "assets/js/[name].[hash].js",
      //   assetFileNames: (assetInfo) => {
      //     const { dir, name: _name } = path.parse(assetInfo.name);
      //     // const assetFolder = getLastElement(dir.split("/"));
      //     // const name = assetFolder + firstUpperCase(_name);
      //     return `assets/[ext]/${name}.chunk.[ext]`;
      //   },
      // },
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21hbmlmZXN0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcGxlYXNlL0RvY3VtZW50cy9SZXBvc2l0b3JpZXMvcGxzdXd1L2tvcmktY29pbmZsaXBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3BsZWFzZS9Eb2N1bWVudHMvUmVwb3NpdG9yaWVzL3Bsc3V3dS9rb3JpLWNvaW5mbGlwL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3BsZWFzZS9Eb2N1bWVudHMvUmVwb3NpdG9yaWVzL3Bsc3V3dS9rb3JpLWNvaW5mbGlwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBjcnggfSBmcm9tICdAY3J4anMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHNvbGlkUGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLXNvbGlkJztcbmltcG9ydCBtYW5pZmVzdCBmcm9tICcuL3NyYy9tYW5pZmVzdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBzb2xpZFBsdWdpbigpLFxuICAgIGNyeCh7IG1hbmlmZXN0IH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgLy8gaW5wdXQ6IHtcbiAgICAgIC8vICAgZGV2dG9vbHM6IHJlc29sdmUocGFnZXNEaXIsIFwiZGV2dG9vbHNcIiwgXCJpbmRleC5odG1sXCIpLFxuICAgICAgLy8gICBwYW5lbDogcmVzb2x2ZShwYWdlc0RpciwgXCJwYW5lbFwiLCBcImluZGV4Lmh0bWxcIiksXG4gICAgICAvLyAgIGNvbnRlbnQ6IHJlc29sdmUocGFnZXNEaXIsIFwiY29udGVudFwiLCBcImluZGV4LnRzXCIpLFxuICAgICAgLy8gICBiYWNrZ3JvdW5kOiByZXNvbHZlKHBhZ2VzRGlyLCBcImJhY2tncm91bmRcIiwgXCJpbmRleC50c1wiKSxcbiAgICAgIC8vICAgY29udGVudFN0eWxlOiByZXNvbHZlKHBhZ2VzRGlyLCBcImNvbnRlbnRcIiwgXCJzdHlsZS5zY3NzXCIpLFxuICAgICAgLy8gICBwb3B1cDogcmVzb2x2ZShwYWdlc0RpciwgXCJwb3B1cFwiLCBcImluZGV4Lmh0bWxcIiksXG4gICAgICAvLyAgIG5ld3RhYjogcmVzb2x2ZShwYWdlc0RpciwgXCJuZXd0YWJcIiwgXCJpbmRleC5odG1sXCIpLFxuICAgICAgLy8gICBvcHRpb25zOiByZXNvbHZlKHBhZ2VzRGlyLCBcIm9wdGlvbnNcIiwgXCJpbmRleC5odG1sXCIpLFxuICAgICAgLy8gfSxcbiAgICAgIC8vIG91dHB1dDoge1xuICAgICAgLy8gICBlbnRyeUZpbGVOYW1lczogXCJzcmMvcGFnZXMvW25hbWVdL2luZGV4LmpzXCIsXG4gICAgICAvLyAgIGNodW5rRmlsZU5hbWVzOiBpc0RldlxuICAgICAgLy8gICAgID8gXCJhc3NldHMvanMvW25hbWVdLmpzXCJcbiAgICAgIC8vICAgICA6IFwiYXNzZXRzL2pzL1tuYW1lXS5baGFzaF0uanNcIixcbiAgICAgIC8vICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgIC8vICAgICBjb25zdCB7IGRpciwgbmFtZTogX25hbWUgfSA9IHBhdGgucGFyc2UoYXNzZXRJbmZvLm5hbWUpO1xuICAgICAgLy8gICAgIC8vIGNvbnN0IGFzc2V0Rm9sZGVyID0gZ2V0TGFzdEVsZW1lbnQoZGlyLnNwbGl0KFwiL1wiKSk7XG4gICAgICAvLyAgICAgLy8gY29uc3QgbmFtZSA9IGFzc2V0Rm9sZGVyICsgZmlyc3RVcHBlckNhc2UoX25hbWUpO1xuICAgICAgLy8gICAgIHJldHVybiBgYXNzZXRzL1tleHRdLyR7bmFtZX0uY2h1bmsuW2V4dF1gO1xuICAgICAgLy8gICB9LFxuICAgICAgLy8gfSxcbiAgICB9LFxuICB9LFxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3BsZWFzZS9Eb2N1bWVudHMvUmVwb3NpdG9yaWVzL3Bsc3V3dS9rb3JpLWNvaW5mbGlwL3NyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcGxlYXNlL0RvY3VtZW50cy9SZXBvc2l0b3JpZXMvcGxzdXd1L2tvcmktY29pbmZsaXAvc3JjL21hbmlmZXN0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3BsZWFzZS9Eb2N1bWVudHMvUmVwb3NpdG9yaWVzL3Bsc3V3dS9rb3JpLWNvaW5mbGlwL3NyYy9tYW5pZmVzdC50c1wiO2ltcG9ydCB7IGRlZmluZU1hbmlmZXN0IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJztcbi8vIGltcG9ydCBwYWNrYWdlSnNvbiBmcm9tICcuLi9wYWNrYWdlLmpzb24nO1xuXG4vKipcbiAqIHJvbGx1cC1wbHVnaW4tY2hyb21lLWV4dGVuc2lvblxuICogaHR0cHM6Ly9naXRodWIuY29tL2V4dGVuZC1jaHJvbWUvcm9sbHVwLXBsdWdpbi1jaHJvbWUtZXh0ZW5zaW9uXG4gKi9cbmludGVyZmFjZSBNYW5pZmVzdCB7XG5cdG1hbmlmZXN0X3ZlcnNpb246IG51bWJlcjtcblx0bmFtZTogc3RyaW5nO1xuXHR2ZXJzaW9uOiBzdHJpbmc7XG5cdGRlc2NyaXB0aW9uPzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRpY29ucz86IGNocm9tZS5ydW50aW1lLk1hbmlmZXN0SWNvbnMgfCB1bmRlZmluZWQ7XG5cdGFjdGlvbj86IGNocm9tZS5ydW50aW1lLk1hbmlmZXN0QWN0aW9uIHwgdW5kZWZpbmVkO1xuICAgIHBlcm1pc3Npb25zPzogc3RyaW5nW10gfCB1bmRlZmluZWQ7XG5cdGJhY2tncm91bmQ/OlxuXHRcdHwge1xuXHRcdFx0XHRzZXJ2aWNlX3dvcmtlcjogc3RyaW5nO1xuXHRcdFx0XHR0eXBlPzogJ21vZHVsZSc7XG5cdFx0ICB9XG5cdFx0fCB1bmRlZmluZWQ7XG5cdGNvbnRlbnRfc2NyaXB0cz86XG5cdFx0fCB7XG5cdFx0XHRcdG1hdGNoZXM/OiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcblx0XHRcdFx0ZXhjbHVkZV9tYXRjaGVzPzogc3RyaW5nW10gfCB1bmRlZmluZWQ7XG5cdFx0XHRcdGNzcz86IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRqcz86IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRydW5fYXQ/OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdGFsbF9mcmFtZXM/OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRtYXRjaF9hYm91dF9ibGFuaz86IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRpbmNsdWRlX2dsb2JzPzogc3RyaW5nW10gfCB1bmRlZmluZWQ7XG5cdFx0XHRcdGV4Y2x1ZGVfZ2xvYnM/OiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcblx0XHQgIH1bXVxuXHRcdHwgdW5kZWZpbmVkO1xufVxuXG5jb25zdCBtYW5pZmVzdCA9IGRlZmluZU1hbmlmZXN0KGFzeW5jICgpID0+ICh7XG5cdG1hbmlmZXN0X3ZlcnNpb246IDMsXG5cdG5hbWU6ICdrb3JpIGNvaW5mbGlwJyxcblx0dmVyc2lvbjogJzAuMS4wJyxcblx0YmFja2dyb3VuZDogeyBzZXJ2aWNlX3dvcmtlcjogJ3NyYy9saWIvd29ya2VyLnRzeCcgfSxcbiAgICBwZXJtaXNzaW9uczogWyBcInN0b3JhZ2VcIiBdLFxuXHRhY3Rpb246IHtcblx0XHRkZWZhdWx0X3BvcHVwOiAnaW5kZXguaHRtbCcsXG5cdFx0ZGVmYXVsdF9pY29uOiAncHVibGljL2tvcmkucG5nJyxcblx0fVxuXHQvLyBjb250ZW50X3NjcmlwdHM6IFtcblx0Ly8gXHR7XG5cdC8vIFx0XHRtYXRjaGVzOiBbJ2h0dHA6Ly8qLyonLCAnaHR0cHM6Ly8qLyonLCAnPGFsbF91cmxzPiddLFxuXHQvLyBcdFx0anM6IFsnc3JjL2xpYi91dGlsL3BlcnNpc3QudHN4J10sXG5cdC8vIFx0fSxcblx0Ly8gXHR7XG5cdC8vIFx0XHRtYXRjaGVzOiBbJ2h0dHBzOi8vdHdpdGNoLnR2L2tvcmknXSxcblx0Ly8gXHRcdGpzOiBbJ3NyYy9saWIvdXRpbC9zb2NrZXQudHN4J10sXG5cdC8vIFx0fSxcblx0Ly8gXSxcbn0pKTtcblxuZXhwb3J0IGRlZmF1bHQgbWFuaWZlc3Q7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBWLFNBQVMsb0JBQW9CO0FBQ3ZYLFNBQVMsV0FBVztBQUVwQixPQUFPLGlCQUFpQjs7O0FDSHdVLFNBQVMsc0JBQXNCO0FBb0MvWCxJQUFNLFdBQVcsZUFBZSxhQUFhO0FBQUEsRUFDNUMsa0JBQWtCO0FBQUEsRUFDbEIsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLEVBQ1QsWUFBWSxFQUFFLGdCQUFnQixxQkFBcUI7QUFBQSxFQUNoRCxhQUFhLENBQUUsU0FBVTtBQUFBLEVBQzVCLFFBQVE7QUFBQSxJQUNQLGVBQWU7QUFBQSxJQUNmLGNBQWM7QUFBQSxFQUNmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFXRCxFQUFFO0FBRUYsSUFBTyxtQkFBUTs7O0FEcERmLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLFlBQVk7QUFBQSxJQUNaLElBQUksRUFBRSwyQkFBUyxDQUFDO0FBQUEsRUFDbEI7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQXVCZjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
