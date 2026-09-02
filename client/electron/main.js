import { app, BrowserWindow } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  })
  
  win.maximize() // Maximize the window by default

  // Clear cache to ensure we always get the latest version from the VPS
  win.webContents.session.clearCache().then(() => {
    // Since we have deployed it to a VPS, the desktop app just needs to load the VPS URL directly!
    // That way, we don't need to package the react app locally and worry about proxy configuration
    // Nativefier does the same thing, but electron-builder creates a nice installer setup.exe
    win.loadURL('http://72.61.241.138:8081')
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
})
