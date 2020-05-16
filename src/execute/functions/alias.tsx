import { AppState } from '../../classes/state'
import { TerminalMessage as TM } from '../../classes/terminal'
import { SyntaxElementEnum as SE } from '../../classes/syntax'
import { DataCategory } from '../../classes/dataCategory'


export function executeCreateAlias(state: AppState, args: string[]): AppState {
  const type = args[0] as SE
  switch (type) {
    case SE.CATEGORY:
    case SE.COMMAND:
    case SE.TAG:
      break
    default:
      alert('Type not expected by alias.tsx - immediate fix necessary!')
      return state
  }
  const aliases = findExistingAliases(state.data[type]!.index, args.slice(2))
  if (aliases.existing.length) {
    state.terminal.messageQueue.push(new TM(`These aliases already exist and won't be created: ${aliases.existing.join(', ')}`, [8, ...aliases.existing.map(e => type)], true))
    if (!aliases.new.length) {
      return state
    }
  }
  state.data[type]!.addAliases(args[1], aliases.new)
  state.terminal.messageQueue.push(new TM(`New aliases created: ${aliases.new.join(', ')}`, [3, ...aliases.new.map(e => type)]))
  return state
}

export function executeListAliases(state: AppState, args: string[]): AppState {
  const type = args[0] as SE
  switch (type) {
    case SE.CATEGORY:
    case SE.COMMAND:
    case SE.TAG:
      break
    default:
      alert('Type not expected by alias.tsx - immediate fix necessary!')
      return state
  }
  const aliased: DataCategory = state.data[type]!.stringDict[args[1]]!
  let aliasedTypes: SE[] = [type]
  switch (type) {
    case SE.TAG:
      aliasedTypes = [SE.CATEGORY, type]
      break
  }
  if (aliased.aliases.length) {
    if(type === SE.TAG){
    state.terminal.messageQueue.push(new TM(`Aliases for ${aliased.fullName()}: ${aliased.aliases.join(', ')}`, [2, SE.CATEGORY, SE.TAG, ...aliased.aliases.map(e => type)]))
    }else{
    state.terminal.messageQueue.push(new TM(`Aliases for ${aliased.fullName()}: ${aliased.aliases.join(', ')}`, [2, type, ...aliased.aliases.map(e => type)]))
    }
  } else {
    state.terminal.messageQueue.push(new TM(`${aliased.fullName()} has no aliases.`, [...aliasedTypes, 3]))
  }
  return state
}

export function findExistingAliases(codeBase: string[], potentialAliases: string[]): { existing: string[], new: string[] } {
  let existingAliases = []
  let newAliases = []
  for (let alias of potentialAliases) {
    if (codeBase.includes(alias)) {
      existingAliases.push(alias)
    } else {
      newAliases.push(alias)
    }
  }
  return { existing: existingAliases, new: newAliases }
}