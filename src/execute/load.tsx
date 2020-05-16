import { SyntaxElementEnum as SE, Syntax, SyntaxElementEnum } from '../classes/syntax'
import { executeNext, executePrev, executeZoom, executeMaxWidthChange, executePageSizeChange, executeGotoPage, executeToggleInputMode } from './functions/displayChange'
import { executeToggleSave, executePrepareSave } from './functions/save'
import { executePrepareIOCopy, executePrepareIOMove, executeMarkForDeletion } from './functions/io'
import { executeAddComment, executeRemoveComment } from './functions/comment'
import { executeCreateTag, executeRenameTag, executeCombineTags, executeChangeTagCategory, executeDeleteTag, executeAddTags, executeRemoveTags, executeFindTag, executeClearTags } from './functions/tag'
import { executeCreateCategory, executeRenameCategory, executeCombineCategories, executeRemoveCategory } from './functions/category'
import { executeCreateAlias, executeListAliases } from './functions/alias'
import { executeSelectImage, executeDeselectImage, executeSuperSelectImage, executeSelectImageRange, executeDeselectImageRange, executeSuperSelectImageRange } from './functions/selectImages'
import { executeApplyFilter, executeRemoveFilter, executeClearFilter, executeReapplyFilter, executeApplyShortSpecialFilter, executeRemoveShortSpecialFilter, executeTotalRandomTagging } from './functions/filter'
import { executeShowGeneralStats, executeShowImages, executeShowTagStats } from './functions/stats'
import { Command, AppStateData } from '../classes/dataCategory'
import { executeInfoFreeIndex } from './functions/info'
import { AppState } from '../classes/state'

function createNewCommand(stateData: AppStateData, name: string, aliases: string[],
   executeFunction: (state: AppState, args: string[]) => AppState,
   elements1: (SyntaxElementEnum | SyntaxElementEnum[])[] = [], unlimited1: SyntaxElementEnum | null = null,
   elements2: (SyntaxElementEnum | SyntaxElementEnum[])[] = [], unlimited2: SyntaxElementEnum | null = null,
   elements3: (SyntaxElementEnum | SyntaxElementEnum[])[] = [], unlimited3: SyntaxElementEnum | null = null): AppStateData {
   let syntax: Syntax[] = []
   if (elements1.length || unlimited1 !== null) { syntax.push(new Syntax(elements1, unlimited1)) }
   if (elements2.length || unlimited2 !== null) { syntax.push(new Syntax(elements2, unlimited2)) }
   if (elements3.length || unlimited3 !== null) { syntax.push(new Syntax(elements3, unlimited3)) }
   stateData.command.add(new Command(name, aliases, executeFunction, syntax))
   return stateData
}

