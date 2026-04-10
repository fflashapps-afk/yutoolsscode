import React from 'react';
import { User } from 'firebase/auth';
import { Button } from './ui/button';
import { LogIn, LogOut, Share2, Code2, Monitor, Smartphone, Bell, MessageSquare, Globe, ShieldCheck } from 'lucide-react';
import { NotificationService } from '../lib/NotificationService';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface NavbarProps {
  user: User | null;
  projectName: string;
  onLogin: () => void;
  onLogout: () => void;
  onShare: () => void;
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
  activeTab: 'editor' | 'community';
  setActiveTab: (tab: 'editor' | 'community') => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  projectName,
  onLogin,
  onLogout,
  onShare,
  viewMode,
  setViewMode,
  activeTab,
  setActiveTab,
  unreadCount
}) => {
  const [notifPermission, setNotifPermission] = React.useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestPermission = async () => {
    const permission = await NotificationService.requestPermission();
    setNotifPermission(permission);
  };

  return (
    <header className="h-14 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('editor')}>
          <div className="relative">
            <div className="w-9 h-9 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <Code2 className="text-white w-5 h-5" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-zinc-950 rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-none bg-clip-text text-transparent bg-linear-to-r from-white to-zinc-400">yutoolss</span>
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest hidden sm:inline">Studio</span>
          </div>
        </div>

        <div className="h-8 w-px bg-zinc-800/50 mx-2 hidden md:block" />

        {/* Desktop Tabs */}
        <div className="hidden sm:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50">
          <Button 
            variant={activeTab === 'editor' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-8 rounded-lg text-xs gap-2"
            onClick={() => setActiveTab('editor')}
          >
            <Code2 className="w-3.5 h-3.5" />
            Muharrir
          </Button>
          <Button 
            variant={activeTab === 'community' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-8 rounded-lg text-xs gap-2 relative"
            onClick={() => setActiveTab('community')}
          >
            <Globe className="w-3.5 h-3.5" />
            Hamjamiyat
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 text-[8px] items-center justify-center text-white font-bold">
                  {unreadCount}
                </span>
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex bg-zinc-900/50 rounded-xl p-1 mr-2 border border-zinc-800/50 hidden sm:flex">
          <Tooltip>
            <TooltipTrigger 
              render={
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 h-8 w-8 cursor-pointer",
                    viewMode === 'desktop' ? "bg-zinc-800 text-white shadow-sm" : "hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"
                  )}
                  onClick={() => setViewMode('desktop')}
                />
              }
            >
              <Monitor className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Kompyuter ko'rinishi</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger 
              render={
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 h-8 w-8 cursor-pointer",
                    viewMode === 'mobile' ? "bg-zinc-800 text-white shadow-sm" : "hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"
                  )}
                  onClick={() => setViewMode('mobile')}
                />
              }
            >
              <Smartphone className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Mobil ko'rinishi</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          {notifPermission !== 'granted' && (
            <Tooltip>
              <TooltipTrigger 
                render={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                    onClick={requestPermission}
                  />
                }
              >
                <Bell className="h-5 w-5" />
              </TooltipTrigger>
              <TooltipContent>Bildirishnomalarni yoqish</TooltipContent>
            </Tooltip>
          )}

          {notifPermission === 'granted' && (
            <div className="h-9 w-9 flex items-center justify-center text-green-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
          )}

          <Button variant="outline" size="sm" onClick={onShare} className="gap-2 border-zinc-800 hover:bg-zinc-900 hidden sm:flex">
            <Share2 className="h-4 w-4" />
            <span>Ulashish</span>
          </Button>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-800 ml-2">
              <Avatar className="w-8 h-8 border border-indigo-500/50 ring-2 ring-indigo-500/10">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8 text-zinc-500 hover:text-red-400">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={onLogin} className="gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Kirish</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
