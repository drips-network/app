// vite.config.ts
import { sveltekit } from "file:///Users/jason/Code/radicle/drips-app-2/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { defineConfig } from "file:///Users/jason/Code/radicle/drips-app-2/node_modules/vitest/dist/config.js";
var config = defineConfig({
  plugins: [sveltekit()],
  test: {
    // Jest like globals
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.ts"],
    exclude: ["src/e2e-tests/.tmp/**"],
    setupFiles: ["./setup-test.js"],
    deps: {
      inline: ["@ethersproject/signing-key", "@ethersproject/basex", "@depay/solana-web3.js", "cupertino-pane"]
    }
  },
  build: {
    target: "es2020"
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020"
    }
  }
});
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFzb24vQ29kZS9yYWRpY2xlL2RyaXBzLWFwcC0yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvamFzb24vQ29kZS9yYWRpY2xlL2RyaXBzLWFwcC0yL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9qYXNvbi9Db2RlL3JhZGljbGUvZHJpcHMtYXBwLTIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5cbmNvbnN0IGNvbmZpZyA9IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtzdmVsdGVraXQoKV0sXG4gIHRlc3Q6IHtcbiAgICAvLyBKZXN0IGxpa2UgZ2xvYmFsc1xuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgaW5jbHVkZTogWydzcmMvKiovKi57dGVzdCxzcGVjfS50cyddLFxuICAgIGV4Y2x1ZGU6IFsnc3JjL2UyZS10ZXN0cy8udG1wLyoqJ10sXG4gICAgc2V0dXBGaWxlczogWycuL3NldHVwLXRlc3QuanMnXSxcbiAgICBkZXBzOiB7XG4gICAgICBpbmxpbmU6IFsnQGV0aGVyc3Byb2plY3Qvc2lnbmluZy1rZXknLCAnQGV0aGVyc3Byb2plY3QvYmFzZXgnLCAnQGRlcGF5L3NvbGFuYS13ZWIzLmpzJywgJ2N1cGVydGluby1wYW5lJ10sXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgdGFyZ2V0OiAnZXMyMDIwJyxcbiAgICB9LFxuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVMsU0FBUyxpQkFBaUI7QUFDM1QsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTSxTQUFTLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsVUFBVSxDQUFDO0FBQUEsRUFDckIsTUFBTTtBQUFBO0FBQUEsSUFFSixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixTQUFTLENBQUMseUJBQXlCO0FBQUEsSUFDbkMsU0FBUyxDQUFDLHVCQUF1QjtBQUFBLElBQ2pDLFlBQVksQ0FBQyxpQkFBaUI7QUFBQSxJQUM5QixNQUFNO0FBQUEsTUFDSixRQUFRLENBQUMsOEJBQThCLHdCQUF3Qix5QkFBeUIsZ0JBQWdCO0FBQUEsSUFDMUc7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osZ0JBQWdCO0FBQUEsTUFDZCxRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFDRixDQUFDO0FBRUQsSUFBTyxzQkFBUTsiLAogICJuYW1lcyI6IFtdCn0K
