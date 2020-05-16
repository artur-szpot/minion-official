import { AppState } from '../../classes/state'
import { TerminalMessage as TM } from '../../classes/terminal'
import { SyntaxElementEnum as SE } from '../../classes/syntax'

export function executeAddComment(state: AppState, args: string[]): AppState {
   const images = state.minions.selectedData
   if (!images.length) {
      state.terminal.messageQueue.push(new TM('You must select at least 1 image to use this command.', [], true))
      return state
   }
   for (let image of images) {
      image.comments.push(args.join(' '))
   }
   state.terminal.messageQueue.push(new TM('Comment added successfully.'))
   return state
}

export function executeRemoveComment(state: AppState, args: string[]): AppState {
   if (state.minions.selected.length !== 1) {
      state.terminal.messageQueue.push(new TM('Removing comments is only allowed for a single image at a time.', [], true))
      return state
   }
   const image = state.minions.selectedData[0]
   const index = +args[0]
   if (image.comments.length <= index) {
      state.terminal.messageQueue.push(new TM(`Comment with index ${index} not found.`, [3, SE.NUMBER, 2], true))
      return state
   }
   image.comments.splice(index, 1)
   state.terminal.messageQueue.push(new TM('Comment removed successfully.'))
   return state
}