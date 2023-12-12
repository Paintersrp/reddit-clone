import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get all subhives
    const subhives = await db.subhive.findMany();

    return new Response(JSON.stringify(subhives));
  } catch (error) {
    // Handle general error
    return new Response("Could not fetch threads", { status: 500 });
  }
}
