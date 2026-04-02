import type { Metadata } from "next";
import localFont from "next/font/local";
import { Host_Grotesk } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Navigation } from "@/components/navigation";

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = localFont({
	src: "./fonts/GeistMono.woff2",
	variable: "--font-geist-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Continuum - Your Game Library",
	description: "Discover games with a cinematic browsing experience inspired by modern streaming apps.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${hostGrotesk.variable} ${geistMono.variable}`}
			suppressHydrationWarning
		>
			<body className="antialiased">
				<AuthProvider>
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
				</AuthProvider>
			</body>
		</html>
	);
}
