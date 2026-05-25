const DAYS_HINGLISH = [
  "Itwar",
  "Monday",
  "Mangal",
  "Budh",
  "Jumeraat",
  "Juma",
  "Hafta",
];
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

export default function buildHinglishDate(date) {
  const day = DAYS_HINGLISH[date.getDay()];
  const d = date.getDate();
  const month = MONTHS_HINGLISH[date.getMonth()];
  const year = date.getFullYear();
  return `${day}, ${d} ${month} ${year}`;
}
