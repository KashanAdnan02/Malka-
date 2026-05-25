import buildHinglishDate from "@/utils/buildHinglishDate";
import buildHinglishTime from "@/utils/buildHinglishTime";
import { useEffect, useState } from "react";
const MONTHS_HINGLISH = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export default function DateTimeHeader({ recordCount }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = buildHinglishDate(now);
  const timeStr = buildHinglishTime(now);

  return (
    <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="pointer-events-none absolute -top-8 -right-8 w-36 h-36 rounded-full bg-amber-100/50" />
      <div className="pointer-events-none absolute bottom-0 right-28 w-16 h-16 rounded-full bg-amber-200/20" />
      <div className="relative flex items-center gap-4">
        <div className="shrink-0 w-14 h-14 rounded-xl bg-amber-500 flex flex-col items-center justify-center shadow-sm shadow-amber-200 select-none">
          <span className="text-[10px] font-bold text-amber-100 uppercase tracking-widest leading-none">
            {MONTHS_HINGLISH[now.getMonth()].slice(0, 3)}
          </span>
          <span className="text-2xl font-black text-white leading-none mt-0.5">
            {now.getDate()}
          </span>
        </div>

        <div>
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-0.5">
            Aaj Ka Din
          </p>
          <p className="text-base font-bold text-slate-800 leading-tight">
            {dateStr}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              {recordCount} record{recordCount !== 1 ? "s" : ""} aaj ke
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-start sm:items-end gap-0.5">
        <p className="text-3xl font-black text-slate-800 tabular-nums leading-none tracking-tight">
          {timeStr}
        </p>
        <p className="text-xs text-slate-400 font-medium">
          Abhi ka waqt &mdash; live
        </p>
      </div>
    </div>
  );
}
