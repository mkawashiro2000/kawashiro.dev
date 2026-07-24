import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

// Feed RSS del blog. Cada post existe en es/en/ja; publicamos la versión
// española (o inglesa como respaldo) — un solo item por artículo.
export async function GET(context) {
  const all = await getCollection('blog');

  const bySlug = new Map();
  for (const post of all) {
    const slug = post.id.split('/')[0];
    if (!bySlug.has(slug)) bySlug.set(slug, {});
    bySlug.get(slug)[post.id.split('/')[1]] = post;
  }

  const items = [...bySlug.entries()]
    .map(([slug, langs]) => {
      const post = langs.es || langs.en || Object.values(langs)[0];
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${slug}/`,
        categories: post.data.tags,
      };
    })
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'Mitsunori Kawashiro — Blog',
    description: 'Notes on self-hosting, data engineering and building on a Raspberry Pi.',
    site: context.site,
    items,
    customData: '<language>es</language>',
  });
}
