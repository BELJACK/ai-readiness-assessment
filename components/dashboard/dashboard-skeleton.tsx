function Block({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-inset ${className ?? ""}`} />
}

function Row() {
  return (
    <div className="p-6 sm:px-6">
      <div className="flex items-start justify-between gap-6">
        <div className="w-full max-w-sm">
          <Block className="h-4 w-40" />
          <Block className="mt-2 h-3 w-full" />
        </div>
        <Block className="h-6 w-24 shrink-0" />
      </div>
      <Block className="mt-4 h-1.5 w-full rounded-full" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <>
      <div className="border-b border-hairline bg-band">
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-16">
          <Block className="h-3 w-32" />
          <Block className="mt-4 h-10 w-64" />
          <Block className="mt-4 h-4 w-80" />

          <div className="panel mt-8 overflow-hidden">
            <div className="flex flex-col items-center gap-8 p-6 sm:p-8 lg:flex-row lg:gap-12">
              <Block className="size-[200px] shrink-0 rounded-full" />
              <div className="w-full flex-1">
                <Block className="h-6 w-full max-w-md" />
                <Block className="mt-2 h-6 w-2/3 max-w-sm" />
                <Block className="mt-6 h-4 w-full" />
                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-hairline pt-6 sm:grid-cols-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i}>
                      <Block className="h-3 w-16" />
                      <Block className="mt-2 h-5 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-px border-t border-hairline bg-hairline sm:grid-cols-2">
              <div className="bg-panel px-6 py-6">
                <Block className="h-3 w-28" />
                <Block className="mt-2 h-5 w-32" />
              </div>
              <div className="bg-panel px-6 py-6">
                <Block className="h-3 w-36" />
                <Block className="mt-2 h-5 w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mt-16">
          <Block className="h-5 w-52" />
          <Block className="mt-2 h-4 w-72" />
          <div className="panel mt-6 divide-y divide-hairline">
            {Array.from({ length: 5 }, (_, i) => (
              <Row key={i} />
            ))}
          </div>
        </div>

        <div className="mt-16">
          <Block className="h-5 w-44" />
          <Block className="mt-2 h-4 w-80" />
          <div className="panel mt-6 divide-y divide-hairline">
            {Array.from({ length: 4 }, (_, i) => (
              <Row key={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
