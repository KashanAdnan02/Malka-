export default function Avatar({ name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm"
      style={{ background: `hsl(${hue},55%,48%)` }}
    >
      {initials}
    </div>
  );
}
