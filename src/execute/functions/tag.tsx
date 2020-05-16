import { AppState } from '../../classes/state'
import { SyntaxElementEnum as SE } from '../../classes/syntax'
import { TerminalMessage as TM } from '../../classes/terminal'
import { findExistingAliases } from './alias'
import { Tag, Status } from '../../classes/dataCategory'

export function executeCreateTag(state: AppState, args: string[]): AppState {
   if (state.data.tag.index.includes(args[1])) {
      state.terminal.messageQueue.push(new TM(`Tag ${state.data.tag.stringDict[args[1]].fullName()} already exists.`, [1, SE.CATEGORY, SE.TAG, 2], true))
      return state
   }
   const aliases = findExistingAliases(state.data.tag.index, args.slice(2))
   if (aliases.existing.length) {
      state.terminal.messageQueue.push(new TM('These aliases already exist and won\'t be created: ' + aliases.existing.join(', '), [8, ...aliases.existing.map(e => SE.TAG)], true))
      if (!aliases.new.length) {
         return state
      }
   }
   const newTag = new Tag(-1, state.data.category.stringDict[args[0]], args[1], aliases.new)
   state.data.tag.add(newTag)
   state.terminal.messageQueue.push(new TM('New tag created: ' + newTag.fullName(), [3, SE.CATEGORY, SE.TAG]))
   return state
}

export function executeRenameTag(state: AppState, args: string[]): AppState {
   if (state.data.tag.index.includes(args[1])) {
      state.terminal.messageQueue.push(new TM('Tag name already taken: ' + args[1], [4, SE.TAG], true))
      return state
   }
   // grab the old version
   let tag = state.data.tag.stringDict[args[0]]
   const oldName = tag.name
   // remove stringDict reference
   delete state.data.tag.stringDict[tag.qualifiedName]
   // remove index reference
   let index = state.data.tag.index.indexOf(tag.qualifiedName)
   state.data.tag.index.splice(index, 1)
   // if includes _, remove also version without it
   if (tag.qualifiedName.includes('_')) {
      const name = tag.qualifiedName.replace(/_/g, '')
      // remove stringDict reference
      delete state.data.tag.stringDict[name]
      // remove index reference
      let index = state.data.tag.index.indexOf(name)
      state.data.tag.index.splice(index, 1)
   }
   // change the name in the object
   tag.name = args[1]
   tag.updateQualifiedName()
   // reinstate stringDict reference
   state.data.tag.stringDict[tag.qualifiedName] = tag
   // reinstate index reference
   state.data.tag.index.push(tag.qualifiedName)
   // if includes _, reinstate also version without it
   if (tag.qualifiedName.includes('_')) {
      const name = tag.qualifiedName.replace(/_/g, '')
      // reinstate stringDict reference
      state.data.tag.stringDict[name] = tag
      // reinstate index reference
      state.data.tag.index.push(name)
   }
   state.terminal.messageQueue.push(new TM(`Tag ${oldName} renamed to ${tag.name}.`, [1, SE.TAG, 2, SE.TAG]))
   return state
}

export function executeCombineTags(state: AppState, args: string[]): AppState {
   const tagToBeRemoved = state.data.tag.stringDict[args[1]]
   let tagToBecomeMaster = state.data.tag.stringDict[args[0]]
   if (tagToBeRemoved === tagToBecomeMaster) {
      state.terminal.messageQueue.push(new TM('A tag cannot be combined with itself.', [], true))
      return state
   }
   // replace all occurences of the tag
   for (let minion of state.minions.all) {
      if (minion.tags.some(e => e.data === tagToBeRemoved)) {
         const index = minion.tags.filter(e => e.data === tagToBeRemoved).map((_, i) => i)[0]
         minion.tags.splice(index, 1)
         if (!minion.tags.some(e => e.data === tagToBecomeMaster)) {
            minion.tags.push(new Status<Tag>(tagToBecomeMaster))
         }
      }
   }
   // copy aliases
   for (let alias of tagToBeRemoved.aliases) {
      tagToBecomeMaster.aliases.push(alias)
   }
   tagToBecomeMaster.aliases.push(tagToBeRemoved.qualifiedName)
   // remove the unneeded tag
   const index = state.data.tag.all.indexOf(tagToBeRemoved)
   state.data.tag.all.splice(index, 1)
   delete state.data.tag.numberDict[tagToBeRemoved.index]
   for (let alias of tagToBeRemoved.aliases) {
      state.data.tag.stringDict[alias] = tagToBecomeMaster
   }
   state.data.tag.stringDict[tagToBeRemoved.qualifiedName] = tagToBecomeMaster
   state.terminal.messageQueue.push(new TM(`Tag ${tagToBeRemoved.name} combined into ${tagToBecomeMaster.name}.`, [1, SE.TAG, 2, SE.TAG]))
   return state
}

