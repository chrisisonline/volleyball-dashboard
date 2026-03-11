export interface Game {
  time: string
  court: number
  opponent: string
}

export interface ScheduleItem {
  date: string
  games: Game[]
}
