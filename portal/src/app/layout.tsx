import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { UmamiAnalytics } from "@/components/UmamiAnalytics";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Aceve Onboard",
  description: "Prepare and migrate your data — at your own pace.",
  // No login yet — keep every page out of search indexes (feedback P1-3).
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={manrope.variable}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <UmamiAnalytics />
      </body>
    </html>
  );
}
