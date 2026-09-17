import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        brand: "#2563eb",
        mist: "#f4f7fb"
      }
    }
  },
  plugins: []
};

export default config;
