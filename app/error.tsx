"use client"

import { AlertTriangle, RotateCw } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error)
  }, [error])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="mt-8 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          We could not load your readiness data. This is usually temporary. Try again in a
          moment.
        </p>

        {error.digest ? (
          <p className="numeric mt-6 inline-block rounded-lg bg-inset px-3 py-1.5 text-xs text-muted-foreground">
            Reference {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <RotateCw className="mr-1.5 size-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-hairline bg-panel px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-inset"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
