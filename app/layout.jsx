import { SITE_URL } from "@/lib/utils";

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
//
// The base URL lives here so every segment — including the admin pages that
// export their own plain metadata object — resolves social images absolutely.
export const metadata = {
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }) {
  return children;
}
