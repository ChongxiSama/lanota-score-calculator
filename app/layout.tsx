import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC, Roboto } from "next/font/google";
import "./globals.css";

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4C662B",
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Lanota 分数计算器",
  description: "Lanota 音乐游戏分数计算器与容错查询工具。支持分数预估、R5/B30 判定分析及成绩容错计算。",
  applicationName: "Lanota Calculator",
  authors: [{ name: "Chongxi", url: "https://blog.chongxi.us" }],
  creator: "Chongxi & CEPATO",
  publisher: "CEPATO",
  metadataBase: new URL("https://lanota.chongxi.us"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "https://blog.chongxi.us/images/xi.webp",
    shortcut: "https://blog.chongxi.us/images/xi.webp",
    apple: "https://blog.chongxi.us/images/xi.webp",
  },
  openGraph: {
    title: "Lanota 分数计算器",
    description: "Lanota 音乐游戏分数计算器与容错查询工具。",
    url: "https://lanota.chongxi.us",
    siteName: "Lanota Calculator",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://blog.chongxi.us/images/xi.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lanota 分数计算器",
    description: "Lanota 音乐游戏分数计算器与容错查询工具。",
    creator: "@ChongxiSama",
    images: ["https://blog.chongxi.us/images/xi.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Lanota 分数计算器",
    "alternateName": "Lanota Calculator",
    "url": "https://lanota.chongxi.us",
    "description": "Lanota 音乐游戏分数计算器与容错查询工具",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "publisher": {
      "@type": "Organization",
      "name": "CEPATO",
      "logo": { "@type": "ImageObject", "url": "https://blog.chongxi.us/images/xi.webp" }
    },
    "author": { "@type": "Person", "name": "Chongxi", "url": "https://blog.chongxi.us" }
  };

  return (
    <html lang="zh-CN" className={`${notoSansSC.variable} ${roboto.variable}`}>
      <head>
        <link href="https://fonts.cdnfonts.com/css/google-sans" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-primary-container selection:text-on-primary-container">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
