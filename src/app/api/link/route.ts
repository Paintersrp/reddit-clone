import axios from "axios";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Retrieve the href used in the link
  const href = url.searchParams.get("url");

  // Handle invalid or missing hrefs
  if (!href) {
    return new Response("Invalid href", { status: 400 });
  }

  // Send a request to the href
  const res = await axios.get(href);

  // Extract Title Metadata with regex
  const titleMatch = res.data.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : "";

  // Extract Title Metadata with regex
  const descMatch = res.data.match(/<meta name="description" content="(.*?)"/);
  const description = descMatch ? descMatch[1] : "";

  // Extract Image Metadata with regex
  const imgMatch = res.data.match(/<meta property="og:image" content="(.*?)"/);
  const imageUrl = imgMatch ? imgMatch[1] : "";

  // Return Metadata
  return new Response(
    JSON.stringify({
      success: 1,
      meta: {
        title,
        description,
        image: { url: imageUrl },
      },
    })
  );
}
