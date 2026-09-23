import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Droplets, Trash2, ClipboardList, Sprout, Wrench, FileText, X } from 'lucide-react';

export interface NotificationItem {
  id: string;
  category: 'water' | 'waste' | 'complaint' | 'agriculture' | 'infrastructure' | 'system';
  title: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  timestamp: string;
}

const NOTIFICATION_SEED: NotificationItem[] = [
  { id: 'n1', category: 'water', title: 'East Colony Water Tank level is low (31%).', priority: 'high', read: false, timestamp: '2026-09-22T08:15:00' },
  { id: 'n2', category: 'waste', title: 'GB-004 at Market Area is full (91%) and requires immediate collection.', priority: 'high', read: false, timestamp: '2026-09-22T07:42:00' },
  { id: 'n3', category: 'complaint', title: 'Your submitted village complaint has been updated.', priority: 'medium', read: false, timestamp: '2026-09-22T06:30:00' },
  { id: 'n4', category: 'agriculture', title: 'Crop health requires attention in one of the agricultural areas.', priority: 'medium', read: false, timestamp: '2026-09-21T18:10:00' },
  { id: 'n5', category: 'infrastructure', title: 'Scheduled village infrastructure maintenance is due.', priority: 'medium', read: false, timestamp: '2026-09-21T14:00:00' },
  { id: 'n6', category: 'system', title: 'Weekly Smart Village system report is available.', priority: 'low', read: false, timestamp: '2026-09-21T09:00:00' },
];

const STORAGE_KEY = 'sv_notifications';

function loadNotifications(): NotificationItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as NotificationItem[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fall through
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(NOTIFICATION_SEED));
  return NOTIFICATION_SEED;
}

const CATEGORY_ICON: Record<NotificationItem['category'], typeof Bell> = {
  water: Droplets,
  waste: Trash2,
  complaint: ClipboardList,
  agriculture: Sprout,
  infrastructure: Wrench,
  system: FileText,
};

const CATEGORY_COLOR: Record<NotificationItem['category'], string> = {
  water: '#3b82f6',
  waste: '#f97316',
  complaint: '#ef4444',
  agriculture: '#22c55e',
  infrastructure: '#f59e0b',
  system: '#06b6d4',
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function persist(next: NotificationItem[]) {
    setNotifications(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function markRead(id: string) {
    persist(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    persist(notifications.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] cmd-glass overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-slate-300" />
              <span className="text-sm font-bold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-green-400 hover:bg-white/5"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-white/5">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="cmd-scrollbar max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No notifications</div>
            ) : (
              notifications.map((n) => {
                const Icon = CATEGORY_ICON[n.category];
                const color = CATEGORY_COLOR[n.category];
                return (
                  <div
                    key={n.id}
                    className={`flex gap-3 border-b border-white/[0.04] px-4 py-3 transition-colors ${!n.read ? 'bg-white/[0.03]' : ''}`}
                  >
                    <div
                      className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs leading-snug ${!n.read ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="mt-0.5 flex-shrink-0 rounded p-0.5 text-slate-500 hover:bg-white/5 hover:text-green-400"
                            title="Mark as read"
                          >
                            <CheckCheck size={13} />
                          </button>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                            n.priority === 'high'
                              ? 'bg-red-500/15 text-red-400'
                              : n.priority === 'medium'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-slate-500/15 text-slate-400'
                          }`}
                        >
                          {n.priority}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })} ·{' '}
                          {new Date(n.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {unreadCount > 0 && (
            <div className="border-t border-white/[0.06] px-4 py-2">
              <button
                onClick={markAllRead}
                className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-medium text-green-400 hover:text-green-300"
              >
                <CheckCheck size={14} /> Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
