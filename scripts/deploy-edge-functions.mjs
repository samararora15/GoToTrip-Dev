/**
 * Deploy booking email Edge Functions via Supabase MCP deploy payload files.
 * Run: node scripts/deploy-edge-functions.mjs
 * Requires Cursor agent or manual MCP deploy using generated deploy.json files.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'supabase', 'functions')
const fns = ['send-confirmation']

for (const fn of fns) {
  const dir = path.join(root, fn)
  const payload = {
    project_id: 'vikruzijvgmgkodabola',
    name: fn,
    entrypoint_path: 'index.ts',
    verify_jwt: true,
    files: [
      { name: 'index.ts', content: fs.readFileSync(path.join(dir, 'index.ts'), 'utf8') },
      { name: 'emailCore.ts', content: fs.readFileSync(path.join(dir, 'emailCore.ts'), 'utf8') },
    ],
  }
  fs.writeFileSync(path.join(dir, 'deploy.json'), JSON.stringify(payload))
  fs.writeFileSync(
    path.join(__dirname, 'mcp-args-' + fn + '.json'),
    JSON.stringify(payload),
  )
  console.log('Wrote', path.join(dir, 'deploy.json'), 'and scripts/mcp-args-' + fn + '.json')
}
