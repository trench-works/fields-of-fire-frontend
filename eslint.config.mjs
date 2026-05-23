// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import unusedImports from "eslint-plugin-unused-imports";

import eslint from "@eslint/js";

export default defineConfig(
    eslint.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: {
            js,
            "unused-imports": unusedImports,
        },
        extends: ["js/recommended"],
        rules: {
            "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
        },
    },
    tseslint.configs.recommended
);
