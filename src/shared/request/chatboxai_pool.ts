// Chatbox cloud API pool is disabled in this build.

export function isChatboxAPI(_input: RequestInfo | URL) {
  return false
}

export function getChatboxAPIOrigin() {
  return ''
}

export async function testApiOrigins(): Promise<string[]> {
  return []
}
