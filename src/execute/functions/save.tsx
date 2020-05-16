import { AppState } from '../../classes/state'
import { outputData } from '../../data/data'
import { AppStateFileTypeEnum } from '../../classes/file'

export function executeToggleSave(state: AppState, args: string[]): AppState {
   state.showSave = !state.showSave
   return state
}

export function executePrepareSave(state: AppState, args: string[]): AppState {
   state.file.type = AppStateFileTypeEnum.DATA
   state.file.data = outputData(state)
   return state
}