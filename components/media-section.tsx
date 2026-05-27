'use client'

import { ArrowUpRight, ImageIcon } from 'lucide-react'

const GALLERIES = [
  {
    id: 'flickr',
    title: 'Public Events Photos',
    description: "Giga's public Flickr albums — event coverage, field visits, and community moments shared openly.",
    tags: ['Flickr', 'Images'],
    href: 'https://www.flickr.com/photos/gigaglobal/albums/',
    svg: (
      <img src="/images/flickr-events.jpg" alt="Flickr Events" className="w-full h-full object-cover" />
    ),
  },
  {
    id: 'weshare',
    title: 'UNICEF Official Gallery',
    description: "High-resolution photography from UNICEF's official media library — professionally curated for editorial use.",
    tags: ['UNICEF', 'Images'],
    href: 'https://weshare.unicef.org/',
    svg: (
      <img src="/images/unicef-gallery.jpg" alt="UNICEF Official Gallery" className="w-full h-full object-cover" />
    ),
  },
  {
    id: 'impact-stories',
    title: 'Impact Stories',
    description: "Visual documentation of Giga's impact — stories from schools, communities, and partners around the world.",
    tags: ['SharePoint', 'Images', 'Videos'],
    href: 'https://unicef.sharepoint.com/:f:/r/teams/ICTD-DIDI/DocumentLibrary1/005%20Communication%20and%20External%20Relations/02_Communications/000%20-%20COMMS%20HUB%20ALPHA/MULTIMEDIA%20CENTRE/IMPACT%20STORIES?csf=1&web=1&e=DeBXbe',
    svg: (
      <img src="/images/impact-stories.jpg" alt="Impact Stories" className="w-full h-full object-cover" />
    ),
  },
  {
    id: 'events',
    title: 'Event Coverage',
    description: 'Photos and media from Giga events — conferences, launches, field missions, and partner meetings.',
    tags: ['SharePoint', 'Images', 'Videos'],
    href: 'https://unicef.sharepoint.com/teams/ICTD-DIDI/DocumentLibrary1/Forms/AllItems.aspx?csf=1&web=1&e=QQLhHm&CID=e70b14e6%2Dcbca%2D46d7%2D807f%2D410bceffa2af&FolderCTID=0x012000817466FC87269A4FA817DD253A5243D5&id=%2Fteams%2FICTD%2DDIDI%2FDocumentLibrary1%2F005%20Communication%20and%20External%20Relations%2F02%5FCommunications%2F000%20%2D%20COMMS%20HUB%20ALPHA%2FMULTIMEDIA%20CENTRE%2FEVENT%20COVERAGE',
    svg: (
      <img src="/images/event-coverage.jpg" alt="Event Coverage" className="w-full h-full object-cover" />
    ),
  },
  {
    id: 'product',
    title: 'Product Photos & Footage',
    description: "Photos and video footage of Giga's products, tools, and technology — for presentations and communications.",
    tags: ['SharePoint', 'Images', 'Videos'],
    href: 'https://unicef.sharepoint.com/:f:/r/teams/ICTD-DIDI/DocumentLibrary1/005%20Communication%20and%20External%20Relations/02_Communications/000%20-%20COMMS%20HUB%20ALPHA/MULTIMEDIA%20CENTRE/PRODUCT%20PHOTOS%20AND%20FOOTAGE?csf=1&web=1&e=UdyYd3',
    svg: (
      <img src="/images/product-photos.jpg" alt="Product Photos & Footage" className="w-full h-full object-cover" />
    ),
  },
  {
    id: 'youtube',
    title: 'YouTube Channel',
    description: "Giga's official YouTube channel — documentaries, explainers, event recordings, and partner stories.",
    tags: ['YouTube', 'Videos'],
    href: 'https://www.youtube.com/@GigaGlobal',
    svg: (
      <img src="/images/youtube.jpg" alt="YouTube Channel" className="w-full h-full object-cover" />
    ),
  },
]

export function MediaSection() {
  return (
    <div className="animate-in fade-in duration-300 ease-out">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GALLERIES.map((gallery) => (
          <a
            key={gallery.id}
            href={gallery.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-stripe transition-smooth hover-lift"
          >
            {/* Thumbnail */}
            <div className="relative h-44 w-full overflow-hidden shrink-0">
              {gallery.svg}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
                <ImageIcon className="h-3 w-3 text-white/80" />
                <span className="text-[11px] font-medium text-white/90">{gallery.tags[0]}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 p-5">
              <h3 className="font-heading text-base font-medium text-foreground leading-snug">
                {gallery.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {gallery.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {gallery.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors group-hover:text-foreground">
                  Browse gallery
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
