"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Gamepad2, Home, LayoutGrid, ListChecks, LogIn, LogOut, Trophy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/", label: "Discover", icon: Home },
	{ href: "/categories", label: "Categories", icon: LayoutGrid },
	{ href: "/backlog", label: "Backlog", icon: ListChecks },
	{ href: "/completed", label: "Completed", icon: Trophy },
	{ href: "/profile", label: "Profile", icon: User },
];

export function Navigation() {
	const pathname = usePathname();
	const { status: sessionStatus } = useSession();
	const isAuthenticated = sessionStatus === "authenticated";
	const signInHref = `/auth/signin?callbackUrl=${encodeURIComponent(pathname || "/")}`;

	const isActiveRoute = (href: string) => {
		if (href === "/") {
			return pathname === "/" || pathname.startsWith("/games/");
		}
		if (href === "/categories") {
			return pathname === "/categories" || pathname.startsWith("/categories/");
		}
		return pathname === href;
	};

	const handleSignOut = () => {
		void signOut({ callbackUrl: "/" });
	};

	return (
		<nav className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
			<div className="apple-surface apple-card-shadow mx-auto flex h-16 max-w-340 items-center rounded-2xl px-3 sm:px-4">
				<Link
					href="/"
					className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
				>
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-b from-white/35 to-white/10 text-primary shadow-[inset_0_1px_0_oklch(0.96_0_0/0.4)]">
						<Gamepad2 className="h-5 w-5" />
					</div>
					<div className="leading-tight">
						<span className="apple-caption block text-[0.56rem]">
							Continuum
						</span>
					</div>
				</Link>

				<div className="mx-2 hidden min-w-0 flex-1 items-center justify-center md:flex">
					<div className="flex items-center gap-1 rounded-full bg-black/20 p-1.5">
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = isActiveRoute(item.href);

							return (
								<Link key={item.href} href={item.href}>
									<Button
										variant="ghost"
										size="sm"
										className={cn(
											"h-9 gap-2 rounded-full px-4 text-xs font-medium tracking-wide text-foreground/70 transition-all",
											isActive &&
												"bg-white/14 text-foreground shadow-[inset_0_1px_0_oklch(0.98_0_0/0.35)]",
										)}
									>
										<Icon className="h-3.5 w-3.5" />
										{item.label}
									</Button>
								</Link>
							);
						})}
					</div>
				</div>

				<Link
					href="/backlog"
					className="ml-auto hidden h-9 items-center rounded-full border border-white/15 bg-white/10 px-4 text-xs font-medium tracking-wide text-foreground/90 transition-colors hover:bg-white/15 lg:inline-flex"
				>
					Library
				</Link>

				{isAuthenticated ? (
					<Button
						onClick={handleSignOut}
						variant="outline"
						size="sm"
						className="ml-2 hidden rounded-full border-white/20 bg-white/8 px-4 text-xs lg:inline-flex"
					>
						<LogOut className="h-3.5 w-3.5" />
						Sign Out
					</Button>
				) : (
					<Link
						href={signInHref}
						className="ml-2 hidden h-9 items-center gap-1 rounded-full border border-white/15 bg-white/10 px-4 text-xs font-medium tracking-wide text-foreground/90 transition-colors hover:bg-white/15 lg:inline-flex"
					>
						<LogIn className="h-3.5 w-3.5" />
						Sign In
					</Link>
				)}

				<div className="ml-auto flex items-center gap-1 md:hidden">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = isActiveRoute(item.href);

						return (
							<Link key={item.href} href={item.href}>
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"h-9 w-9 rounded-full text-foreground/70",
										isActive && "bg-white/14 text-foreground",
									)}
								>
									<Icon className="h-4 w-4" />
									<span className="sr-only">{item.label}</span>
								</Button>
							</Link>
						);
					})}
				</div>
			</div>
		</nav>
	);
}
