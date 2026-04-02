import type { Metadata } from "next";
import localFont from "next/font/local";
import {Host_Grotesk} from "next/font/google"

import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider";
import { Navigation } from "@/components/navigation";

const nohemi = localFont({
  src: "./fonts/InterVariable.woff2",
	variable: "--font-sans",
	display: "swap",
});

const geistMono = localFont({
	src: "./fonts/GeistMono.woff2",
	variable: "--font-geist-mono",
	display: "swap",
  style:""
});

export const metadata: Metadata = {
	title: "Continuum - Track Your Gaming Journey",
	description: "Discover games, track your backlog, and manage your gaming library",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={nohemi.variable} suppressHydrationWarning>
			<body className={`${nohemi.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<QueryProvider>
						<SmoothScrollProvider>
							<Navigation />
							<main>{children}</main>
						</SmoothScrollProvider>
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
