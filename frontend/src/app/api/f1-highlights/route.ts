import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UCB_qr75-ydFVKSF9Dmo6izg"; // Official F1 channel

export async function GET() {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=6&type=video`;

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data.items);
}
