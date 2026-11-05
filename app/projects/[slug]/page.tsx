import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DocumentHeader from '@/components/document-header'
import { projects } from '@/content/projects'

export const dynamicParams = false

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((item) => item.slug === slug)
  return project ? { title: project.title, description: project.problem } : {}
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projects.find((item) => item.slug === slug)
  if (!project) notFound()

  return (
    <main className="document-page">
      <DocumentHeader />
      <article className="document-shell detail-page">
        <span className="section-index">{project.id} / {project.status} / {project.date}</span>
        <h1>{project.title}</h1>
        <p className="document-lead">{project.problem}</p>
        <section className="detail-block"><h2>The problem</h2><p>{project.problem}</p><p>Reported by: {project.requester || 'Attribution withheld by request'}</p><p>Original source: <a href={project.sourceUrl} target="_blank" rel="noreferrer">{project.source} ↗</a></p><p>Problem record: <Link href={'/problems/' + project.problemId}>{project.problemId} ↗</Link></p></section>
        <section className="detail-block"><h2>Why it matters</h2><p>{project.whyItMatters}</p></section>
        <section className="detail-block"><h2>Constraints</h2><ul>{project.constraints.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="detail-block"><h2>Investigation</h2><ul>{project.investigation.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="detail-block"><h2>Engineering</h2><ul>{project.engineering.map((item) => <li key={item}>{item}</li>)}</ul></section>
        {project.prototype.length > 0 && <section className="detail-block"><h2>Prototype</h2><ul>{project.prototype.map((item) => <li key={item}>{item}</li>)}</ul></section>}
        <section className="detail-block"><h2>Testing</h2><ul>{project.testing.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="detail-block"><h2>Failures</h2><ul>{project.failures.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="detail-block"><h2>Result</h2><p>{project.result}</p></section>
        <section className="detail-block"><h2>Limitations</h2><ul>{project.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <p className="article-source"><span>REPOSITORY</span> <a href={project.repository} target="_blank" rel="noreferrer">Open source code ↗</a></p>
        <p className="article-source"><span>OPEN ARTICLE</span> <Link href={project.article}>Read engineering article ↗</Link></p>
        <p className="article-source"><span>CONTRIBUTORS</span> {project.contributors.join(', ')}</p>
        <p className="article-source"><span>LICENSE</span> {project.license}</p>
        <Link className="text-action document-back" href="/projects">Back to solutions <span aria-hidden="true">↗</span></Link>
      </article>
      <footer className="document-footer"><span>11 OCTOBER</span><span>PROJECT RECORD / {project.id}</span></footer>
    </main>
  )
}