export function executeChangeTagCategory(state: AppState, args: string[]): AppState {
   let tag = state.data.tag.stringDict[args[0]]
   const category = state.data.category.stringDict[args[1]]
   if (tag.category === category) {
      state.terminal.messageQueue.push(new TM(`Tag ${tag.name} already belongs to the category ${category.name}.`, [1, SE.TAG, 5, SE.CATEGORY], true))
      return state
   }
   tag.category = category
   state.terminal.messageQueue.push(new TM(`Tag ${tag.name} moved to category ${category.name}.`, [1, SE.TAG, 3, SE.CATEGORY]))
   return state
}

export function executeDeleteTag(state: AppState, args: string[]): AppState {
   const tagToBeRemoved = state.data.tag.stringDict[args[0]]
   // remove all occurences of the tag
   for (let j = 0; j < state.minions.all.length; j++) {
      let minion = state.minions.all[j]
      if (minion.tags.some(e => e.data.index === tagToBeRemoved.index)) {
         let index = minion.tags.indexOf(minion.tags.filter(e => e.data.index === tagToBeRemoved.index)[0])
         minion.tags.splice(index, 1)
      }
   }
   // remove the unneeded tag
   let index = state.data.tag.all.indexOf(tagToBeRemoved)
   state.data.tag.all.splice(index, 1)
   index = state.data.tag.index.indexOf(tagToBeRemoved.qualifiedName)
   state.data.tag.index.splice(index, 1)
   delete state.data.tag.numberDict[tagToBeRemoved.index]
   for (let alias of tagToBeRemoved.aliases) {
      delete state.data.tag.stringDict[alias]
      index = state.data.tag.index.indexOf(alias)
      state.data.tag.index.splice(index, 1)
   }
   delete state.data.tag.stringDict[tagToBeRemoved.qualifiedName]
   state.terminal.messageQueue.push(new TM(`Tag ${tagToBeRemoved.name} removed.`, [1, SE.TAG, 1]))
   return state
}


export function executeFindTag(state: AppState, args: string[]): AppState {
   const query = args[0]
   let retval = []
   for (let tag of state.data.tag.all) {
      if (tag.name.includes(query) || tag.aliases.filter(e => e.includes(query)).length) {
         retval.push(`${tag.name}${tag.aliases.length ? ` (${tag.aliases.join(', ')})` : ''}`)
      }
   }
   if (retval.length) {
      state.terminal.messageQueue.push(new TM(`Results found: ${retval.length}`))
      retval.forEach(e => state.terminal.messageQueue.push(new TM(e)))
      // state.terminal.messageQueue.push(new TM(retval.join(', ')))
   } else {
      state.terminal.messageQueue.push(new TM(`No results found.`))
   }
   return state
}

// ============================================================================================================================================
// apply tags

export function executeAddTags(state: AppState, args: string[]): AppState { return executeApplyTags(state, args, true) }
export function executeRemoveTags(state: AppState, args: string[]): AppState { return executeApplyTags(state, args, false) }

function executeApplyTags(state: AppState, tags: string[], add: boolean): AppState {
   const images = state.minions.selectedData
   if (!images.length) {
      state.terminal.messageQueue.push(new TM('You must select at least 1 image to use this command.', [], true))
      return state
   }
   let successful: Set<string> = new Set<string>()
   tags.forEach(e => {
      if (e === 'x') {
         if (state.minions.last !== null) {
            successful.add(e)
            return executeApplyTags(state, state.minions.last.tags.map(e => e.data.qualifiedName), true)
         }
      } else {
         const tag = state.data.tag.stringDict[e]
         for (let image of images) {
            let tagIndex = -1
            image.tags.forEach((e, i) => e.data === tag ? tagIndex = i : null)
            if (add && tagIndex === -1) {
               image.tags.push(new Status<Tag>(tag))
               successful.add(e)
            } else if (!add && tagIndex !== -1) {
               image.tags.splice(tagIndex, 1)
               successful.add(e)
            }
         }
      }
   })
   const failed = tags.filter(e => !successful.has(e)).map(e => state.data.tag.stringDict[e].name)
   if (successful.size) {
      let succeeded: string[] = []
      successful.forEach(e => e === 'x' ? null : succeeded.push(state.data.tag.stringDict[e].name))
      if (succeeded.length) { state.terminal.messageQueue.push(new TM(`Tags ${add ? 'added' : 'removed'}: ${succeeded.join(', ')}`, [2, ...succeeded.map(e => SE.TAG)])) }
   }
   if (failed.length) {
      state.terminal.messageQueue.push(new TM(`Tags ${add ? 'already' : 'not'} present: ${failed.join(', ')}`, [3, ...failed.map(e => SE.TAG)]))
   }
   return state
}

export function executeClearTags(state: AppState, args: string[]): AppState {
   const images = state.minions.selectedData
   if (!images.length) {
      state.terminal.messageQueue.push(new TM('You must select at least 1 image to use this command.', [], true))
      return state
   }
   let successful = false
   for (let image of images) {
      if(image.tags.length){successful=true}
      image.tags = []
   }
   if (successful) {
      state.terminal.messageQueue.push(new TM(`Removed all tags from ${images.length} image${images.length > 1 ? 's' : ''}.`))
   } else {
      state.terminal.messageQueue.push(new TM(`Found no tags to remove in selected image${images.length > 1 ? 's' : ''}.`, [], true))
   }
   return state
}