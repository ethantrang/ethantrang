'use client'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useEffect, useState } from 'react'

const links = [
  {
    url: 'https://calvinchen.me',
    title: 'Personal Website'
  },
  {
    url: 'https://github.com/Calvinjaychen',
    title: 'GitHub'
  },
  {
    url: 'https://www.linkedin.com/in/calvinjaychen/',
    title: 'LinkedIn'
  },
  {
    url: 'https://twitter.com/CalvinnChenn',
    title: 'X'
  }
]

export function CommandMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Links">
          {links.map((link) => (
            <CommandItem
              key={link.url}
              onSelect={() => {
                window.open(link.url, '_blank')
                setOpen(false)
              }}
            >
              {link.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

