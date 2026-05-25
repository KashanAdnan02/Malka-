export default function Field({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={type == "city" ? "Karachi" : value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300
          focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-300 transition-all hover:border-stone-300"
      />
    </div>
  );
}