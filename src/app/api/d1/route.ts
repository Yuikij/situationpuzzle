import { getD1Tables } from "@/app/lib/db-d1";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tables = await getD1Tables();
    return NextResponse.json({ tables });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
} 