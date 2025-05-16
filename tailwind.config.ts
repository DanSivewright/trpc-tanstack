/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate"
import colors from "tailwindcss/colors"
import defaultTheme from "tailwindcss/defaultTheme"

export const texts = {
  "title-h1": [
    "3.5rem",
    {
      lineHeight: "4rem",
      letterSpacing: "-0.01em",
      fontWeight: "500",
    },
  ],
  "title-h2": [
    "3rem",
    {
      lineHeight: "3.5rem",
      letterSpacing: "-0.01em",
      fontWeight: "500",
    },
  ],
  "title-h3": [
    "2.5rem",
    {
      lineHeight: "3rem",
      letterSpacing: "-0.01em",
      fontWeight: "500",
    },
  ],
  "title-h4": [
    "2rem",
    {
      lineHeight: "2.5rem",
      letterSpacing: "-0.005em",
      fontWeight: "500",
    },
  ],
  "title-h5": [
    "1.5rem",
    {
      lineHeight: "2rem",
      letterSpacing: "0em",
      fontWeight: "500",
    },
  ],
  "title-h6": [
    "1.25rem",
    {
      lineHeight: "1.75rem",
      letterSpacing: "0em",
      fontWeight: "500",
    },
  ],
  "label-xl": [
    "1.5rem",
    {
      lineHeight: "2rem",
      letterSpacing: "-0.015em",
      fontWeight: "500",
    },
  ],
  "label-lg": [
    "1.125rem",
    {
      lineHeight: "1.5rem",
      letterSpacing: "-0.015em",
      fontWeight: "500",
    },
  ],
  "label-md": [
    "1rem",
    {
      lineHeight: "1.5rem",
      letterSpacing: "-0.011em",
      fontWeight: "500",
    },
  ],
  "label-sm": [
    ".875rem",
    {
      lineHeight: "1.25rem",
      letterSpacing: "-0.006em",
      fontWeight: "500",
    },
  ],
  "label-xs": [
    ".75rem",
    {
      lineHeight: "1rem",
      letterSpacing: "0em",
      fontWeight: "500",
    },
  ],
  "paragraph-xl": [
    "1.5rem",
    {
      lineHeight: "2rem",
      letterSpacing: "-0.015em",
      fontWeight: "400",
    },
  ],
  "paragraph-lg": [
    "1.125rem",
    {
      lineHeight: "1.5rem",
      letterSpacing: "-0.015em",
      fontWeight: "400",
    },
  ],
  "paragraph-md": [
    "1rem",
    {
      lineHeight: "1.5rem",
      letterSpacing: "-0.011em",
      fontWeight: "400",
    },
  ],
  "paragraph-sm": [
    ".875rem",
    {
      lineHeight: "1.25rem",
      letterSpacing: "-0.006em",
      fontWeight: "400",
    },
  ],
  "paragraph-xs": [
    ".75rem",
    {
      lineHeight: "1rem",
      letterSpacing: "0em",
      fontWeight: "400",
    },
  ],
  "subheading-md": [
    "1rem",
    {
      lineHeight: "1.5rem",
      letterSpacing: "0.06em",
      fontWeight: "500",
    },
  ],
  "subheading-sm": [
    ".875rem",
    {
      lineHeight: "1.25rem",
      letterSpacing: "0.06em",
      fontWeight: "500",
    },
  ],
  "subheading-xs": [
    ".75rem",
    {
      lineHeight: "1rem",
      letterSpacing: "0.04em",
      fontWeight: "500",
    },
  ],
  "subheading-2xs": [
    ".6875rem",
    {
      lineHeight: ".75rem",
      letterSpacing: "0.02em",
      fontWeight: "500",
    },
  ],
  "doc-label": [
    "1.125rem",
    {
      lineHeight: "2rem",
      letterSpacing: "-0.015em",
      fontWeight: "500",
    },
  ],
  "doc-paragraph": [
    "1.125rem",
    {
      lineHeight: "2rem",
      letterSpacing: "-0.015em",
      fontWeight: "400",
    },
  ],
}

