import { Session } from '../../shared/types'

export const defaultSessionsForEN: Session[] = []
export const defaultSessionsForCN: Session[] = []

const placeholderSession: Session = {
  id: '__placeholder__',
  name: '__placeholder__',
  type: 'chat',
  messages: [],
  starred: false,
}

export const imageCreatorSessionForCN = placeholderSession
export const imageCreatorSessionForEN = placeholderSession
export const artifactSessionCN = placeholderSession
export const artifactSessionEN = placeholderSession
export const mermaidSessionCN = placeholderSession
export const mermaidSessionEN = placeholderSession
