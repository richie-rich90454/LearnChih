import { startPreviewServer, stopServer } from './lib/server.mjs'
import { spawn } from 'node:child_process'
import path from 'node:path'
import puppeteer from 'puppeteer'

const PORT = 4173

async function run() {
  const server = await startPreviewServer(PORT)

  try {
    await new Promise((resolve, reject) => {
      const proc = spawn(
        'npx',
        ['pa11y-ci', '--config', path.join('tests-accessibility', '.pa11yci.json')],
        {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true,
          env: {
            ...process.env,
            PUPPETEER_EXECUTABLE_PATH: puppeteer.executablePath(),
          },
        },
      )

      proc.on('error', reject)
      proc.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`pa11y-ci exited with code ${code}`))
        }
      })
    })
  } finally {
    await stopServer(server)
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
