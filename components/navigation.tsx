'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Home, ListChecks, Trophy, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Discover', icon: Home },
  { href: '/backlog', label: 'Backlog', icon: ListChecks },
  { href: '/completed', label: 'Completed', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent p-2">
            <Gamepad2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-black tracking-tight text-transparent">
            CONTINUUM
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'gap-2',
                    isActive && 'bg-primary text-primary-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="icon"
                  className={cn(isActive && 'bg-primary text-primary-foreground')}
                >
                  <Icon className="h-5 w-5" />
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