export const shadows = {
  "regular-xs": "0 1px 2px 0 #0a0d1408",
  "regular-sm": "0 2px 4px #1b1c1d0a",
  "regular-md": "0 16px 32px -12px #0e121b1a",
  "button-primary-focus": [
    "0 0 0 2px theme(colors.bg[white-0])",
    "0 0 0 4px theme(colors.primary[alpha-10])",
  ],
  "button-important-focus": [
    "0 0 0 2px theme(colors.bg[white-0])",
    "0 0 0 4px theme(colors.neutral[alpha-16])",
  ],
  "button-error-focus": [
    "0 0 0 2px theme(colors.bg[white-0])",
    "0 0 0 4px theme(colors.red[alpha-10])",
  ],
  "fancy-buttons-neutral": ["0 1px 2px 0 #1b1c1d7a", "0 0 0 1px #242628"],
  "fancy-buttons-primary": [
    "0 1px 2px 0 #0e121b3d",
    "0 0 0 1px theme(colors.primary[base])",
  ],
  "fancy-buttons-error": [
    "0 1px 2px 0 #0e121b3d",
    "0 0 0 1px theme(colors.error[base])",
  ],
  "fancy-buttons-stroke": [
    "0 1px 3px 0 #0e121b1f",
    "0 0 0 1px theme(colors.stroke[soft-200])",
  ],
  "toggle-switch": ["0 6px 10px 0 #0e121b0f", "0 2px 4px 0 #0e121b08"],
  "switch-thumb": ["0 4px 8px 0 #1b1c1d0f", "0 2px 4px 0 #0e121b14"],
  tooltip: ["0 12px 24px 0 #0e121b0f", "0 1px 2px 0 #0e121b08"],
  "custom-xs": [
    "0 0 0 1px rgba(51, 51, 51, 0.04)",
    "0 4px 8px -2px rgba(51, 51, 51, 0.06)",
    "0 2px 4px rgba(51, 51, 51, 0.04)",
    "0 1px 2px rgba(51, 51, 51, 0.04)",
    "inset 0 -1px 1px -0.5px rgba(51, 51, 51, 0.06)",
  ],
  "custom-sm": [
    "0 0 0 1px rgba(51, 51, 51, 0.04)",
    "0 16px 8px -8px rgba(51, 51, 51, 0.01)",
    "0 12px 6px -6px rgba(51, 51, 51, 0.02)",
    "0 5px 5px -2.5px rgba(51, 51, 51, 0.08)",
    "0 1px 3px -1.5px rgba(51, 51, 51, 0.16)",
    "inset 0 -0.5px 0.5px rgba(51, 51, 51, 0.08)",
  ],
  "custom-md": [
    "0 0 0 1px rgba(51, 51, 51, 0.04)",
    "0 1px 1px 0.5px rgba(51, 51, 51, 0.04)",
    "0 3px 3px -1.5px rgba(51, 51, 51, 0.02)",
    "0 6px 6px -3px rgba(51, 51, 51, 0.04)",
    "0 12px 12px -6px rgba(51, 51, 51, 0.04)",
    "0 24px 24px -12px rgba(51, 51, 51, 0.04)",
    "0 48px 48px -24px rgba(51, 51, 51, 0.04)",
    "inset 0 -1px 1px -0.5px rgba(51, 51, 51, 0.06)",
  ],
  "custom-lg": [
    "0 0 0 1px rgba(51, 51, 51, 0.04)",
    "0 1px 1px 0.5px rgba(51, 51, 51, 0.04)",
    "0 3px 3px -1.5px rgba(51, 51, 51, 0.02)",
    "0 6px 6px -3px rgba(51, 51, 51, 0.04)",
    "0 12px 12px -6px rgba(51, 51, 51, 0.04)",
    "0 24px 24px -12px rgba(51, 51, 51, 0.04)",
    "0 48px 48px -24px rgba(51, 51, 51, 0.04)",
    "0 96px 96px -32px rgba(51, 51, 51, 0.06)",
    "inset 0 -1px 1px -0.5px rgba(51, 51, 51, 0.06)",
  ],
}

export const borderRadii = {
  10: ".625rem",
  20: "1.25rem",
}

