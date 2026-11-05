export type ProjectRecord = {
  id: string
  slug: string
  title: string
  status: 'SOLVED' | 'PUBLISHED'
  date: string
  problemId: string
  problem: string
  source: string
  sourceUrl: string
  requester?: string
  whyItMatters: string
  constraints: string[]
  investigation: string[]
  engineering: string[]
  prototype: string[]
  testing: string[]
  failures: string[]
  result: string
  limitations: string[]
  repository: string
  article: string
  contributors: string[]
  license: string
}
