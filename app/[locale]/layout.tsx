import type { Metadata } from "next";
import { Inter, Fraunces, Geist } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const bodyFont = Inter({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const displayFont = Fraunces({
  subsets: ["vietnamese", "latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Viễn Chí Bảo",
  description: "Viễn Chí Bảo",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as string)) {
    notFound();
  }
  
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn("h-full", "antialiased", bodyFont.variable, displayFont.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col font-body">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
