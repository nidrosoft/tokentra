import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { ToastNotificationProvider } from "@/components/feedback/toast-notifications";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: {
        default: "TokenTRA - AI Cost Management Platform",
        template: "%s | TokenTRA",
    },
    description: "Track, analyze, and optimize your AI API costs across OpenAI, Anthropic, Google, and more. Real-time monitoring, budget alerts, and cost optimization recommendations.",
    keywords: ["AI cost management", "LLM costs", "OpenAI billing", "Anthropic costs", "AI budget tracking", "token usage"],
    authors: [{ name: "TokenTRA" }],
    creator: "TokenTRA",
};

export const viewport: Viewport = {
    themeColor: "#7f56d9",
    colorScheme: "light dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cx(inter.variable, "bg-primary antialiased")}>
                <QueryProvider>
                    <RouteProvider>
                        <Theme>
                            <ToastNotificationProvider>
                                {children}
                            </ToastNotificationProvider>
                        </Theme>
                    </RouteProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
