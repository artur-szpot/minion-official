import { AppState } from '../../classes/state'
import { TerminalMessage as TM } from '../../classes/terminal'
import { SyntaxElementEnum as SE } from '../../classes/syntax'
import { DataCategory, Tag } from '../../classes/dataCategory'
import { FilterParameterSpecial, FilterParameter, FilterMethod, FilterType } from '../../classes/filter'
import { MinionData } from '../../classes/minionData'
import { arrayEquals, randomFromArray } from '../../general/general'
import execute from '../execute'

function getFilterMethod(method: string): FilterMethod {
   switch (method) {
      case 'has': return FilterMethod.YES
      case 'no': return FilterMethod.NO
      case 'any': return FilterMethod.ANY
      default:
         alert('Wrong parameter for filter method!')
         return FilterMethod.YES
   }
}

export function executeApplyFilter(state: AppState, args: string[]): AppState { return applyFilter(state, getFilterMethod(args[0]), args[1] as SE, args.slice(2), true) }
export function executeReapplyFilter(state: AppState, args: string[]): AppState { return reapplyFilter(state) }
export function executeRemoveFilter(state: AppState, args: string[]): AppState { return applyFilter(state, getFilterMethod(args[0]), args[1] as SE, args.slice(2), false) }

export function executeApplyShortSpecialFilter(state: AppState, args: string[]): AppState { return applyFilter(state, FilterMethod.YES, SE.FILTER_CONDITION_SPECIAL, args, true) }
export function executeRemoveShortSpecialFilter(state: AppState, args: string[]): AppState { return applyFilter(state, FilterMethod.YES, SE.FILTER_CONDITION_SPECIAL, args, false) }

export function executeClearFilter(state: AppState, args: string[]): AppState {
   state.filters = []
   state.terminal.messageQueue.push(new TM('All filters removed.'))
   return filterMinions(state)
}

function filterIndex(state: AppState, param: FilterParameter): number {
   for (let filter of state.filters) {
      if (filter.type === param.type && filter.method === param.method && arrayEquals(filter.data, param.data)) {
         return state.filters.indexOf(filter)
      }
   }
   return -1
}

function applyFilterSingle(state: AppState, add: boolean, newParam: FilterParameter): [AppState, boolean] {
   const index = filterIndex(state, newParam)
   if (add && index === -1) {
      state.filters.push(newParam)
      return [state, true]
   } else if (!add && index !== -1) {
      state.filters.splice(index, 1)
      return [state, true]
   }
   return [state, false]
}

function applyFilter(state: AppState, method: FilterMethod, type: SE, args: string[], add: boolean) {
   let filterChanged = false

   let filterType: FilterType
   let param: (value: string) => DataCategory | string | FilterParameterSpecial
   switch (type) {
      case SE.TAG:
         filterType = FilterType.TAG
         param = (value: string) => state.data[type]!.stringDict[value] as Tag
         break
      case SE.FILTER_CONDITION_SPECIAL:
      default:
         filterType = FilterType.SPECIAL
         param = (value: string) => value as FilterParameterSpecial
         break
   }

   if (method === FilterMethod.ANY) {
      let newParam
      newParam = new FilterParameter(filterType, method, args.map(e => param!(e)))
      const [newState, isFilterChanged] = applyFilterSingle(state, add, newParam)
      state = newState
      if (isFilterChanged) { filterChanged = true }
   } else {
      for (let arg of args) {
         let newParam
         newParam = new FilterParameter(filterType, method, [param!(arg)])
         const [newState, isFilterChanged] = applyFilterSingle(state, add, newParam)
         state = newState
         if (isFilterChanged) { filterChanged = true }
      }
   }

   if (!filterChanged) {
      state.terminal.messageQueue.push(new TM('No changes to the existing filter.', [], true))
      return state
   }

   state.terminal.messageQueue.push(new TM('Filter applied.'))
   return filterMinions(state)
}

function reapplyFilter(state: AppState): AppState {
   state.terminal.messageQueue.push(new TM('Filter reapplied.'))
   return filterMinions(state)
}

function filterMinions(state: AppState): AppState {
   let newFiltered: number[] = []
   for (let i = 0; i < state.minions.all.length; i++) {
      if (checkFilter(state.minions.all[i], state.filters)) {
         newFiltered.push(i)
      }
   }
   state.minions.changeFiltered(newFiltered)
   return state
}

function checkFilter(data: MinionData, filters: FilterParameter[]): boolean {
   for (let filter of filters) {
      if (filter.method === FilterMethod.ANY) {
         const params = filter.data
         switch (filter.type) {
            case FilterType.TAG:
               if (!data.tags.some(e => params.includes(e.data))) { return false }
               break
            case FilterType.SPECIAL:
            default:
               let ok = false
               for (let param of params) {
                  switch (param as FilterParameterSpecial) {
                     case FilterParameterSpecial.NO_TAG:
                        if (!data.tags.length) { ok = true }
                        break
                     case FilterParameterSpecial.HAS_COMMENT:
                        if (data.comments.length) { ok = true }
                        break
                     default:
                        break
                  }
               }
               if (!ok) { return false }
               break
         }
      } else {
         const has = filter.method === FilterMethod.YES
         const param = filter.data[0]
         switch (filter.type) {
            case FilterType.TAG:
               if (data.tags.some(e => e.data === param) !== has) { return false }
               break
            case FilterType.SPECIAL:
               switch (param as FilterParameterSpecial) {
                  case FilterParameterSpecial.NO_TAG:
                     if (data.tags.length) { return false }
                     break
                  case FilterParameterSpecial.HAS_COMMENT:
                     if (!data.comments.length) { return false }
                     break
                  default:
                     break
               }
               break
         }
      }
   }
   return true
}

export function executeTotalRandomTagging(state: AppState): AppState {
   state = execute(state, 'nf; sf notag', true, true)
   state.minions.filtered = randomFromArray(state.minions.filtered, state.minions.filtered.length)
   return execute(state, `images; ds; s 0${state.minions.pageSize === 1 ? '' : '; zoom'}`, true, true)
}