const InputField = ({
  label,
  name,
  placeholder,
  type = "text",
  icon,
  value,
  onChange,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
      {label}
    </label>

    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
          {icon}
        </span>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300
        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all
        hover:border-slate-300 ${icon ? "pl-9" : ""}`}
      />
    </div>
  </div>
);

export default InputField