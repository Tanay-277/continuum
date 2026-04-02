import React from 'react';
import { Monitor, Gamepad2, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PlatformBadgeProps {
  platform: string;
  variant?: 'default' | 'sm';
  className?: string;
}

// Map platform names to icons and colors
const platformConfig: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  // PC platforms
  pc: { icon: Monitor, color: 'text-cyan-400', label: 'PC' },
  windows: { icon: Monitor, color: 'text-cyan-400', label: 'Windows' },
  mac: { icon: Monitor, color: 'text-gray-300', label: 'Mac' },
  linux: { icon: Monitor, color: 'text-orange-400', label: 'Linux' },
  
  // PlayStation
  playstation: { icon: Gamepad2, color: 'text-blue-400', label: 'PS' },
  'playstation-5': { icon: Gamepad2, color: 'text-blue-400', label: 'PS5' },
  'playstation-4': { icon: Gamepad2, color: 'text-blue-500', label: 'PS4' },
  'playstation-3': { icon: Gamepad2, color: 'text-blue-600', label: 'PS3' },
  
  // Xbox
  xbox: { icon: Gamepad2, color: 'text-green-400', label: 'Xbox' },
  'xbox-series-x': { icon: Gamepad2, color: 'text-green-400', label: 'Xbox X|S' },
  'xbox-one': { icon: Gamepad2, color: 'text-green-500', label: 'Xbox One' },
  'xbox-360': { icon: Gamepad2, color: 'text-green-600', label: 'Xbox 360' },
  
  // Nintendo
  nintendo: { icon: Gamepad2, color: 'text-red-400', label: 'Nintendo' },
  'nintendo-switch': { icon: Gamepad2, color: 'text-red-400', label: 'Switch' },
  'nintendo-3ds': { icon: Gamepad2, color: 'text-red-500', label: '3DS' },
  'wii-u': { icon: Gamepad2, color: 'text-red-600', label: 'Wii U' },
};

export function PlatformBadge({ platform, variant = 'default', className }: PlatformBadgeProps) {
  // Normalize platform name
  const normalizedPlatform = platform.toLowerCase().trim();
  
  // Get config or default to generic gamepad
  const config = platformConfig[normalizedPlatform] || {
    icon: Gamepad2,
    color: 'text-gray-400',
    label: platform,
  };
  
  const Icon = config.icon;
  const isSmall = variant === 'sm';
  
  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 bg-background/50 backdrop-blur-sm border-border/50',
        isSmall ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1',
        className
      )}
    >
      <Icon className={cn(config.color, isSmall ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      <span className={cn(isSmall ? 'text-[10px]' : 'text-xs', 'font-medium')}>
        {config.label}
      </span>
    </Badge>
  );
}

interface PlatformListProps {
  platforms: string[];
  maxDisplay?: number;
  variant?: 'default' | 'sm';
  className?: string;
}

export function PlatformList({ platforms, maxDisplay = 4, variant = 'default', className }: PlatformListProps) {
  const displayPlatforms = platforms.slice(0, maxDisplay);
  const remaining = platforms.length - maxDisplay;
  
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {displayPlatforms.map((platform, index) => (
        <PlatformBadge key={`${platform}-${index}`} platform={platform} variant={variant} />
      ))}
      {remaining > 0 && (
        <Badge
          variant="outline"
          className={cn(
            'bg-muted/50 text-muted-foreground border-border/50',
            variant === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
          )}
        >
          +{remaining}
        </Badge>
      )}
    </div>
  );
}
