'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(!open)} className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-white">
        <span className={`w-5 h-0.5 bg-white transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`w-5 h-0.5 bg-white transition-all ${open ? 'opacity-0' : ''}`} />
        <span className={`w-5 h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-[#0a0f0a]/95 backdrop-blur-md border-b border-white/10 p-4 flex flex-col gap-3 z-50">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-gray-300 hover:text-[#b8f53d] text-lg font-medium transition-colors py-1">
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10">
            <span className="text-xs px-2 py-1 rounded-full border border-[#b8f53d]/30 text-[#b8f53d]">Season 01</span>
          </div>
        </div>
      )}
    </>
  )
}