const config = {
  darkMode: ["class"],
  safelist: [".dark"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      ...texts,
      inherit: "inherit",
    },
    boxShadow: {
      ...shadows,
      none: defaultTheme.boxShadow.none,
    },
    extend: {
      colors: {
        primary: {
          dark: colors.blue[800],
          darker: colors.blue[700],
          base: colors.blue[500],
          "alpha-24": colors.blue[500] + "3d",
          "alpha-16": colors.blue[500] + "29",
          "alpha-10": colors.blue[500] + "1a",
        },
        static: {
          black: colors.neutral[950],
          white: colors.neutral[50],
        },
        bg: {
          "strong-950": "var(--bg-strong-950)",
          "surface-800": "var(--bg-surface-800)",
          "sub-300": "var(--bg-sub-300)",
          "soft-200": "var(--bg-soft-200)",
          "weak-50": "var(--bg-weak-50)",
          "white-0": "var(--bg-white-0)",
        },
        text: {
          "strong-950": "var(--text-strong-950)",
          "sub-600": "var(--text-sub-600)",
          "soft-400": "var(--text-soft-400)",
          "disabled-300": "var(--text-disabled-300)",
          "white-0": "var(--text-white-0)",
        },
        stroke: {
          "strong-950": "var(--stroke-strong-950)",
          "sub-300": "var(--stroke-sub-300)",
          "soft-200": "var(--stroke-soft-200)",
          "white-0": "var(--stroke-white-0)",
        },
        faded: {
          dark: "var(--faded-dark)",
          base: "var(--faded-base)",
          light: "var(--faded-light)",
          lighter: "var(--faded-lighter)",
        },
        information: {
          dark: "var(--information-dark)",
          base: "var(--information-base)",
          light: "var(--information-light)",
          lighter: "var(--information-lighter)",
        },
        warning: {
          dark: "var(--warning-dark)",
          base: "var(--warning-base)",
          light: "var(--warning-light)",
          lighter: "var(--warning-lighter)",
        },
        error: {
          dark: "var(--error-dark)",
          base: "var(--error-base)",
          light: "var(--error-light)",
          lighter: "var(--error-lighter)",
        },
        success: {
          dark: "var(--success-dark)",
          base: "var(--success-base)",
          light: "var(--success-light)",
          lighter: "var(--success-lighter)",
        },
        away: {
          dark: "var(--away-dark)",
          base: "var(--away-base)",
          light: "var(--away-light)",
          lighter: "var(--away-lighter)",
        },
        feature: {
          dark: "var(--feature-dark)",
          base: "var(--feature-base)",
          light: "var(--feature-light)",
          lighter: "var(--feature-lighter)",
        },
        verified: {
          dark: "var(--verified-dark)",
          base: "var(--verified-base)",
          light: "var(--verified-light)",
          lighter: "var(--verified-lighter)",
        },
        highlighted: {
          dark: "var(--highlighted-dark)",
          base: "var(--highlighted-base)",
          light: "var(--highlighted-light)",
          lighter: "var(--highlighted-lighter)",
        },
        stable: {
          dark: "var(--stable-dark)",
          base: "var(--stable-base)",
          light: "var(--stable-light)",
          lighter: "var(--stable-lighter)",
        },
        social: {
          apple: "var(--social-apple)",
          twitter: "var(--social-twitter)",
          github: "var(--social-github)",
          notion: "var(--social-notion)",
          tidal: "var(--social-tidal)",
          amazon: "var(--social-amazon)",
          zendesk: "var(--social-zendesk)",
        },
        overlay: {
          DEFAULT: "var(--overlay)",
        },
        transparent: "transparent",
        current: "currentColor",
      },

      fontFamily: {
        sans: ["Apple", ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        ...borderRadii,
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          to: { height: "0", opacity: "0" },
        },
      },
      sidebar: {
        DEFAULT: "var(--sidebar-background)",
        foreground: "var(--sidebar-foreground)",
        primary: "var(--sidebar-primary)",
        "primary-foreground": "var(--sidebar-primary-foreground)",
        accent: "var(--sidebar-accent)",
        "accent-foreground": "var(--sidebar-accent-foreground)",
        border: "var(--sidebar-border)",
        ring: "var(--sidebar-ring)",
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    // @ts-ignore
    ({ addComponents, theme }) => {
      const lg = theme("screens.lg", {})
      const xl = theme("screens.xl", {})
      addComponents({
        ".no-scrollbar": {
          scrollbarWidth: "none",
          "-ms-overflow-style": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".gutter": {
          paddingLeft: theme("spacing.6"),
          paddingRight: theme("spacing.6"),
          [`@media (min-width: ${lg})`]: {
            paddingLeft: theme("spacing.12"),
            paddingRight: theme("spacing.12"),
          },
          [`@media (min-width: ${xl})`]: {
            paddingLeft: theme("spacing.24"),
            paddingRight: theme("spacing.24"),
          },
        },
      })
    },
  ],
}

export default config
