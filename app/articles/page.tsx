import type { Metadata } from 'next'
import Link from 'next/link'
import DocumentHeader from '@/components/document-header'
import { getArticles } from '@/lib/articles'

export const metadata: Metadata = {
  title: 'Open engineering articles',
  description: 'Technical records of what 11 October investigated, built, tested, and learned.',
}

export default async function ArticlesIndex() {
  const articles = await getArticles()
  return (
    <main className="document-page">
      <DocumentHeader />
      <section className="document-shell">
        <span className="section-index">11 OCTOBER / OPEN ARTICLES</span>
        <h1>Engineering should<br />leave a trace.</h1>
        <p className="document-lead">Open technical records of what we investigated, built, tested, and got wrong.</p>
        {articles.length ? (
          <ol className="publication-list">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link href={'/articles/' + article.slug}>
                  <span className="publication-meta">{article.category} / {article.publishedAt} / {article.readingMinutes} MIN</span>
                  <span className="publication-title">{article.title}</span>
                  <span className="publication-summary">{article.summary}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className="document-empty"><span className="status-point" aria-hidden="true" /><p>NO ARTICLES PUBLISHED YET</p><span>The first article will follow a verified problem and tested project.</span></div>
        )}
        <Link className="text-action document-back" href="/#articles">Return to the orbit <span aria-hidden="true">↗</span></Link>
      </section>
      <footer className="document-footer"><span>11 OCTOBER</span><span>REAL PROBLEMS. OPEN ENGINEERING.</span></footer>
    </main>
  )
}
