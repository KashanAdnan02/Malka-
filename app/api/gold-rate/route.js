// app/api/gold-rate/route.js
export async function GET() {
  try {
    const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // cache 5 minutes
    });

    if (!res.ok) throw new Error("Gold API failed");
    const data = await res.json();

    const res2 = await fetch("https://open.er-api.com/v6/latest/USD");
    const data2 = await res2.json();
let PKR = data2.rates.PKR
    return Response.json({
      price_gram_24k: data.price_gram_24k * data2.rates.PKR,
      price_gram_22k: data.price_gram_22k * data2.rates.PKR,
      price_gram_21k: data.price_gram_21k * data2.rates.PKR,
      price_gram_18k: data.price_gram_18k * data2.rates.PKR,
      price_gram_14k: data.price_gram_14k * data2.rates.PKR,
      price_gram_10k: data.price_gram_10k * data2.rates.PKR,
      timestamp: data.timestamp,
    });
  } catch {
    return Response.json({ error: "Rate unavailable" }, { status: 503 });
  }
}
