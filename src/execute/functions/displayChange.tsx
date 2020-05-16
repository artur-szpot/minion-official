import { AppState } from '../../classes/state'
import { validateChange, ChangeWrappingOption } from '../../general/general'
import { TerminalMessage } from '../../classes/terminal'
import execute from '../execute'

export function executeNext(state: AppState, args: string[]): AppState { return executeDisplayChange(state, 1) }
export function executePrev(state: AppState, args: string[]): AppState { return executeDisplayChange(state, -1) }
export function executeGotoPage(state: AppState, args: string[]): AppState {
   const totalPages = Math.ceil(state.minions.filtered.length / state.minions.pageSize)
   const targetPage = +args[0] - 1
   if (targetPage < 0 || targetPage >= totalPages) {
      state.terminal.messageQueue.push(new TerminalMessage('Invalid page number.', [], true))
      return state
   }
   return executeDisplaySet(state, targetPage * state.minions.pageSize)
}

function executeDisplayChange(state: AppState, change: number): AppState {
   return executeDisplaySet(state, validateChange(state.minions.shown[0], change * state.minions.pageSize, 0, state.minions.filtered.length - 1, ChangeWrappingOption.NO_CHANGE_IF_WRAP))
}

function executeDisplaySet(state: AppState, value: number): AppState {
   if(state.minions.pageSize === 1){
      state.minions.last = state.minions.shownData[0]
   } else {
      state.minions.last = null
   }
   state.minions.shown[0] = value
   for (let i = 1; i < state.minions.pageSize; i++) {
      state.minions.shown[i] = state.minions.shown[0] + i > state.minions.filtered.length - 1 ? -1 : state.minions.shown[0] + i
   }
   return state
}

export function executeZoom(state: AppState, args: string[]): AppState {
   state.minions.changeDisplay(true)
   return state
}

export function executePageSizeChange(state: AppState, args: string[]): AppState {
   if (+args[0] <= 0) {
      state.terminal.messageQueue.push(new TerminalMessage('Invalid page size.', [], true))
      return state
   }
   state.minions.changePageSize(+args[0])
   return state
}

export function executeMaxWidthChange(state: AppState, args: string[]): AppState {
   if (+args[0] <= 0) {
      state.terminal.messageQueue.push(new TerminalMessage('Invalid max width.', [], true))
      return state
   }
   state.minions.changeMaxWidth(+args[0])
   return state
}

export function executeToggleInputMode(state: AppState, args: string[]): AppState {
   state.terminal.tagInput = !state.terminal.tagInput
   state = execute(state, state.terminal.input.text, false, false)
   return state
}