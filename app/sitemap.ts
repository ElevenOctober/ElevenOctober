import type { MetadataRoute } from 'next'
import { getArticleSlugs } from '@/lib/articles'
import { problems } from '@/content/problems'
import { projects } from '@/content/projects'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (!siteUrl) return []

  return [
    { url: siteUrl, changeFrequency: 'monthly', priority: 1 },
    { url: siteUrl + '/articles', changeFrequency: 'weekly', priority: 0.7 },
    ...getArticleSlugs().map((slug) => ({ url: siteUrl + '/articles/' + slug, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...problems.map((problem) => ({ url: siteUrl + '/problems/' + problem.id, changeFrequency: 'monthly' as const, priority: 0.5 })),
    ...projects.map((project) => ({ url: siteUrl + '/projects/' + project.slug, changeFrequency: 'monthly' as const, priority: 0.5 })),
  ]
}
