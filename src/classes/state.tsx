import { AppStateMinions, AppStateMinionsParameters } from "./minionData"
import { AppStateTerminal } from "./terminal"
import { MinionData } from './minionData'
import { FilterParameter } from "./filter"
import { AppStateStats } from "./stats"
import { AppStateFile } from "./file"
import { AppStateData } from "./dataCategory"

export class AppState {
   data: AppStateData
   minions: AppStateMinions
   terminal: AppStateTerminal
   stats: AppStateStats
   filters: FilterParameter[]
   showSave: boolean = false
   file: AppStateFile

   constructor(data: AppStateData, images: MinionData[], params: AppStateMinionsParameters) {
      this.data = data
      this.minions = new AppStateMinions(images, params)
      this.terminal = new AppStateTerminal()
      this.filters = []
      this.stats = new AppStateStats()
      this.file = new AppStateFile()
   }
}

