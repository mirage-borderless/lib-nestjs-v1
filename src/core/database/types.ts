export interface Cursor {
  limit:   number
  offset?: number
}

export namespace Cursor {
  export const DEFAULT = { limit: 5, offset: 0 }
}
