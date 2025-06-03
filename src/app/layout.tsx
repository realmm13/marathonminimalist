import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { TRPCReactProvider } from "@/trpc/react";

import { ThemeWrapper } from "@/context/ThemeWrapper";
import { MediaQueriesProvider } from "@/context/MediaQueriesContext";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { ErrorBoundary } from "react-error-boundary";
import { RootErrorFallback } from "@/components/RootErrorFallback";
import { KitzeUIProviders } from "@/components/core/KitzeUIProviders";
import { RegisterHotkeys } from "@/components/RegisterHotkeys";
import { hotkeys } from "@/config/hotkeys";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { APP_NAME, APP_DESCRIPTION } from "@/config/config";
import { LevaPanel } from "@/components/dev/LevaPanel";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" }
    ],
    apple: [
      { url: "/apple-touch-icon-57x57.png", sizes: "57x57", type: "image/png" },
      { url: "/apple-touch-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { url: "/apple-touch-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/apple-touch-icon-76x76.png", sizes: "76x76", type: "image/png" },
      { url: "/apple-touch-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-touch-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" }
    ]
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME
  },
  formatDetection: {
    telephone: false
  },
  other: {
    "msapplication-TileColor": "#111827",
    "msapplication-config": "/browserconfig.xml"
  }
};

// you can use this instead of <ThemeColorUpdater/>  if you want it to be set based on the OS system settings

// export const viewport: Viewport = {
//   themeColor: [
//     { media: "(prefers-color-scheme: light)", color: "white" },
//     { media: "(prefers-color-scheme: dark)", color: "black" },
//   ],
// };

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="application-name" content={APP_NAME} />
        <meta name="msapplication-TileColor" content="#111827" />
        <meta name="theme-color" content="#111827" />
        <link rel="mask-icon" href="/favicon-design.svg" color="#000000" />
      </head>
      <body className="vertical min-h-screen">
        <NuqsAdapter>
          <TRPCReactProvider>
            <ThemeWrapper>
              <MediaQueriesProvider>
                <KitzeUIProviders>
                  <ErrorBoundary FallbackComponent={RootErrorFallback}>
                    <Suspense fallback={<FullPageSpinner />}>
                      {children}
                    </Suspense>
                  </ErrorBoundary>
                  <RegisterHotkeys hotkeys={hotkeys} />
                  <Toaster />
                </KitzeUIProviders>
              </MediaQueriesProvider>
            </ThemeWrapper>
          </TRPCReactProvider>
        </NuqsAdapter>
        <LevaPanel />
      </body>
    </html>
  );
}
