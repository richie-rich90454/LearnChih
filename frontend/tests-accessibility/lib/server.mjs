import { spawn } from 'node:child_process'
import http from 'node:http'

export function startPreviewServer(port = 4173) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      'npx',
      ['vite', 'preview', '--port', String(port)],
      { cwd: process.cwd(), stdio: 'pipe', shell: true },
    )

    proc.on('error', reject)
    proc.stderr.on('data', (data) => console.error(data.toString().trim()))

    let started = false
    const interval = setInterval(() => {
      http
        .get(`http://localhost:${port}/`, (res) => {
          if (res.statusCode === 200) {
            started = true
            clearInterval(interval)
            resolve(proc)
          }
        })
        .on('error', () => {})
    }, 500)

    setTimeout(() => {
      if (!started) {
        clearInterval(interval)
        reject(new Error(`Preview server did not start on port ${port}`))
      }
    }, 30000)
  })
}

export async function stopServer(proc) {
  if (!proc) return

  if (process.platform === 'win32') {
    try {
      spawn('taskkill', ['/PID', String(proc.pid), '/T', '/F'], {
        shell: true,
        detached: true,
      })
    } catch {
      // ignore
    }
  } else {
    try {
      process.kill(-proc.pid, 'SIGTERM')
    } catch {
      proc.kill('SIGTERM')
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1500))
}
