import { AppState } from '../classes/state'
import { TerminalMessage as TM } from '../classes/terminal'
import { SyntaxElementEnum as SE, Syntax, } from '../classes/syntax'
import { TerminalColor, TerminalLine } from "../terminal/TerminalPanel"

/** Execute the text command. doExecute=false for code coloration. overrideMode=true for ignoring whether the input box is set to tagging */
export default function execute(state: AppState, input: string | string[], doExecute: boolean, overrideMode: boolean): AppState {
  const saveState = state
  try {
    if (!Array.isArray(input)) {
      if (!input.includes(';')) {
        return executeSingle(state, input, doExecute, !overrideMode && state.terminal.tagInput)
      }
      if (!doExecute) {
        return executeSingle(state, input, false, state.terminal.tagInput)
      }
      input = input.split(';')
    }
    for (let command of input) {
      state = executeSingle(state, command, true, !overrideMode && state.terminal.tagInput)
    }
  } catch {
    state = saveState
    alert('Unhandled error caught!')
  }
  return state
}

function checkIllegalSymbols(input: string): boolean {
  let regex = /[-a-z0-9_ ;]*/.exec(input)
  return regex === null || regex[0] === input
}

function executeSingle(state: AppState, input: string, doExecute: boolean, tagInput: boolean): AppState {
  let coloredInput: TerminalColor[] = input.split(' ').map(e => new TerminalColor(SE.NONE, e, true))
  coloredInput[0].dataType = SE.COMMAND

  // ==============================================================
  // check for empty input

  if (input.length === 0) {
    if (doExecute) {
      state.terminal.input = new TerminalLine(input, [], true)
      return state
    } else {
      state.terminal.input = new TerminalLine(input, coloredInput, true)
      return state
    }
  }

  // ==============================================================
  // check for illegal symbols

  if (!checkIllegalSymbols(input)) {
    if (doExecute) {
      state.terminal.messageQueue.push(new TM('Illegal symbols used - use only small letters, numbers and _ - ; space'))
      return state
    }
  }

  // ==============================================================
  // check for space-only input

  const words = input.split(' ').filter(e => e.length)
  if (!words.length) {
    if (doExecute) {
      return state
    } else {
      state.terminal.input = new TerminalLine(input, coloredInput, true)
      return state
    }
  }

  // ==============================================================
  // easy way out: tags only

  if (tagInput) {
    if (doExecute) {
      const unknownTags = words.map(e => e.replace('-', '')).filter(e => !state.data.tag.index.includes(e))
      if (!unknownTags.length) {
        let adds: string[] = []
        let removes: string[] = []
        words.forEach(e => e.startsWith('-') ? removes.push(e.replace('-', '')) : adds.push(e))
        if (adds.length) { state = execute(state, 'add ' + adds.join(' '), true, true) }
        if (removes.length) { state = execute(state, 'remove ' + removes.join(' '), true, true) }
        return state
      } else {
        state.terminal.messageQueue.push(new TM(`Unknown tags: ${unknownTags.join(', ')}`, [], true))
        return state
      }
    } else {
      const wordsAndSpaces = input.split(' ')
      wordsAndSpaces.forEach((e, i) => coloredInput[i].dataType = state.data.tag.index.includes(e.replace('-', '')) ? SE.TAG : SE.ERROR)
      state.terminal.input = new TerminalLine(input, coloredInput, true)
      return state
    }
  }

  // ==============================================================
  // prepare variables

  const args = words.length > 1 ? words.slice(1) : []

  if (!state.data.command.stringDict.hasOwnProperty(words[0])) {
    if (doExecute) {
      state.terminal.messageQueue.push(new TM('Unknown command: ' + words[0], [], true))
      return state
    } else {
      coloredInput[0].dataType = SE.ERROR
      state.terminal.input = new TerminalLine(input, coloredInput, true)
      return state
    }

  }
  const command = state.data.command.stringDict[words[0]]

  // ==================================================
  // check syntax (if any)

  if (!command.syntax.length) {
    if (args.length) {
      if (doExecute) {
        state.terminal.messageQueue.push(new TM(`Incorrect syntax.Expected no arguments for command ${command.name}.`, [7, SE.COMMAND], true))
        return state
      } else {
        coloredInput.forEach((e, i) => i > 0 ? e.dataType = SE.ERROR : null)
        state.terminal.input = new TerminalLine(input, coloredInput, true)
        return state
      }
    }
  } else {
    if (doExecute) {
      // ==================================================
      // #region parse syntax for execution

      let possibleSyntax: Syntax[] = [...command.syntax]

      // check number of arguments
      possibleSyntax = possibleSyntax.filter(e => (e.unlimited !== null && args.length >= e.elements.length) || (e.unlimited === null && args.length === e.elements.length))
      if (!possibleSyntax.length) {
        if (command.syntax.length === 1) {
          const [syntaxString, syntaxDisplay] = command.syntaxToDisplay[0]
          state.terminal.messageQueue.push(new TM(`Incorrect syntax. Expected: ${command.name} ${syntaxString}`, [3, SE.COMMAND, ...syntaxDisplay], true))
        } else {
          state.terminal.messageQueue.push(new TM(`Incorrect syntax. Expected one of the following:`))
          const syntaxes = command.syntaxToDisplay
          syntaxes.forEach(e => state.terminal.messageQueue.push(new TM(`${command.name} ${e[0]} `, [SE.COMMAND, ...e[1]], true)))
        }
        return state
      }

      // check type of arguments
      let wrongArguments: { [key: number]: SE[] } = []
      possibleSyntax = possibleSyntax.filter(e => {
        let chosenType: SE = SE.NONE
        let failed = false
        for (let i = 0; i < args.length; i++) {
          let wrong = false
          const element = i < e.elements.length ? e.elements[i] : e.unlimited!
          if (element.correct(state, args[i], chosenType) === SE.ERROR) { wrong = true }
          if (!wrong && [SE.DATA_TYPE, SE.FILTER_TYPE].includes(element.accepts[0])) { chosenType = args[i] as SE }
          if (wrong) {
            failed = true
            if (!wrongArguments.hasOwnProperty(i)) { wrongArguments[i] = [] }
            for (let j = 0; j < element.accepts.length; j++) {
              const elType = element.accepts[j] === SE.OF_TYPE ? chosenType : element.accepts[j]
              if (!wrongArguments[i].includes(elType)) { wrongArguments[i].push(elType) }
            }
          }
        }
        return !failed
      })
      if (!possibleSyntax.length) {
        state.terminal.messageQueue.push(new TM(`Wrong arguments: `))
        Object.keys(wrongArguments).forEach(e => state.terminal.messageQueue.push(new TM(`expected ${args[+e]} to be ${wrongArguments[+e].map(el => String(el)).join('/')} `)))
        return state
      }

      // sanity check
      if (possibleSyntax.length > 1) {
        alert('Ambiguous syntax options defined for command ' + command.name + '!')
        return state
      }

      // #endregion
      // ==================================================
    } else {
      // ==================================================
      // #region parse syntax for display

      let partials: SE[][] = []
      let good: SE[][] = []
      for (let syntax of command.syntax) {
        let currentElements: SE[] = []
        let chosenType: SE = SE.NONE
        let failed = false
        for (let i = 0; i < args.length; i++) {
          const element = i < syntax.elements.length ? syntax.elements[i] : syntax.unlimited!
          const recognizedType = element === null ? SE.ERROR : element.correct(state, args[i], chosenType)
          if (recognizedType === SE.ERROR) {
            failed = true
            break
          }
          if ([SE.DATA_TYPE, SE.FILTER_TYPE].includes(recognizedType)) { chosenType = args[i] as SE }
          currentElements.push(recognizedType)
        }
        if (failed || currentElements.length < syntax.elements.length) { partials.push(currentElements) } else { good.push(currentElements) }
      }

      if (good.length) {
        // sanity check
        if (good.length > 1) { alert('Ambiguous syntax options defined for command ' + command.name + '!') }
        good[0].forEach((e, i) => coloredInput[i + 1].dataType = e)
      } else {
        const bestLength = Math.max(...partials.map(e => e.length))
        for (let partial of partials) {
          if (partial.length === bestLength) {
            partial.forEach((e, i) => coloredInput[i + 1].dataType = e)
            for (let i = bestLength; i < args.length; i++) { coloredInput[i + 1].dataType = SE.ERROR }
            break
          }
        }
      }

      state.terminal.input = new TerminalLine(input, coloredInput, true)
      return state

      // #endregion
      // ==================================================
    }
  }

  // ==================================================
  // execute
  if (doExecute) {
    return command.executeFunction(state, args)
  } else {
    state.terminal.input = new TerminalLine(input, coloredInput, true)
    return state
  }
}