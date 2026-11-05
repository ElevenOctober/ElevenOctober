import type { Metadata } from 'next'
import Link from 'next/link'
import DocumentHeader from '@/components/document-header'
import { problems } from '@/content/problems'

export const metadata: Metadata = {
  title: 'Problems',
  description: 'Externally sourced engineering problems under investigation by 11 October.',
}

export default function ProblemsIndex() {
  return (
    <main className="document-page">
      <DocumentHeader />
      <section className="document-shell">
        <span className="section-index">11 OCTOBER / PROBLEMS</span>
        <h1>Every problem<br />has an origin.</h1>
        <p className="document-lead">Accepted problems retain their original source, attribution preference, constraints, and status history.</p>
        {problems.length ? (
          <ol className="publication-list">
            {problems.map((problem) => <li key={problem.id}><Link href={'/problems/' + problem.id}><span className="publication-meta">{problem.id} / {problem.status}</span><span className="publication-title">{problem.title}</span><span className="publication-summary">Source: {problem.source}</span></Link></li>)}
          </ol>
        ) : (
          <div className="document-empty"><span className="status-point" aria-hidden="true" /><p>FIRST PROBLEMS / COMING SOON</p><span>No problems are presented as real until their external source is verified.</span></div>
        )}
        <Link className="text-action document-back" href="/#problems">Return to the orbit <span aria-hidden="true">↗</span></Link>
      </section>
      <footer className="document-footer"><span>11 OCTOBER</span><span>REAL PROBLEMS. OPEN ENGINEERING.</span></footer>
    </main>
  )
}
