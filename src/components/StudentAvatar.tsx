export type StudentAvatarSize = "sm" | "md" | "lg" | "xl";

export interface StudentAvatarProps {
  name?: string | null;
  subtitle?: string | null;
  size?: StudentAvatarSize;
  className?: string;
}

const PALETTE = [
  "#1e3a8a",
  "#065f46",
  "#7c2d12",
  "#581c87",
  "#9f1239",
  "#134e4a",
  "#312e81",
  "#713f12",
];

function hashText(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getStudentInitials(name?: string | null): string {
  const clean = String(name ?? "").trim().replace(/\s+/g, " ");
  if (!clean) return "?";

  const parts = clean.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function StudentAvatar({
  name,
  subtitle,
  size = "md",
  className = "",
}: StudentAvatarProps) {
  const safeName = String(name ?? "").trim();
  const initials = getStudentInitials(safeName);
  const backgroundColor = PALETTE[hashText(safeName || initials) % PALETTE.length];

  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
        ? "h-12 w-12 text-base"
        : size === "xl"
          ? "h-16 w-16 text-xl"
          : "h-10 w-10 text-sm";

  return (
    <div
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm ring-1 ring-black/5",
        sizeClass,
        className,
      ].join(" ")}
      style={{ backgroundColor }}
      title={subtitle ? `${safeName || "Student"} — ${subtitle}` : safeName || "Student"}
      aria-label={safeName ? `Student avatar for ${safeName}` : "Student avatar"}
    >
      {initials}
    </div>
  );
}

export default StudentAvatar;
