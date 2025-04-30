import { Globe, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkSection } from '@/components/work-section'
import { RandomSection } from '@/components/random-section'
import { WritingsSection } from '@/components/writings-section'
import { CommandMenu } from '@/components/command-menu'
import { SocialLinks } from '@/components/social-links'

export default function Page() {
  return (
    <main className="container relative mx-auto scroll-my-12 overflow-auto p-4 print:p-12 md:p-16 mb-24">
      <section className="mx-auto w-full max-w-custom space-y-8 bg-white print:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1.5">
            <h1 className="text-3xl font-bold">Ethan Trang</h1>
            <p className="font-helvatica max-w-md text-sm"></p>
            <p className="max-w-md items-center text-pretty font-helvatica text-xs text-muted-foreground">
              <a
                className="inline-flex gap-x-1.5 align-baseline leading-none hover:underline"
                href="https://www.google.com/maps/place/Sydney+NSW,+Australia"
                target="_blank"
              >
                <Globe className="h-3 w-3" />
                Sydney, Australia
              </a>
            </p>
            <div className="flex gap-x-1 pt-1 font-mono text-sm text-muted-foreground print:hidden">
              <Button variant="outline" size="icon" asChild className="h-8 w-8">
                <a href="mailto:ethan.trang5521@gmail.com">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
              <SocialLinks />
            </div>
          </div>
        </div>

        <section className="flex min-h-0 flex-col">
          <p className="text-pretty font-helvatica text-md text-blackish">
            I&apos;m exploring AI products and businesses to build.<br /><br />
            I&apos;ve previously worked in AI startups and companies in technical roles, including Relevance AI (Series A) and VNG Corporation (Unicorn). <br /><br />
            I&apos;m based in Sydney but my home is Vietnam. I like to make videos, tell stories, and have deep conversations. Best place to reach me is on{' '}
            <a href="https://www.linkedin.com/in/ethan-trang/" target="_blank" className="dashed-link">
              LinkedIn
            </a>
            .
          </p>
        </section>

        <WorkSection />
        <RandomSection />
        <WritingsSection />
      </section>

      <CommandMenu />
      
      <p className="fixed bottom-0 left-0 right-0 border-t border-t-muted bg-white p-1 text-center text-sm text-muted-foreground print:hidden">
        Press{' '}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>J
        </kbd>{' '}
        to open the command menu
      </p>
    </main>
  )
}

