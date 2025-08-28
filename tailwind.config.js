const typography = require("@tailwindcss/typography");
const forms = require("@tailwindcss/forms");
const defaultTheme = require("tailwindcss/defaultTheme");

const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  corePlugins: {
    preflight: true,
  },
  darkMode: "class",
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme("colors.primary.500"),
              "&:hover": {
                color: theme("colors.primary.600"),
              },
            },
            nav: {
              a: {
                color: theme("colors.black"),
              },
            },
          },
        },
      }),
      fontSize: {
        base: "1.000rem",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        headings: ["Space\\ Grotesk", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        input: "0px 0px 0px 0.25rem theme(colors.primary.200/25%)",
        "input-invalid": "0px 0px 0px 0.25rem theme(colors.red.200/50%)",
      },
    },
  },

  plugins: [forms, typography],
};

export default config;
