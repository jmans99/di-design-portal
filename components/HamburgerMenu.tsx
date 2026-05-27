'use client'

import { useState, type ReactNode } from 'react'

interface HamburgerMenuProps {
  children: ReactNode | ((close: () => void) => ReactNode)
  fullWidth?: boolean
  light?: boolean
  onOpenChange?: (open: boolean) => void
}

export function HamburgerMenu({ children, fullWidth, light, onOpenChange }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => {
    setIsOpen(false)
    onOpenChange?.(false)
  }
  const toggle = () => {
    const next = !isOpen
    setIsOpen(next)
    onOpenChange?.(next)
  }

  const content = typeof children === 'function' ? children(close) : children

  return (
    <div className={`relative ${fullWidth ? 'flex w-full justify-end' : 'inline-block'}`}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        data-open={isOpen.toString()}
        className={`relative h-8 w-8 shrink-0 cursor-pointer border-none bg-transparent p-0 outline-none transition-[transform] duration-200 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background data-[open=true]:rotate-[-90deg] before:absolute before:left-1/2 before:top-[10.2px] before:h-[2px] before:w-[23.7px] before:-translate-x-1/2 before:content-[''] before:transition-[transform] before:duration-200 data-[open=true]:before:translate-y-[6px] data-[open=true]:before:rotate-45 after:absolute after:left-1/2 after:top-[19.8px] after:h-[2px] after:w-[23.7px] after:-translate-x-1/2 after:content-[''] after:transition-[transform] after:duration-200 data-[open=true]:after:-translate-y-[4px] data-[open=true]:after:-rotate-45 ${
          light ? 'before:bg-white after:bg-white' : 'before:bg-[#211D1D] after:bg-[#211D1D]'
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-hidden={!isOpen}
        data-open={isOpen.toString()}
        className="fixed inset-x-0 top-[4.5rem] z-[999] h-[calc(100vh-4.5rem)] overflow-y-auto bg-white opacity-0 invisible -translate-y-2 pointer-events-none transition-[opacity_0.2s_ease,transform_0.3s_ease,visibility_0s_0.2s] data-[open=true]:opacity-100 data-[open=true]:visible data-[open=true]:translate-y-0 data-[open=true]:pointer-events-auto data-[open=true]:[transition:opacity_0.2s_ease,transform_0.3s_ease,visibility_0s_0s]"
      >
        <div className="mx-auto max-w-3xl px-8 py-6">{content}</div>
      </div>
    </div>
  )
}
