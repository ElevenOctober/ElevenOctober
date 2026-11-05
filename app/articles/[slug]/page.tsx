import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DocumentHeader from '@/components/document-header'
import { getArticle, getArticleSlugs } from '@/lib/articles'

export const dynamicParams = false

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  return article ? { title: article.title, description: article.summary, openGraph: { type: 'article', title: article.title, description: article.summary, publishedTime: article.publishedAt, modifiedTime: article.revisedAt } } : {}
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    dateModified: article.revisedAt || article.publishedAt,
    author: article.authors.map((author) => ({ '@type': 'Person', name: author.name, url: author.profile })),
    isPartOf: { '@type': 'Periodical', name: '11 October Open Engineering Articles' },
    identifier: article.problemId || article.projectId,
  }).replace(/</g, '\\u003c')

  return (
    <main className="document-page article-page">
      <DocumentHeader />
      <article className="document-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        <span className="section-index">{article.category} / {article.publishedAt}</span>
        <h1>{article.title}</h1>
        <p className="document-lead">{article.summary}</p>
        <div className="article-meta">
          <div><span>AUTHORS</span><p>{article.authors.map((author) => author.name).join(', ')}</p></div>
          <div><span>CONTRIBUTORS</span><p>{article.contributors.map((person) => person.name).join(', ') || 'Not listed'}</p></div>
          <div><span>READING TIME</span><p>{article.readingMinutes} minutes</p></div>
          {article.problemId && <div><span>PROBLEM</span><p>{article.problemId}</p></div>}
          {article.projectId && <div><span>PROJECT</span><p>{article.projectId}</p></div>}
        </div>
        <div className="article-content"><article.Content /></div>
        {article.repository && <p className="article-source"><span>REPOSITORY</span> <a href={article.repository} target="_blank" rel="noreferrer">Open project repository ↗</a></p>}
        {article.sources.length > 0 && <section className="article-references"><h2>References</h2><ol>{article.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ol></section>}
        {article.revisions.length > 0 && <section className="article-references"><h2>Revision history</h2><ol>{article.revisions.map((revision) => <li key={revision.date}><time dateTime={revision.date}>{revision.date}</time> — {revision.note}</li>)}</ol></section>}
        <Link className="text-action document-back" href="/articles">Back to articles <span aria-hidden="true">↗</span></Link>
      </article>
      <footer className="document-footer"><span>11 OCTOBER</span><span>OPEN ENGINEERING ARTICLES</span></footer>
    </main>
  )
}
