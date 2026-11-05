import Link from 'next/link'

export default function DocumentHeader() {
  return (
    <header className="document-header">
      <Link className="wordmark" href="/">11 OCTOBER</Link>
      <Link className="index-trigger" href="/#home">HOME <span aria-hidden="true">↗</span></Link>
    </header>
  )
}
