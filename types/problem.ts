export type ProblemStatus =
  | 'RECEIVED'
  | 'VERIFYING'
  | 'ACCEPTED'
  | 'INVESTIGATING'
  | 'BUILDING'
  | 'TESTING'
  | 'SOLVED'
  | 'PUBLISHED'
  | 'ARCHIVED'

export type ProblemRecord = {
  id: string
  slug: string
  title: string
  source: string
  sourceUrl: string
  requester?: string
  category: string
  difficulty: string
  status: ProblemStatus
  acceptedAt?: string
  contributors: string[]
  statement: string
  constraints: string[]
  successCriteria: string[]
  researchNotes: string[]
  prototype?: string[]
  validation: string[]
  results?: string
  limitations: string[]
  repository?: string
  article?: string
  licensing?: string
  attributionPermission: 'yes' | 'no' | 'anonymous'
}
