'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { MessageSquare, Users, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/lib/stores/chatStore';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const chats = useChatStore((s) => s.chats);
  const addChat = useChatStore((s) => s.addChat);

  const handleNewChat = () => {
    const chat = addChat({ name: 'New Chat', participantIds: [] });
    router.push(`/chats/${chat.id}`);
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <MessageSquare className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sidebar-foreground">roleplai</span>
      </div>

      {/* New Chat */}
      <div className="px-3 py-2">
        <Button onClick={handleNewChat} className="w-full gap-2" size="sm">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat list */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-0.5 py-1">
          {chats.length === 0 && (
            <p className="px-2 py-4 text-xs text-muted-foreground text-center">
              No chats yet
            </p>
          )}
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chats/${chat.id}`}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                pathname === `/chats/${chat.id}`
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-sidebar-foreground'
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span className="truncate">{chat.name}</span>
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* Nav links */}
      <div className="border-t border-border px-3 py-2 space-y-0.5">
        {[
          { href: '/participants', label: 'Participants', icon: Users },
          { href: '/settings', label: 'Settings', icon: Settings },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              pathname === href
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-sidebar-foreground'
            )}
          >
            <Icon className="h-4 w-4 opacity-70" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
