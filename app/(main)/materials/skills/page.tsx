import { SkillsBrowser } from '@/components/skills/skills-browser'

export const metadata = {
  title: 'Skills — Brand asset generator',
}

export default function SkillsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-10">
      <div
        className="-mx-6 -mt-10 mb-3"
        style={{ background: 'linear-gradient(180deg, hsl(214 100% 97%) 0%, hsl(210 40% 98.3%) 100%)' }}
      >
        <div className="px-6 pb-6 pt-9">
          <h1 className="font-heading text-[2.75rem] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
            Skills
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            The Claude skills the Giga team uses, packaged and ready to install.
            Download one, add it to Claude Desktop, and it runs whenever the work
            calls for it. Each skill carries its own instructions, so the output
            stays on brand.
          </p>
        </div>
      </div>
      <SkillsBrowser />
    </main>
  )
}
