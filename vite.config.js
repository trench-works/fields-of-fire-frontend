import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    // eslint-disable-next-line no-undef
    const env = loadEnv(mode, process.cwd(), "");
    return {
        define: {
            global: "window",
        },
        // Example: use an env var to set the dev server port conditionally.
        server: {
            port: env.APP_PORT ? Number(env.APP_PORT) : 80,
        },
    };
});

