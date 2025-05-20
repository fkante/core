//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: "all",
  tailwindFunctions: ["clsx", "tw"],
  plugins: ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"],
  overrides: [
    {
      files: "*.tsx",
      options: {
        importOrder: [
          "^react(.*)",
          "<BUILT_IN_MODULES>",
          "",
          "<THIRD_PARTY_MODULES>",
          "^tanstack(.*)",
          "",
          "^[.]",
          "",
          "^components/(.*)$",
        ],
      },
    },
  ],
};

export default config;
