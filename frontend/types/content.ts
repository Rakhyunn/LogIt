export type MovieMeta = {
  director: string
  release_year: number
  genres: string[]
}

export type DramaMeta = {
  director: string
  air_year: number
  episodes: number
  genres: string[]
}

export type BookMeta = {
  author: string
  publish_year: number
  publisher: string
}

export type ContentMeta = MovieMeta | DramaMeta | BookMeta
