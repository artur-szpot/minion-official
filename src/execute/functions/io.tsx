import { AppState } from '../../classes/state'
import { TerminalMessage as TM } from '../../classes/terminal'
import { AppStateFileTypeEnum } from '../../classes/file'

export function executePrepareIOMove(state: AppState, args: string[]): AppState { return executePrepareIO(state, true) }
export function executePrepareIOCopy(state: AppState, args: string[]): AppState { return executePrepareIO(state, false) }

function executePrepareIO(state: AppState, move: boolean): AppState {
   let files: string[]
   if (state.minions.selected.length) {
      files = state.minions.selectedData.map(e => e.url)
   } else {
      files = state.minions.filteredData.map(e => e.url)
   }
   state.file.type = move ? AppStateFileTypeEnum.IO_MOVE : AppStateFileTypeEnum.IO_COPY
   // todo to enable the IO script, update the template below with correct full system path to the project's directory
   state.file.data = 
      `import shutil
      from myio import create_directory
      src = 'INSERT_CORRECT_OUTPUT_LOCATION/public/img/'
      create_directory(src + 'output')
      ${files.map(e => `shutil.${move ? 'move' : 'copyfile'}(src + 'img/${e}', src + 'output/${e}')`).join('\n')}
`
   return state
}

export function executeMarkForDeletion(state: AppState, args: string[]): AppState {
   const images = state.minions.selectedData
   if (!images.length) {
      state.terminal.messageQueue.push(new TM('You must select at least 1 image to use this command.', [], true))
      return state
   }
   images.forEach(e => e.toBeDeleted = true)
   state.terminal.messageQueue.push(new TM(`Marked ${images.length} image${images.length > 1 ? 's' : ''} for deletion.`))
   return state
}