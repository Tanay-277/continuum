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

const NAV_SHELL_CLASS = "mx-auto w-full max-w-340 px-4 sm:px-6 lg:px-8";

export function Navigation() {
	const pathname = usePathname();
	const { status: sessionStatus } = useSession();
	const isAuthenticated = sessionStatus === "authenticated";
	const signInHref = `/auth/signin?callbackUrl=${encodeURIComponent(pathname || "/")}`;

	const isActiveRoute = (href: string) => {
		if (!pathname) {
			return false;
		}

		if (href === "/") {
			return pathname === "/" || pathname.startsWith("/games/");
		}

		return pathname === href || pathname.startsWith(`${href}/`);
	};

	const handleSignOut = () => {
		void signOut({ callbackUrl: "/" });
	};

	const getDesktopItemClasses = (isActive: boolean) =>
		cn(
			"h-8 rounded-full border border-transparent px-3.5 text-xs font-medium tracking-wide text-foreground/68 transition-colors",
			isActive
				? "border-white/20 bg-white/16 text-foreground"
				: "hover:border-white/10 hover:bg-white/8 hover:text-foreground"
		);

	const getMobileItemClasses = (isActive: boolean) =>
		cn(
			"flex h-10 min-w-[4.75rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent px-2 text-[11px] leading-none text-foreground/72 transition-colors",
			isActive
				? "border-white/20 bg-white/16 text-foreground"
				: "hover:border-white/10 hover:bg-white/8 hover:text-foreground"
		);

	return (
		<nav className="sticky top-0 z-50 pt-4">
			<div className={NAV_SHELL_CLASS}>
				<div className="apple-surface w-full rounded-2xl border border-white/10">
					<div className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-2 px-3 sm:px-4">
						<Link
							href="/"
							className="flex items-center gap-2 transition-opacity hover:opacity-90"
						>
							<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/16 bg-white/8 text-primary">
								<Gamepad2 className="h-4.5 w-4.5" />
							</div>
							<span className="apple-caption text-[0.62rem] text-foreground/80">Continuum</span>
						</Link>

						<div className="hidden min-w-0 items-center justify-center md:flex" aria-label="Primary">
							<div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/14 p-1">
								{navItems.map((item) => {
									const isActive = isActiveRoute(item.href);
									return (
										<Link key={item.href} href={item.href}>
											<Button
												variant="ghost"
												size="sm"
												className={getDesktopItemClasses(isActive)}
												aria-current={isActive ? "page" : undefined}
											>
												{item.label}
											</Button>
										</Link>
									);
								})}
							</div>
						</div>

						{isAuthenticated ? (
							<Button
								onClick={handleSignOut}
								variant="outline"
								size="sm"
								className="hidden h-8 rounded-full border-white/20 bg-white/6 px-3 text-[11px] tracking-wide md:inline-flex"
							>
								<LogOut className="h-3.5 w-3.5" />
								Sign Out
							</Button>
						) : (
							<Link
								href={signInHref}
								className="hidden h-8 items-center gap-1 rounded-full border border-white/20 bg-white/8 px-3 text-[11px] font-medium tracking-wide text-foreground/90 transition-colors hover:bg-white/14 md:inline-flex"
							>
								<LogIn className="h-3.5 w-3.5" />
								Sign In
							</Link>
						)}

						{isAuthenticated ? (
							<Button
								onClick={handleSignOut}
								variant="outline"
								size="sm"
								className="h-8 w-8 rounded-full border-white/20 bg-white/6 p-0 md:hidden"
							>
								<LogOut className="h-3.5 w-3.5" />
								<span className="sr-only">Sign Out</span>
							</Button>
						) : (
							<Link
								href={signInHref}
								className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/8 text-foreground/90 transition-colors hover:bg-white/14 md:hidden"
							>
								<LogIn className="h-3.5 w-3.5" />
								<span className="sr-only">Sign In</span>
							</Link>
						)}
					</div>

					<div className="border-t border-white/10 px-2 pb-2 pt-2 md:hidden">
						<div className="thin-scrollbar flex gap-1 overflow-x-auto pb-0.5" aria-label="Primary">
							{navItems.map((item) => {
								const Icon = item.icon;
								const isActive = isActiveRoute(item.href);

								return (
									<Link key={item.href} href={item.href}>
										<Button
											variant="ghost"
											size="sm"
											className={getMobileItemClasses(isActive)}
											aria-current={isActive ? "page" : undefined}
										>
											<Icon className="h-3.5 w-3.5" />
											{item.label}
										</Button>
									</Link>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
