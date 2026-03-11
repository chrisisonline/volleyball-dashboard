import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
export default [
  // ─── Global ignores ───────────────────────────────────────────────────────
  {
    ignores: ["dist/", ".astro/", "node_modules/"],
  },

  // ─── TypeScript files (.ts, .tsx) ─────────────────────────────────────────
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11y,
      prettier: prettierPlugin,
    },
    rules: {
      // TypeScript
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],

      // React
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // TypeScript handles this
      "react/self-closing-comp": "warn",

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Accessibility
      ...jsxA11y.configs.recommended.rules,

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",

      // Prettier — report formatting violations as ESLint errors
      "prettier/prettier": "error",
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // ─── Astro files (.astro) ─────────────────────────────────────────────────
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.astro"],
    plugins: { prettier: prettierPlugin },
    rules: {
      // Astro-specific tweaks
      "astro/no-set-html-directive": "warn",
      "astro/no-unused-define-vars-in-style": "warn",
      "prettier/prettier": "error",
    },
  },

  // ─── Prettier config — disables conflicting ESLint formatting rules ────────
  prettierConfig,
];
