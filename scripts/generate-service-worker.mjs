import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const templatePath = path.join(repoRoot, 'scripts', 'service-worker.template.js')
const outputPath = path.join(repoRoot, 'public', 'sw.js')

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

async function getBuildVersion(template) {
  const hash = createHash('sha256')
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || git(['rev-parse', 'HEAD'])
  hash.update(commit || `standalone-${new Date().toISOString()}`)
  hash.update(template)

  const relevantPaths = [
    'src',
    'public',
    'package.json',
    'next.config.ts',
    'scripts/service-worker.template.js',
    'scripts/generate-service-worker.mjs',
    ':(exclude)public/sw.js',
  ]

  hash.update(git(['diff', '--no-ext-diff', 'HEAD', '--', ...relevantPaths]))

  const untracked = git(['ls-files', '--others', '--exclude-standard', '--', ...relevantPaths])
    .split(/\r?\n/)
    .filter((file) => file && file !== 'public/sw.js')
    .sort()

  for (const file of untracked) {
    hash.update(file)
    hash.update(await readFile(path.join(repoRoot, file)))
  }

  return hash.digest('hex').slice(0, 12)
}

const template = await readFile(templatePath, 'utf8')
const version = await getBuildVersion(template)
const output = template.replaceAll('__BUILD_VERSION__', version)

await writeFile(outputPath, output, 'utf8')
console.log(`[pwa] generated public/sw.js (${version})`)
