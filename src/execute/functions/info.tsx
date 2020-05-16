import { AppState } from '../../classes/state'
import { TerminalMessage as TM } from '../../classes/terminal'
import { SyntaxElementEnum } from '../../classes/syntax'

export function msg(state: AppState, text: string, categories: (SyntaxElementEnum | number)[] = [], error: boolean = false): AppState {
   state.terminal.messageQueue.push(new TM(text, categories, error))
   return state
}

export function executeInfoFreeIndex(state: AppState, args: string[]): AppState {
   const max = Math.max(...state.minions.all.map(e => e.index))
   state = msg(state, `${max + 1}`)
   return state
}