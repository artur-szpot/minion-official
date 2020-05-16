import React from 'react'
import { Tag } from '../classes/dataCategory'
import { FilterParameterSpecial, FilterMethod, FilterType } from '../classes/filter'
import { AppState } from '../classes/state'

export interface InfoPanelProps {
   getState(): AppState
   handleExecute(input?: string, clear?: boolean): void
   anchors?: { [key: string]: string[] }
   handleAnchor?(anchorIndex: string): void
}

export class InfoPanel extends React.Component<InfoPanelProps> {
   render() {
      if (this.props.anchors !== undefined) {
         return this.renderStats()
      } else {
         return this.renderImage()
      }
   }

   renderStats() {
      let anchorLists: JSX.Element[] = []
      for (let category in this.props.anchors!) {
         anchorLists.push(
            <ul>
               <li><span className='executable' onClick={() => this.props.handleAnchor!(category)} >{category}</span></li>
               {this.props.anchors![category].map(e => <li><span className='executable' onClick={() => this.props.handleAnchor!(e)} >{e.split('.')[1]}</span></li>)}
            </ul>
         )
      }
      return (
         <div className='info'>
            {anchorLists}
         </div>
      )
   }

   renderFilterLines(state: AppState, type: FilterType, method: FilterMethod): [JSX.Element[], JSX.Element | null] {
      let retval: JSX.Element[] = []
      let anyList: string[] = []
      for (let filter of state.filters) {
         if (filter.method === method && filter.type === type) {
            for (let data of filter.data) {
               let name: string
               let removeCommand: string
               switch (type) {
                  case FilterType.TAG:
                     name = (data as Tag).name
                     removeCommand = `-filter ${method === FilterMethod.YES ? 'has' : 'no'} tag ${name}`
                     anyList.push(name)
                     break
                  default:
                  case FilterType.SPECIAL:
                     removeCommand = `-filter ${method === FilterMethod.YES ? 'has' : 'no'} special ${data}`
                     anyList.push(data as string)
                     switch (data) {
                        case FilterParameterSpecial.NO_TAG:
                           name = 'have no tags'
                           break
                        case FilterParameterSpecial.HAS_COMMENT:
                           name = 'have comment(s)'
                           break
                        default:
                           name = ''
                           break
                     }
                     break
               }
               let button = null
               if (method !== FilterMethod.ANY) {
                  button = (
                     <button onClick={() => this.props.handleExecute(removeCommand, false)} className='delete'>
                        <i className='fas fa-window-close'></i>
                     </button>
                  )
               }
               retval.push(
                  <li>
                     <span>{name}</span>
                     {button}
                  </li>
               )
            }
         }
      }
      if (method === FilterMethod.ANY) {
         let removeCommand: string
         switch (type) {
            case FilterType.TAG:
               removeCommand = `-filter any tag ${anyList.join(' ')}`
               break
            default:
            case FilterType.SPECIAL:
               removeCommand = `-filter any special ${anyList.join(' ')}`
               break
         }
         const button = (
            <button onClick={() => this.props.handleExecute(removeCommand, false)} className='delete'>
               <i className='fas fa-window-close'></i>
            </button>
         )
         return [retval, button]
      }
      return [retval, null]
   }

   renderImage() {
      // ======================================================================================
      // #region initialization

      const state = this.props.getState()
      const images = state.minions
      const minion = images.selectedInfo(state)

      if (minion === null) {
         return (
            <div className='info'>
               {images.showingInfo.map(e => <p>{e}</p>)}
            </div>
         )
      }

      // #endregion
      // ======================================================================================
      // #region tags

      let tags: JSX.Element[] = []
      let categoryTags: { [key: number]: Tag[] } = {}

      for (let index in state.data.tag.numberDict) {
         const tag = state.data.tag.numberDict[index]
         const catIndex = tag.category.index
         if (!categoryTags.hasOwnProperty(catIndex)) {
            categoryTags[catIndex] = []
         }
         categoryTags[catIndex].push(tag)
      }

      for (let index in categoryTags) {
         let items: JSX.Element[] = []
         for (let tag of categoryTags[index]) {
            let removeCommand = 'rm ' + tag.name
            let addCommand = 'add ' + tag.name
            const foundTag = minion.tags.filter(e => e.data === tag)
            if (foundTag.length) {
               if (!foundTag[0].partial) {
                  items.push(
                     <li>
                        <span>{tag.name}</span>
                        <button onClick={() => this.props.handleExecute(removeCommand, false)} className='delete'>
                           <i className='fas fa-window-close'></i>
                        </button>
                        <button onClick={() => this.props.handleExecute(`f has tag ${tag.qualifiedName}`, false)} className='filter'>
                           <i className='fas fa-filter'></i>
                        </button>
                     </li>
                  )
               } else {
                  items.push(
                     <li className='partial'>
                        <span>{tag.name}</span>
                        <button onClick={() => this.props.handleExecute(removeCommand, false)} className='delete'>
                           <i className='fas fa-window-close'></i>
                        </button>
                        <button onClick={() => this.props.handleExecute(addCommand, false)} className='equalize'>
                           <i className='fas fa-check-square'></i>
                        </button>
                        <button onClick={() => this.props.handleExecute(`f has tag ${tag.qualifiedName}`, false)} className='filter'>
                           <i className='fas fa-filter'></i>
                        </button>
                     </li>
                  )
               }
            }
         }
         if (items.length) {
            tags.push(
               <ul>
                  <li><span>{state.data.category.numberDict[index].name}</span></li>
                  {items}
               </ul>
            )
         }
      }

      // #endregion
      // ======================================================================================
      // #region comments

      let comments: JSX.Element[] = []
      for (let i = 0; i < minion.comments.length; i++) {
         comments.push(<div>{`[${i}]: ${minion.comments[i]}`}</div>)
      }

      // #endregion
      // ======================================================================================
      // #region filter

      let filter: JSX.Element[] = []

      for (let type of [FilterType.TAG, FilterType.SPECIAL]) {
         for (let method of [FilterMethod.YES, FilterMethod.NO, FilterMethod.ANY]) {
            const [items, button] = this.renderFilterLines(state, type, method)
            if (items.length) {
               const plural = items.length > 1 ? 's' : ''
               let description: string
               switch (type) {
                  case FilterType.TAG:
                     switch (method) {
                        case FilterMethod.YES:
                           description = `Must have tag${plural}:`
                           break
                        case FilterMethod.NO:
                           description = `Must not have tag${plural}:`
                           break
                        case FilterMethod.ANY:
                           description = `Must have any of these tags:`
                           break
                     }
                     break
                  case FilterType.SPECIAL:
                     switch (method) {
                        case FilterMethod.YES:
                           description = `Must meet the following condition${plural}:`
                           break
                        case FilterMethod.NO:
                           description = `Must not meet the following condition${plural}:`
                           break
                        case FilterMethod.ANY:
                           description = `Must meet any of the following conditions:`
                           break
                     }
                     break
               }
               filter.push(<li><ul><li>{description}{button}</li>{items}</ul></li>)
            }
         }
      }

      // ===================================== finish
      if (filter.length) {
         filter = [<ul><li>Filter: {state.minions.filtered.length} of {state.minions.all.length}</li>{filter}</ul>]
      } else {
         filter = [<ul><li>No filter - all {state.minions.all.length}</li>{filter}</ul>]
      }

      // #endregion
      // ======================================================================================
      // #region finalize

      return (
         <div className='info'>
            {images.showingInfo.map(e => <p>{e}</p>)}
            {tags}
            {comments}
            <hr />
            {filter}
         </div>
      )

      // #endregion
      // ======================================================================================
   }
}