import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const dataUrl = process.env.WAY_WIKI_DATA_URL;
  if (!dataUrl) return NextResponse.json({ articles: [] });
  try {
    const response = await fetch(dataUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Source returned ${response.status}`);
    const payload = await response.json();
    const articles = Array.isArray(payload) ? payload : payload.articles;
    return NextResponse.json({ articles: Array.isArray(articles) ? articles : [] });
  } catch {
    return NextResponse.json({ articles: [] }, { status: 200 });
  }
}
