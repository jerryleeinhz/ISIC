import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const host = '127.0.0.1'
const preferredPort = 4173
const previewFile = resolve(import.meta.dirname, '..', 'demo.html')
const shouldOpenBrowser = !process.argv.includes('--no-open')

const html = await readFile(previewFile)
const server = createServer((request, response) => {
  if (request.url === '/' || request.url === '/demo.html') {
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    response.end(html)
    return
  }

  if (request.url === '/favicon.ico') {
    response.writeHead(204)
    response.end()
    return
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end('Not found')
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE' && server.address() === null) {
    server.listen(0, host)
    return
  }
  console.error(error.message)
  process.exitCode = 1
})

server.listen(preferredPort, host, () => {
  const address = server.address()
  const url = `http://${host}:${address.port}`

  console.log(`Student Pass Demo is running at ${url}`)
  console.log('Keep this window open. Press Ctrl+C to stop the preview.')

  if (shouldOpenBrowser && process.platform === 'win32') {
    spawn('cmd.exe', ['/c', 'start', '', url], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    }).unref()
  }
})
