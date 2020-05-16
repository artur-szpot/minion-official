import { TerminalColor, TerminalLine } from '../terminal/TerminalPanel'
import { AppState } from '../classes/state'
import { SyntaxElementEnum as SE } from '../classes/syntax'

export function parseTerminalReplies(state: AppState): AppState {
  for (let reply of state.terminal.messageQueue) {
    const normalColor = reply.error ? SE.ERROR : SE.NONE
    if (!reply.categories.length) {
      state.terminal.output.push(new TerminalLine(reply.text, [new TerminalColor(normalColor, reply.text, false)], false))
      continue
    }
    let words = reply.text.split(' ').map(e => new TerminalColor(normalColor, e, true))
    let splitters = [':', '.', ',', '-', '/']
    for (let splitter of splitters) {
      words = splitWordsByString(words, splitter, normalColor)
    }
    let colors: TerminalColor[] = []
    let i = 0
    for (let word of words) {
      if (reply.categories.length && !splitters.includes(word.value)) { word.dataType = reply.categories[i++] }
      colors.push(word)
    }
    if (i !== reply.categories.length) {
      alert(`Difference between number of words (${i}) and declared categories (${reply.categories.length}) in message "` + reply.text + '"')
      continue
    }
    state.terminal.output.push(new TerminalLine(reply.text, words, false))
  }
  state.terminal.messageQueue = []
  return state
}

function splitWordsByString(words: TerminalColor[], splitter: string, normalColor: SE): TerminalColor[] {
  let retval: TerminalColor[] = []
  const spaceAfter = words[words.length - 1].spaceAfter
  words.forEach(e => {
    if (e.value !== splitter && e.value.includes(splitter)) {
      e.value.split(splitter).forEach(el => {
        if (el.length) {
          retval.push(new TerminalColor(normalColor, el, false))
          retval.push(new TerminalColor(normalColor, splitter, false))
        }
      })
      if (e.value.endsWith(splitter)) {
        retval[retval.length - 1].spaceAfter = e.spaceAfter
      } else {
        retval = retval.slice(0, retval.length - 1)
        retval[retval.length - 1].spaceAfter = e.spaceAfter
      }
    } else {
      retval.push(e)
    }
  })
  retval[retval.length - 1].spaceAfter = spaceAfter
  return retval
}