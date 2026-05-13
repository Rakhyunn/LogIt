export const REVIEW_TAGS = [
  '명작',
  '감동적인',
  '재관할만한',
  '독창적인',
  '웃긴',
  '무서운',
  '생각할거리',
  'OST가 좋은',
  '지루한',
  '실망스러운',
] as const

export type ReviewTag = (typeof REVIEW_TAGS)[number]
