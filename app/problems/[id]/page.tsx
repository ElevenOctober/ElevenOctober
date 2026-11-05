import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DocumentHeader from '@/components/document-header'
import { problems } from '@/content/problems'

export const dynamicParams = false

export function generateStaticParams() {
  return problems.map((problem) => ({ id: problem.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const problem = problems.find((item) => item.id === id)
  return problem ? { title: problem.title, description: problem.statement } : {}
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const problem = problems.find((item) => item.id === id)
  if (!problem) notFound()

  return (
    <main className="document-page">
      <DocumentHeader />
      <article className="document-shell detail-page">
        <span className="section-index">{problem.id} / {problem.status}</span>
        <h1>{problem.title}</h1>
        <p className="document-lead">{problem.statement}</p>
        <section className="detail-block"><h2>The problem</h2><p>{problem.statement}</p><p>Reported by: {problem.requester || 'Attribution withheld by request'}</p><p>Source: <a href={problem.sourceUrl} target="_blank" rel="noreferrer">{problem.source} ↗</a></p></section>
        <section className="detail-block"><h2>Constraints</h2><ul>{problem.constraints.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="detail-block"><h2>Success criteria</h2><ul>{problem.successCriteria.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="detail-block"><h2>Investigation</h2><ul>{problem.researchNotes.map((item) => <li key={item}>{item}</li>)}</ul></section>
        {problem.validation.length > 0 && <section className="detail-block"><h2>Validation and results</h2><ul>{problem.validation.map((item) => <li key={item}>{item}</li>)}</ul>{problem.results && <p>{problem.results}</p>}</section>}
        <section className="detail-block"><h2>Limitations</h2><ul>{problem.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
        {problem.repository && <p className="article-source"><span>REPOSITORY</span> <a href={problem.repository} target="_blank" rel="noreferrer">Open repository ↗</a></p>}
        {problem.article && <p className="article-source"><span>OPEN ARTICLE</span> <Link href={problem.article}>Read article ↗</Link></p>}
        <Link className="text-action document-back" href="/problems">Back to problems <span aria-hidden="true">↗</span></Link>
      </article>
      <footer className="document-footer"><span>11 OCTOBER</span><span>PROBLEM RECORD / {problem.id}</span></footer>
    </main>
  )
}
