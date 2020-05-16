import { AppState } from '../../classes/state'
import { TerminalMessage as TM } from '../../classes/terminal'
import { SyntaxElementEnum as SE } from '../../classes/syntax'
import { findExistingAliases } from './alias'
import { Category } from '../../classes/dataCategory'

export function executeCreateCategory(state: AppState, args: string[]): AppState {
   if (state.data.category.index.includes(args[0])) {
      state.terminal.messageQueue.push(new TM(`Category already exists: ${state.data.category.stringDict[args[0]].fullName()}.`, [3, SE.CATEGORY], true))
      return state
   }
   const aliases = findExistingAliases(state.data.category.index, args.slice(1))
   if (aliases.existing.length) {
      state.terminal.messageQueue.push(new TM(`These aliases already exist and won't be created: ${aliases.existing.join(', ')}`, [8, ...aliases.existing.map(e => SE.CATEGORY)], true))
      if (!aliases.new.length) {
         return state
      }
   }
   const newCategory = new Category(-1, args[0], args.slice(1))
   state.data.category.add(newCategory)
   state.terminal.messageQueue.push(new TM(`New category created: ${newCategory.fullName()}.`, [3, SE.CATEGORY]))
   return state
}

export function executeRenameCategory(state: AppState, args: string[]): AppState {
   if (state.data.category.index.includes(args[1])) {
      state.terminal.messageQueue.push(new TM(`Category name already taken: ${args[1]}.`, [4, SE.CATEGORY], true))
      return state
   }
   // grab the old version
   let category = state.data.category.stringDict[args[0]]
   const oldName = category.name
   // remove stringDict reference
   delete state.data.category.stringDict[category.qualifiedName]
   // remove index reference
   let index = state.data.category.index.indexOf(category.qualifiedName)
   state.data.category.index.splice(index, 1)
   // if includes _, remove also version without it
   if (category.qualifiedName.includes('_')) {
      const name = category.qualifiedName.replace(/_/g, '')
      // remove stringDict reference
      delete state.data.category.stringDict[name]
      // remove index reference
      let index = state.data.category.index.indexOf(name)
      state.data.category.index.splice(index, 1)
   }
   // change the name in the object
   category.name = args[1]
   category.updateQualifiedName()
   // reinstate stringDict reference
   state.data.category.stringDict[category.qualifiedName] = category
   // reinstate index reference
   state.data.category.index.push(category.qualifiedName)
   // if includes _, reinstate also version without it
   if (category.qualifiedName.includes('_')) {
      const name = category.qualifiedName.replace(/_/g, '')
      // reinstate stringDict reference
      state.data.category.stringDict[name] = category
      // reinstate index reference
      state.data.category.index.push(name)
   }
   state.terminal.messageQueue.push(new TM(`Category ${oldName} renamed to ${category.name}.`, [1, SE.CATEGORY, 2, SE.CATEGORY]))
   return state
}

export function executeCombineCategories(state: AppState, args: string[]): AppState {
   const categoryToBeRemoved = state.data.category.stringDict[args[1]]
   let categoryToBecomeMaster = state.data.category.stringDict[args[0]]
   if (categoryToBecomeMaster === categoryToBeRemoved) {
      state.terminal.messageQueue.push(new TM('A category cannot be combined with itself.', [], true))
      return state
   }
   // replace all occurences of the category
   for (let tag of state.data.tag.all) {
      if (tag.category === categoryToBeRemoved) {
         tag.category = categoryToBecomeMaster
      }
   }
   // copy aliases
   for (let alias of categoryToBeRemoved.aliases) {
      categoryToBecomeMaster.aliases.push(alias)
   }
   categoryToBecomeMaster.aliases.push(categoryToBeRemoved.qualifiedName)
   // remove the unneeded category
   const index = state.data.category.all.indexOf(categoryToBeRemoved)
   state.data.category.all.splice(index, 1)
   delete state.data.category.numberDict[categoryToBeRemoved.index]
   for (let alias of categoryToBeRemoved.aliases) {
      state.data.category.stringDict[alias] = categoryToBecomeMaster
   }
   state.data.category.stringDict[categoryToBeRemoved.qualifiedName] = categoryToBecomeMaster
   state.terminal.messageQueue.push(new TM(`Category ${categoryToBeRemoved.name} combined into ${categoryToBecomeMaster.name}.`, [1, SE.CATEGORY, 2, SE.CATEGORY]))
   return state
}

export function executeRemoveCategory(state: AppState, args: string[]): AppState {
   const categoryToBeRemoved = state.data.category.stringDict[args[0]]
   // replace all occurences of the category to 'other'
   for (let tag of state.data.tag.all) {
      // creates the category if it doesn't already exist
      if (state.data.category.index.indexOf('other') === -1) {
         state = executeCreateCategory(state, ['other'])
      }
      if (tag.category === categoryToBeRemoved) {
         tag.category = state.data.category.stringDict['other']
      }
   }
   // remove the unneeded category
   const index = state.data.category.all.indexOf(categoryToBeRemoved)
   state.data.category.all.splice(index, 1)
   delete state.data.category.numberDict[categoryToBeRemoved.index]
   for (let alias of categoryToBeRemoved.aliases) {
      delete state.data.category.stringDict[alias]
   }
   delete state.data.category.stringDict[categoryToBeRemoved.qualifiedName]
   state.terminal.messageQueue.push(new TM(`Category ${categoryToBeRemoved.name} removed.`, [1, SE.CATEGORY, 1]))
   return state
}