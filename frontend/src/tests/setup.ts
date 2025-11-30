import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

declare global {
  // eslint-disable-next-line no-var
  var __shouldRunScope: ((tags: string[]) => boolean) | undefined
}

const parseCliScopes = (): Set<string> => {
  const argv = (globalThis as typeof globalThis & { process?: { env?: Record<string, unknown> } }).process?.env?.npm_config_argv
  if (typeof argv !== "string") return new Set<string>()

  try {
    const parsed = JSON.parse(argv) as { remain?: string[] }
    const remain = parsed.remain ?? []
    const doubleDashIndex = remain.indexOf("--")
    if (doubleDashIndex === -1) return new Set<string>()
    const scopeTokens = remain.slice(doubleDashIndex + 1)
    const tokens = scopeTokens.map(token => token.toLowerCase().trim()).filter(Boolean)
    return new Set(tokens)
  } catch {
    return new Set<string>()
  }
}

const scopeFilters = parseCliScopes()

globalThis.__shouldRunScope = (tags: string[]) => {
  if (!scopeFilters.size) return true
  const normalizedTags = tags.map(tag => tag.toLowerCase())
  return Array.from(scopeFilters).every(token => normalizedTags.includes(token))
}

afterEach(() => {
  cleanup()
})
