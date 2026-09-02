// Renders one PNG share card per entry in config/og.ts at build time.
import type { APIRoute } from 'astro';
import { ogEntries } from '../../config/og';
import { renderOgCard } from '../../lib/og';

export async function getStaticPaths() {
  const entries = await ogEntries();
  return entries.map(({ slug, ...card }) => ({ params: { slug }, props: { card } }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgCard(props.card);
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
