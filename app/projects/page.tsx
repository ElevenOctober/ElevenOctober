import type { Metadata } from 'next'
import Link from 'next/link'
import DocumentHeader from '@/components/document-header'
import { projects } from '@/content/projects'

export const metadata: Metadata = {
  title: 'Solutions',
  description: 'Open engineering projects with published validation, limitations, repositories, and contributors.',
}

export default function ProjectsIndex() {
  return (
    <main className="document-page">
      <DocumentHeader />
      <section className="document-shell">
        <span className="section-index">11 OCTOBER / SOLUTIONS</span>
        <h1>Builds with<br />a public record.</h1>
        <p className="document-lead">Solutions appear here after testing, with their source problem, failures, limitations, and code.</p>
        {projects.length ? (
          <ol className="publication-list">
            {projects.map((project) => <li key={project.id}><Link href={'/projects/' + project.slug}><span className="publication-meta">{project.id} / {project.status} / {project.date}</span><span className="publication-title">{project.title}</span><span className="publication-summary">Problem: {project.problemId}</span></Link></li>)}
          </ol>
        ) : (
          <div className="document-empty"><span className="status-point" aria-hidden="true" /><p>NO COMPLETED PROJECTS PUBLISHED YET</p><span>Completed project orbits are generated from published records.</span></div>
        )}
        <Link className="text-action document-back" href="/#solutions">Return to the orbit <span aria-hidden="true">↗</span></Link>
      </section>
      <footer className="document-footer"><span>11 OCTOBER</span><span>REAL PROBLEMS. OPEN ENGINEERING.</span></footer>
    </main>
  )
}
