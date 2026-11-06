'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const indexItems = [
  ['00', 'HOME', '#home'],
  ['01', 'ORBIT', '#orbit'],
  ['02', 'ABOUT', '#about'],
  ['03', 'PROBLEMS', '#problems'],
  ['04', 'ENGINEERING', '#engineering'],
  ['05', 'SOLUTIONS', '#solutions'],
  ['06', 'ARTICLES', '#articles'],
  ['07', 'SUBMIT', '#submit'],
  ['08', 'JOIN', '#join'],
]

export function SceneReadout() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-scene-index]')
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActive(Number((visible.target as HTMLElement).dataset.sceneIndex))
    }, { threshold: [0.2, 0.5, 0.8] })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const lastIndex = String(indexItems.length - 1).padStart(2, '0')

  return (
    <div className="scene-readout" aria-label={'Scene ' + String(active).padStart(2, '0') + ' of ' + lastIndex + ': ' + indexItems[active][1]}>
      <span>{String(active).padStart(2, '0')} / {lastIndex}</span>
      <span>{indexItems[active][1]}</span>
    </div>
  )
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal()
    if (!open && dialog.current?.open) dialog.current.close()
  }, [open])

  return (
    <>
      <a className="skip-link" href="#about">Skip intro</a>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="11 October, home">11 OCTOBER</a>
        <button className="index-trigger" type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
          INDEX <span aria-hidden="true">+</span>
        </button>
      </header>
      <SceneReadout />
      <dialog className="index-dialog" ref={dialog} aria-label="Site index" onClose={() => setOpen(false)} onClick={(event) => {
        if (event.target === dialog.current) dialog.current?.close()
      }}>
        <div className="index-dialog__top">
          <span>11 OCTOBER / INDEX</span>
          <button type="button" className="index-close" autoFocus onClick={() => setOpen(false)} aria-label="Close index">CLOSE <span aria-hidden="true">×</span></button>
        </div>
        <nav aria-label="Index">
          {indexItems.map(([number, title, href]) => (
            <a key={number} href={href} onClick={() => setOpen(false)}>
              <span>{number}</span><span>{title}</span><span aria-hidden="true">↗</span>
            </a>
          ))}
          <Link href="/articles"><span>↗</span><span>ALL ARTICLES</span><span aria-hidden="true">↗</span></Link>
        </nav>
      </dialog>
    </>
  )
}
