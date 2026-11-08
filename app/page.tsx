import Link from 'next/link'
import ContourField from '@/components/contour-field'
import OrbitWorld from '@/components/orbit-world'
import RevealManager from '@/components/reveal-manager'
import SiteHeader from '@/components/site-header'
import { problems } from '@/content/problems'
import { projects } from '@/content/projects'

const github = 'https://github.com/ElevenOctober'
const issues = github + '/ElevenOctober/issues'
const joinForm = 'https://forms.gle/5FNnJKq7VhV3XC6h8'

const disciplines = [
  'Electronics', 'Embedded systems', 'Firmware', 'Software', 'PCB design',
  'Mechanical design', 'Technical writing', 'Research', 'Testing', 'Students', 'Curious builders',
]

const engineeringFields = [
  ['EL', 'Electronics'], ['ES', 'Embedded systems'], ['FW', 'Firmware'],
  ['SW', 'Software'], ['PCB', 'PCB design'], ['ME', 'Mechanical design'],
  ['R&D', 'Research'], ['QA', 'Testing'],
] as const

export default function Home() {
  return (
    <main id="main-content">
      <OrbitWorld projectSlugs={projects.map((project) => project.slug)} />
      <RevealManager />
      <SiteHeader />

      <section id="home" className="story-section hero" data-scene-index="0">
        <div className="hero-copy">
          <div className="hero-identity">
            <ContourField />
            <h1 className="hero-wordmark"><span className="hero-wordmark__initial">E</span>LEVEN <span className="hero-wordmark__initial">O</span>CTOBER</h1>
          </div>
        </div>
        <a className="scroll-cue" href="#orbit"><span aria-hidden="true" />SCROLL TO EXPLORE</a>
      </section>

      <section id="orbit" className="story-section orbit-section" data-scene-index="1" aria-labelledby="orbit-title">
        <h2 id="orbit-title" className="visually-hidden">The orbit</h2>
        <a className="scroll-cue" href="#about"><span aria-hidden="true" />CONTINUE</a>
        <span className="hero-mark" aria-hidden="true">THE ORBIT</span>
      </section>

      <section id="about" className="story-section about-section" data-scene-index="2">
        <div className="section-shell about-layout">
          <div className="about-statement" data-reveal>
            <h2>Engineering begins by listening.</h2>
          </div>
          <div className="about-copy" data-reveal>
            <p>We don’t invent community problems. We begin with a need already raised by people, communities, maintainers, and organizations.</p>
            <p>We investigate them, build practical solutions, test them, and share what we learn.</p>
          </div>
        </div>
        <div className="orbit-caption" aria-hidden="true"><span className="caption-point" />A PROBLEM ENTERS THE SYSTEM</div>
      </section>

      <section id="problems" className="story-section problems-section" data-scene-index="3">
        <div className="section-shell">
          <div className="chapter-heading" data-reveal>
            <span className="section-index">01 / PROBLEMS</span>
            <h2>Every problem<br />has an origin.</h2>
          </div>
          <div className="problems-layout">
            <div className="section-copy" data-reveal>
              <p>We don’t turn internal ideas into community requests. Each accepted problem keeps a link to the person, group, or public source it came from.</p>
              <p>Requesters are named only with permission. A submission is reviewed before it is accepted.</p>
            </div>
            <div className="source-list" data-reveal>
              <h3>Sources can include</h3>
              <ul>
                <li>Individuals and communities</li>
                <li>Open-source maintainers</li>
                <li>NGOs and organizations</li>
                <li>Labs and universities</li>
                <li>Public challenge platforms</li>
              </ul>
            </div>
          </div>
          <div className="empty-state" data-reveal>
            <span className="status-point" aria-hidden="true" />
            <p>{problems.length === 0 ? 'FIRST PROBLEMS / COMING SOON' : problems.length + ' PROBLEMS PUBLISHED'}</p>
            <span>Only verified, externally sourced problems appear here.</span>
          </div>
        </div>
      </section>

      <section id="engineering" className="story-section engineering-section" data-scene-index="4">
        <div className="section-shell engineering-layout">
          <div className="chapter-heading" data-reveal>
            <span className="section-index">02 / METHOD</span>
            <h2>Understand<br />before building.</h2>
            <p className="section-intro">The work follows the evidence. The record includes the parts that did not work.</p>
          </div>
          <ol className="method-list">
            <li data-reveal><span>01</span><div><h3>Verify the problem</h3><p>Confirm the source, context, and people affected.</p></div></li>
            <li data-reveal><span>02</span><div><h3>Understand the system</h3><p>Study existing tools, constraints, and assumptions.</p></div></li>
            <li data-reveal><span>03</span><div><h3>Build the smallest useful solution</h3><p>Keep the first prototype focused on the need.</p></div></li>
            <li data-reveal><span>04</span><div><h3>Test it</h3><p>Measure results against stated success criteria.</p></div></li>
            <li data-reveal><span>05</span><div><h3>Document what failed</h3><p>Keep failed approaches and remaining limits visible.</p></div></li>
            <li data-reveal><span>06</span><div><h3>Open everything</h3><p>Publish the build, results, sources, and license.</p></div></li>
          </ol>
        </div>
      </section>

      <section id="solutions" className="story-section solutions-section" data-scene-index="5">
        <div className="section-shell solutions-layout">
          <div className="chapter-heading" data-reveal>
            <span className="section-index">03 / SOLUTIONS</span>
            <h2>Results are<br />earned in testing.</h2>
          </div>
          <div className="solutions-copy" data-reveal>
            <p>A project becomes part of the public record after its prototype, validation, limitations, repository, and contributors are documented.</p>
            <p>{projects.length === 0 ? 'No completed projects have been published yet.' : projects.length + ' projects are in the public record.'} New orbits will be drawn from published project data, not placeholders.</p>
            <Link className="text-action" href="/projects">Explore solutions <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="solution-status" aria-label="Project publication status">
            <span>RECEIVED</span><i aria-hidden="true" />
            <span>INVESTIGATING</span><i aria-hidden="true" />
            <span>TESTING</span><i aria-hidden="true" />
            <span>PUBLISHED</span>
          </div>
        </div>
      </section>

      <section id="articles" className="story-section articles-section" data-scene-index="6">
        <div className="section-shell articles-layout">
          <div className="chapter-heading" data-reveal>
            <span className="section-index">04 / OPEN ARTICLES</span>
            <h2>Work leaves a trace.</h2>
          </div>
          <div className="articles-copy" data-reveal>
            <p>Every published project becomes an open engineering article: what we learned, built, tested, and got wrong.</p>
            <p>Articles link back to their source problem, project repository, contributors, references, and revision history.</p>
            <Link className="text-action" href="/articles">Open the index <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="article-empty" data-reveal>
            <span className="article-empty__line" aria-hidden="true" />
            <span>{projects.length === 0 ? 'NO ARTICLES PUBLISHED YET' : 'READ THE OPEN ENGINEERING INDEX'}</span>
          </div>
        </div>
      </section>

      <section id="submit" className="story-section submit-section" data-scene-index="7">
        <div className="section-shell submit-layout">
          <div className="submit-intro" data-reveal>
            <span className="section-index">05 / GITHUB ISSUES</span>
            <h2>Have a problem<br />worth solving?</h2>
            <p>Open a GitHub issue with what is happening, who it affects, and what has already been tried.</p>
            <p>Issues are public. Opening one starts a review; it does not mean the problem has been accepted.</p>
            <a className="text-action" href={issues + '/new'} target="_blank" rel="noreferrer">Open a GitHub issue <span aria-hidden="true">↗</span></a>
          </div>
          <ul className="issue-guide" data-reveal aria-label="Helpful details for a problem issue">
            <li>What is happening?</li>
            <li>Who experiences it?</li>
            <li>What has already been tried?</li>
            <li>What would a useful outcome look like?</li>
            <li>Links or evidence that help explain it</li>
          </ul>
        </div>
      </section>

      <section id="join" className="story-section join-section" data-scene-index="8">
        <div className="section-shell join-layout">
          <div data-reveal>
            <span className="section-index">06 / JOIN</span>
            <h2>Build with us.</h2>
            <p>Contribute to an active problem where your skills are useful.</p>
          </div>
          <div className="join-disciplines" data-reveal>
            {disciplines.map((discipline) => <span key={discipline}>{discipline}</span>)}
          </div>
          <div className="join-actions" data-reveal>
            <a className="text-action" href={issues} target="_blank" rel="noreferrer">View open issues <span aria-hidden="true">↗</span></a>
            <a className="text-action" href={github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
            <a className="text-action" href={joinForm} target="_blank" rel="noreferrer">Join Us <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <footer className="site-footer" data-scene-index="8">
        <div className="footer-top"><a className="footer-index" href="#home">BACK TO ARRIVAL ↑</a><span>AN OPEN ENGINEERING COLLECTIVE</span></div>
        <div className="footer-wordmark">
          <p>11 OCTOBER</p>
          <div className="engineering-marquee" role="group" aria-label="Engineering disciplines">
            <div className="engineering-marquee__track" aria-hidden="true">
              {[0, 1].map((copy) => (
                <div className="engineering-marquee__set" key={copy}>
                  {engineeringFields.map(([code, field]) => (
                    <span className="engineering-marquee__item" key={code}>
                      <span className="engineering-marquee__mark">{code}</span>{field}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <span className="visually-hidden">{engineeringFields.map(([, field]) => field).join(', ')}</span>
          </div>
        </div>
        <div className="footer-bottom"><span>REAL PROBLEMS. OPEN ENGINEERING.</span><a href="#home">RETURN TO THE ORBIT ↑</a></div>
      </footer>
    </main>
  )
}
