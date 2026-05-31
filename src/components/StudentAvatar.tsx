const COLORS = ["bg-blue-500","bg-emerald-500","bg-violet-500","bg-amber-500","bg-rose-500","bg-cyan-500","bg-indigo-500","bg-teal-500"];
function colorForName(name: string) { let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length]; }
function initials(name: string) { const p = name.trim().split(/\s+/); return p.length >= 2 ? (p[0][0]+p[p.length-1][0]).toUpperCase() : name.slice(0,2).toUpperCase(); }
export function StudentAvatar({ name, size = "md" }: { name: string; size?: "sm"|"md"|"lg" }) {
  const sz = size==="sm" ? "h-8 w-8 text-xs" : size==="lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-sm";
  return <div className={`${sz} ${colorForName(name)} flex shrink-0 items-center justify-center rounded-full font-black text-white shadow-sm`}>{initials(name)}</div>;
}