export default function loadCommands(data: AppStateData): AppStateData {
   const add = (name: string, aliases: string[], executeFunction: (state: AppState, args: string[]) => AppState,
      elements1: (SyntaxElementEnum | SyntaxElementEnum[])[] = [], unlimited1: SyntaxElementEnum | null = null,
      elements2: (SyntaxElementEnum | SyntaxElementEnum[])[] = [], unlimited2: SyntaxElementEnum | null = null,
      elements3: (SyntaxElementEnum | SyntaxElementEnum[])[] = [], unlimited3: SyntaxElementEnum | null = null) =>
      data = createNewCommand(data, name, aliases, executeFunction, elements1, unlimited1, elements2, unlimited2, elements3, unlimited3)

   // manipulate the display
   add('next', [], executeNext)
   add('prev', [], executePrev)
   add('page_size', ['ps'], executePageSizeChange, [SE.NUMBER])
   add('max_width', ['mw'], executeMaxWidthChange, [SE.NUMBER])
   add('zoom', [], executeZoom)
   add('page', ['p'], executeGotoPage, [SE.NUMBER])
   add('images', ['i'], executeShowImages)

   // terminal control
   add('input_toggle', [], executeToggleInputMode)

   // memory under control
   add('save', [], executeToggleSave)
   add('prepare_save', [], executePrepareSave)
   add('io_move', [], executePrepareIOMove)
   add('io_copy', [], executePrepareIOCopy)
   add('delete', [], executeMarkForDeletion)

   // change selection
   add('select', ['s'], executeSelectImage, [], SE.NUMBER)
   add('deselect', ['ds'], executeDeselectImage, [], SE.NUMBER)
   add('super_select', ['ss'], executeSuperSelectImage, [], SE.NUMBER)
   add('select_range', ['sr'], executeSelectImageRange, [SE.NUMBER, SE.NUMBER])
   add('deselect_range', ['dsr'], executeDeselectImageRange, [SE.NUMBER, SE.NUMBER])
   add('super_select_range', ['ssr'], executeSuperSelectImageRange, [SE.NUMBER, SE.NUMBER])

   // edit the minion(s) selected
   // tag
   add('add', [], executeAddTags, [SE.TAG], SE.TAG)
   add('remove', ['rm'], executeRemoveTags, [SE.TAG], SE.TAG)
   add('clear_tags', ['notag'], executeClearTags)
   // comment
   add('comment', ['x'], executeAddComment, [SE.ANYTHING], SE.ANYTHING)
   add('remove_comment', ['-comment', '-x'], executeRemoveComment, [SE.NUMBER])

   // info
   add('aliases', ['as'], executeListAliases, [SE.DATA_TYPE, SE.OF_TYPE])
   add('free_index', ['fi', 'free'], executeInfoFreeIndex)

   // dataCategory manipulation
   add('category', ['cat'], executeCreateCategory, [SE.ANYTHING], SE.ANYTHING)
   add('rename_category', ['rc'], executeRenameCategory, [SE.CATEGORY, SE.ANYTHING])
   add('combine_categories', ['cc'], executeCombineCategories, [SE.CATEGORY, SE.CATEGORY])
   add('remove_category', ['rmc'], executeRemoveCategory, [SE.CATEGORY])
   add('tag', ['t'], executeCreateTag, [SE.CATEGORY, SE.ANYTHING], SE.ANYTHING)
   add('rename_tag', ['rt'], executeRenameTag, [SE.TAG, SE.ANYTHING])
   add('combine_tags', ['ct'], executeCombineTags, [SE.TAG, SE.TAG])
   add('change_tag_category', ['ctc'], executeChangeTagCategory, [SE.TAG, SE.CATEGORY])
   add('remove_tag', ['rmt'], executeDeleteTag, [SE.TAG])
   add('find_tag', ['ft'], executeFindTag, [SE.ANYTHING])
   add('alias', ['a'], executeCreateAlias, [SE.DATA_TYPE, SE.OF_TYPE, SE.ANYTHING], SE.ANYTHING)

   // filter results
   add('filter', ['f'], executeApplyFilter, [SE.FILTER_CONDITION, SE.FILTER_TYPE, SE.OF_TYPE], SE.OF_TYPE)
   add('special_filter', ['sf'], executeApplyShortSpecialFilter, [SE.FILTER_CONDITION_SPECIAL], SE.FILTER_CONDITION_SPECIAL)
   add('remove_special_filter', ['-sf'], executeRemoveShortSpecialFilter, [SE.FILTER_CONDITION_SPECIAL])
   add('refilter', ['ff'], executeReapplyFilter)
   add('remove_filter', ['-filter', '-f'], executeRemoveFilter, [SE.FILTER_CONDITION, SE.FILTER_TYPE, SE.OF_TYPE], SE.OF_TYPE)
   add('clear_filter', ['nofilter', 'nf', 'cf'], executeClearFilter)
   add('total_random_tagging', ['trt'], executeTotalRandomTagging)

   // stats
   add('general_stats', [], executeShowGeneralStats)
   add('tag_stats', [], executeShowTagStats)

   // check configuration validity
   for (let commandA of data.command.all) {
      for (let commandB of data.command.all) {
         if (commandA !== commandB) {
            if (commandB.name === commandA.name) {
               alert(`Command name repeated: ${commandA.name}`)
            }
            for (let aliasA of commandA.aliases) {
               if (commandB.name === aliasA) {
                  alert(`Command name repeated as another's alias: ${aliasA} (in ${commandA.name} and ${commandB.name})`)
               }
               for (let aliasB of commandB.aliases) {
                  if (aliasA === aliasB) {
                     alert(`Command alias repeated: ${aliasA} (in ${commandA.name} and ${commandB.name})`)
                  }
               }
            }
         }
      }
   }

   return data
}