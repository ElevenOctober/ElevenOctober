import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { ComponentType } from 'react'
import type { ArticleRecord } from '@/types/article'

const directory = join(process.cwd(), 'content', 'articles')

export function getArticleSlugs() {
  if (!existsSync(directory)) return []
  return readdirSync(directory)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.slice(0, -4))
    .filter((slug) => /^[a-z0-9-]+$/.test(slug))
}

export async function getArticle(slug: string) {
  if (!getArticleSlugs().includes(slug)) return null
  const articleModule = await import(`@/content/articles/${slug}.mdx`) as {
    default: ComponentType
    article: ArticleRecord
  }
  return { ...articleModule.article, Content: articleModule.default, slug }
}

export async function getArticles() {
  const articles = await Promise.all(getArticleSlugs().map(getArticle))
  return articles.filter((article): article is NonNullable<typeof article> => article !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}
