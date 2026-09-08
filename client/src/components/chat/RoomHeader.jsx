export default function RoomHeader({ room, isConnected }) {
  return <div className="min-w-0"><div className="flex items-center gap-2"><h1 className="truncate text-sm font-bold leading-5 text-ink md:text-base">{room.name}</h1><span className={`h-2 w-2 shrink-0 rounded-full md:hidden ${isConnected ? 'bg-success' : 'bg-line'}`} aria-hidden="true" /></div><p className="mt-0.5 text-[11px] leading-4 text-muted md:text-xs">{room.members?.length || 0} members<span className="md:hidden"> · {isConnected ? 'Live' : 'Reconnecting'}</span></p></div>;
}
