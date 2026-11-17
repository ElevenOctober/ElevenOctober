import type { Metadata } from 'next'
import Link from 'next/link'
import DocumentHeader from '@/components/document-header'
import { projects } from '@/content/projects'

export const metadata: Metadata = {
  title: 'Solutions',
  description: 'Open engineering projects and open-source contributions with published validation, limitations, and public records.',
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
        <section className="contribution-section" aria-labelledby="contributions-title">
          <span className="section-index">11 OCTOBER / OPEN SOURCE</span>
          <h2 id="contributions-title" className="contribution-heading">Open source contributions</h2>
          <ol className="publication-list contribution-list">
            <li>
              <article className="contribution-card">
                <div className="contribution-heading-group">
                  <span className="publication-meta">11O-007 / ADAFRUIT CIRCUP / MERGED UPSTREAM</span>
                  <h3 className="publication-title">Circup clear-cache and README help</h3>
                </div>
                <p className="publication-summary">Added the boardless <code>circup clear-cache</code> command. It asks for confirmation before removing downloaded bundles and locally saved Circup data. The contribution also updated the README CLI help and added a test to keep that help example synchronized.</p>
                <div className="contribution-facts">
                  <p><span>PROJECT</span> Adafruit Circup</p>
                  <p><span>STATUS</span> Merged into Adafruit’s Circup repository on 16 November 2026</p>
                  <p><span>CI</span> Build CI / test passed</p>
                </div>
                <nav className="contribution-links" aria-label="11O-007 contribution links">
                  <a className="text-action" href="https://github.com/adafruit/circup/pull/292" target="_blank" rel="noreferrer">Merged PR #292 <span aria-hidden="true">↗</span></a>
                  <a className="text-action" href="https://github.com/shaxntanu/11O-007-circupClearCache" target="_blank" rel="noreferrer">Personal record <span aria-hidden="true">↗</span></a>
                  <a className="text-action" href="https://github.com/ElevenOctober/11O-007-circupClearCache" target="_blank" rel="noreferrer">Eleven October record <span aria-hidden="true">↗</span></a>
                  <a className="text-action" href="https://github.com/adafruit/circup/commit/9dbb3c017d88f75ce87072c7c7f3e45bf27f99ba" target="_blank" rel="noreferrer">Merge commit <span aria-hidden="true">↗</span></a>
                  <a className="text-action" href="https://github.com/adafruit/circup/actions/runs/43895838326" target="_blank" rel="noreferrer">CI run <span aria-hidden="true">↗</span></a>
                </nav>
              </article>
            </li>
          </ol>
        </section>
        <Link className="text-action document-back" href="/#solutions">Return to the orbit <span aria-hidden="true">↗</span></Link>
      </section>
      <footer className="document-footer"><span>11 OCTOBER</span><span>REAL PROBLEMS. OPEN ENGINEERING.</span></footer>
    </main>
  )
}
