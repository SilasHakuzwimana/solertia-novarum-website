// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Ensure these have proper contrast
        teal: {
          50: "#f0fdfa",
          // ... ensure all shades have proper contrast
        },
      },
      // Add utility for better text readability
      textShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.8)",
        DEFAULT: "0 2px 4px rgba(0,0,0,0.8)",
        lg: "0 4px 8px rgba(0,0,0,0.8)",
      },
    },
  },
};
