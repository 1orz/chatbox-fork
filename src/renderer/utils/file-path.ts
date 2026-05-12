// Electron 32+ removed the non-standard `File.path` on drag/drop File objects.
// Renderers must now ask the preload for the OS path via webUtils.getPathForFile.
// This helper centralizes the access so we degrade cleanly on mobile/web where
// no preload exists.
export function getFilePath(file: File): string {
  if (typeof window === 'undefined') return ''
  const api = window.electronAPI
  if (!api?.getPathForFile) return ''
  try {
    return api.getPathForFile(file) || ''
  } catch {
    return ''
  }
}
