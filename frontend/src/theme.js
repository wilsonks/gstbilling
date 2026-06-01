import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    50: "#e3f2fd",
    100: "#bbdefb",
    200: "#90caf9",
    300: "#64b5f6",
    400: "#42a5f5",
    500: "#1e88e5",
    600: "#1976d2",
    700: "#1565c0",
    800: "#0d47a1",
    900: "#082a63",
  },
  success: {
    500: "#38A169",
  },
  warning: {
    500: "#DD6B20",
  },
  error: {
    500: "#E53E3E",
  },
};

const fonts = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const textStyles = {
  h1: {
    fontSize: "28px",
    fontWeight: "700",
  },
  h2: {
    fontSize: "22px",
    fontWeight: "600",
  },
  h3: {
    fontSize: "18px",
    fontWeight: "600",
  },
  body: {
    fontSize: "14px",
  },
  caption: {
    fontSize: "12px",
    color: "gray.500",
  },
};

const components = {
  Button: {
    baseStyle: {
      borderRadius: "md",
      fontWeight: "600",
    },
    variants: {
      solid: {
        bg: "brand.500",
        color: "white",
        _hover: { bg: "brand.600" },
      },
      success: {
        bg: "success.500",
        color: "white",
        _hover: { bg: "#2f855a" },
      },
      warning: {
        bg: "warning.500",
        color: "white",
        _hover: { bg: "#c05621" },
      },
      danger: {
        bg: "error.500",
        color: "white",
        _hover: { bg: "#c53030" },
      },
      outlineLight: {
        color: "white",
        border: "1px solid",
        borderColor: "whiteAlpha.700",
        _hover: {
          bg: "whiteAlpha.200",
        },
      },
    },
  },

  Input: {
    baseStyle: {
      field: {
        borderRadius: "md",
        _focus: {
          borderColor: "brand.500",
          boxShadow: "0 0 0 1px #1e88e5",
        },
      },
    },
  },

  Card: {
    baseStyle: {
      p: 5,
      borderRadius: "lg",
      boxShadow: "md",
      bg: "white",
    },
  },

  Text: {
    baseStyle: {
      fontSize: "14px",
    },
  },
};

const styles = {
  global: {
    body: {
      bg: "gray.50",
      color: "gray.800",
    },

    "@page": {
      size: "A4",
      margin: "12mm",
    },

    "@media print": {
      html: {
        background: "#ffffff !important",
      },

      body: {
        background: "#ffffff !important",
        color: "#000000 !important",
        fontSize: "12px !important",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      },

      ".no-print": {
        display: "none !important",
      },

      ".print-container": {
        width: "100% !important",
        maxWidth: "100% !important",
        margin: "0 !important",
        padding: "0 !important",
      },

      ".chakra-card": {
        boxShadow: "none !important",
        borderColor: "#E2E8F0 !important",
        background: "#ffffff !important",
      },

      ".chakra-button": {
        display: "none !important",
      },

      ".chakra-badge": {
        border: "1px solid #CBD5E0 !important",
      },

      "nav, aside, header, footer": {
        display: "none !important",
      },

      "main": {
        width: "100% !important",
        maxWidth: "100% !important",
        margin: "0 !important",
        padding: "0 !important",
      },

      table: {
        pageBreakInside: "auto",
      },

      thead: {
        display: "table-header-group",
      },

      tr: {
        pageBreakInside: "avoid",
        breakInside: "avoid",
      },

      "h1, h2, h3, h4, h5, h6": {
        pageBreakAfter: "avoid",
      },
    },
  },
};

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  colors,
  fonts,
  textStyles,
  components,
  styles,
  config,
});

export default theme;