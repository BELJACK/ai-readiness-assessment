/**
 * Persistent authorship mark, pinned to the bottom-left corner on every page.
 * Kept low-contrast and out of the tab order so it never competes with the UI.
 */
export function Signature() {
  return (
    <div data-print-hide className="pointer-events-none fixed bottom-4 left-4 z-40 print:hidden">
      <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel/70 py-1.5 pl-2.5 pr-3 shadow-sm backdrop-blur-md">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-primary/60" />
        <span className="text-[11px] leading-none text-muted-foreground">
          Built by <span className="font-medium text-foreground">Belema Jackreece</span>
        </span>
      </span>
    </div>
  )
}
