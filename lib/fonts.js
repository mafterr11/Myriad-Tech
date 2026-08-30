import { Recursive, Roboto } from "next/font/google";

// Both families are variable fonts. Keeping their declarations together makes
// the locale layout and global 404 use the same axes and CSS variables.
export const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const recursive = Recursive({
  subsets: ["latin"],
  variable: "--font-recursive",
});
