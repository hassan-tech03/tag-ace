/** @type {import('tailwindcss').Config} */
// Scoped to the admin panel only.
// `content` only scans admin files so utility classes outside /admin won't generate,
// and `preflight` is disabled to avoid resetting Bootstrap/SCSS styles on the storefront.
export default {
  content: [
    "./src/app/admin/**/*.{js,jsx,ts,tsx}",
    "./src/components/admin/**/*.{js,jsx,ts,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        admin: {
          bg: "#0f172a",
          surface: "#1e293b",
          accent: "#c9a96e",
        },
      },
    },
  },
  plugins: [],
};
