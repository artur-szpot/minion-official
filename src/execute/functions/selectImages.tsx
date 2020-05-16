import { AppState } from '../../classes/state'
import { TerminalMessage as TM } from '../../classes/terminal'

export function executeSelectImage(state: AppState, args: string[]): AppState { return selectImages(state, args.map(e => +e), true, false) }
export function executeDeselectImage(state: AppState, args: string[]): AppState { return selectImages(state, args.map(e => +e), false, true) }
export function executeSuperSelectImage(state: AppState, args: string[]): AppState { return selectImages(state, args.map(e => +e), true, true) }

export function executeSelectImageRange(state: AppState, args: string[]): AppState { return selectImagesRange(state, args, true, false) }
export function executeDeselectImageRange(state: AppState, args: string[]): AppState { return selectImagesRange(state, args, false, true) }
export function executeSuperSelectImageRange(state: AppState, args: string[]): AppState { return selectImagesRange(state, args, true, true) }

function selectImagesRange(state: AppState, args: string[], doSelect: boolean, doDeselect: boolean): AppState { 
   let range: number[] = []
   for (let i = +args[0]; i <= +args[1]; i++) { range.push(i) }
   return selectImages(state,range,doSelect,doDeselect)
}

function selectImages(state: AppState, indices: number[], doSelect: boolean, doDeselect: boolean): AppState {
   let selected = 0
   let deselected = 0
   const indicesGiven = indices.length
   if (!indicesGiven) { indices = state.minions.filtered.map((_, i) => i) }
   indices.forEach(e => {
      if (e > state.minions.filtered.length - 1 || e < 0) { return }
      const index = state.minions.selected.indexOf(e)
      if (index !== -1) {
         if (doDeselect) {
            state.minions.selected.splice(index, 1)
            deselected++
         }
      } else {
         if (doSelect) {
            state.minions.selected.push(e)
            selected++
         }
      }
   })
   let message = ''
   let error = false
   if (selected && deselected) {
      message = `Selected ${selected} image${selected > 1 ? 's' : ''} and deselected ${deselected}.`
   } else if (selected) {
      message = `Selected ${selected} image${selected > 1 ? 's' : ''}.`
   } else if (deselected) {
      message = `Deselected ${deselected} image${deselected > 1 ? 's' : ''}.`
   } else if(doSelect || indicesGiven) {
      message = 'Wrong image numbers. No change in selection made.'
      error = true
   }
   if (message.length) {
      state.terminal.messageQueue.push(new TM(message, [], error))
   }
   return state
}