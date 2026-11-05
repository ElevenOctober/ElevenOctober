export type ArticleRecord = {
  title: string
  summary: string
  category: string
  publishedAt: string
  revisedAt?: string
  readingMinutes: number
  authors: { name: string; profile?: string }[]
  contributors: { name: string; profile?: string }[]
  problemId?: string
  projectId?: string
  repository?: string
  sources: { title: string; url: string }[]
  revisions: { date: string; note: string }[]
}
