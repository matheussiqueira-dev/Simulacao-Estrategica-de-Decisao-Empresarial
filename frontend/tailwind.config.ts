// Shared design system (ms-tokens v1.0, Appendix A.3). ms-tokens.css is imported first in
// src/app/globals.css. Colours, weights, radii and shadows REPLACE Tailwind's defaults, so only
// system values exist. Colours are CSS variables: opacity modifiers (bg-accent/20) do not work;
// use the measured *-subtle tokens instead.
import type { Config } from "tailwindcss";

const v = (name: string) => `var(--ms-${name})`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      canvas: { DEFAULT: v("bg"), subtle: v("bg-subtle") },
      surface: { DEFAULT: v("surface"), raised: v("surface-raised") },
      fg: {
        DEFAULT: v("text"),
        secondary: v("text-secondary"),
        tertiary: v("text-tertiary"),
        disabled: v("text-disabled"),
        "on-accent": v("text-on-accent"),
        "on-solid": v("text-on-solid"),
      },
      line: {
        DEFAULT: v("border"),
        strong: v("border-strong"),
        control: v("border-control"),
        "control-hover": v("border-control-hover"),
      },
      accent: {
        DEFAULT: v("accent"),
        hover: v("accent-hover"),
        pressed: v("accent-pressed"),
        subtle: v("accent-subtle"),
      },
      positive: { DEFAULT: v("positive"), subtle: v("positive-subtle") },
      warning: { DEFAULT: v("warning"), subtle: v("warning-subtle") },
      danger: { DEFAULT: v("danger"), hover: v("danger-hover"), subtle: v("danger-subtle") },
      info: { DEFAULT: v("info"), subtle: v("info-subtle") },
      chart: {
        1: v("chart-1"),
        2: v("chart-2"),
        3: v("chart-3"),
        4: v("chart-4"),
        5: v("chart-5"),
        6: v("chart-6"),
        other: v("chart-other"),
        grid: v("chart-grid"),
        axis: v("chart-axis"),
        crosshair: v("chart-crosshair"),
      },
      seq: {
        1: v("seq-1"),
        2: v("seq-2"),
        3: v("seq-3"),
        4: v("seq-4"),
        5: v("seq-5"),
        6: v("seq-6"),
        7: v("seq-7"),
      },
      div: {
        "neg-3": v("div-neg-3"),
        "neg-2": v("div-neg-2"),
        "neg-1": v("div-neg-1"),
        mid: v("div-mid"),
        "pos-1": v("div-pos-1"),
        "pos-2": v("div-pos-2"),
        "pos-3": v("div-pos-3"),
      },
    },
    fontFamily: {
      sans: v("font-sans"),
      mono: v("font-mono"),
    },
    fontWeight: {
      normal: v("weight-regular"),
      medium: v("weight-medium"),
      semibold: v("weight-semibold"),
      bold: v("weight-bold"),
    },
    borderRadius: {
      none: "0",
      xs: v("radius-xs"),
      DEFAULT: v("radius-control"),
      control: v("radius-control"),
      card: v("radius-card"),
      feature: v("radius-feature"),
      full: v("radius-pill"),
    },
    boxShadow: {
      none: "none",
      sm: v("shadow-sm"),
      md: v("shadow-md"),
      lg: v("shadow-lg"),
    },
    extend: {
      // Defaults that would otherwise fall back to colours outside the system.
      borderColor: { DEFAULT: v("border") },
      ringColor: { DEFAULT: v("focus-color") },
      ringOffsetColor: { DEFAULT: v("bg") },
      fontSize: {
        micro: [v("text-micro"), { lineHeight: v("text-micro--line-height") }],
        fine: [v("text-fine"), { lineHeight: v("text-fine--line-height") }],
        caption: [v("text-caption"), { lineHeight: v("text-caption--line-height") }],
        small: [v("text-small"), { lineHeight: v("text-small--line-height") }],
        body: [v("text-body"), { lineHeight: v("text-body--line-height") }],
        lead: [v("text-lead"), { lineHeight: v("text-lead--line-height") }],
        h4: [v("text-h4"), { lineHeight: v("text-h4--line-height"), letterSpacing: v("tracking-tight"), fontWeight: "600" }],
        h3: [v("text-h3"), { lineHeight: v("text-h3--line-height"), letterSpacing: v("tracking-tight"), fontWeight: "600" }],
        h2: [v("text-h2"), { lineHeight: v("text-h2--line-height"), letterSpacing: v("tracking-heading"), fontWeight: "600" }],
        h1: [v("text-h1"), { lineHeight: v("text-h1--line-height"), letterSpacing: v("tracking-heading"), fontWeight: "700" }],
        kpi: [v("text-kpi"), { lineHeight: v("text-kpi--line-height"), letterSpacing: v("tracking-tight"), fontWeight: "600" }],
        display: [v("text-display"), { lineHeight: v("text-display--line-height"), letterSpacing: v("tracking-display"), fontWeight: "700" }],
      },
      letterSpacing: {
        display: v("tracking-display"),
        heading: v("tracking-heading"),
        tight: v("tracking-tight"),
      },
      maxWidth: {
        layout: v("layout-max"),
        "layout-wide": v("layout-max-wide"),
        measure: v("measure"),
      },
      height: {
        header: v("header-height"),
        control: v("control-height"),
        "control-dense": v("control-height-dense"),
      },
      minHeight: {
        control: v("control-height"),
        "control-dense": v("control-height-dense"),
      },
      padding: {
        gutter: v("layout-padding"),
      },
      transitionTimingFunction: {
        creative: v("ease-creative"),
        exit: v("ease-exit"),
      },
      transitionDuration: {
        micro: v("duration-micro"),
        exit: v("duration-exit"),
        reveal: v("duration-reveal"),
        orchestrate: v("duration-orchestrate"),
        data: v("duration-data"),
      },
      zIndex: {
        sticky: v("z-sticky"),
        header: v("z-header"),
        dropdown: v("z-dropdown"),
        modal: v("z-modal"),
        toast: v("z-toast"),
        tooltip: v("z-tooltip"),
      },
      outlineOffset: {
        focus: v("focus-offset"),
      },
    },
  },
  plugins: [],
};

export default config;
