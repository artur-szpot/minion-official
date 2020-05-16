import React from 'react'
import { AppState } from '../classes/state'
import { FactCategory, Fact, FactValue, FactValueEmphasis, AppStateStats } from '../classes/stats';
import { InfoPanelProps, InfoPanel } from './InfoPanel';
import { MinionData } from '../classes/minionData';
import { AppStateFileTypeEnum, AppStateFile } from '../classes/file';

export enum ImageDisplayContentEnum { IMAGES, STATS, SAVE }

export interface ImageDisplayButton {
   command: string
   icon: string
   disabled: boolean
   highlighted?: boolean
   file?: AppStateFile
}

export interface ImageDisplayProps {
   content: ImageDisplayContentEnum
   getState(): AppState
   stats?: AppStateStats
   shownData?: MinionData[]
   shown?: number[]
   isSelected?(index: number): boolean
   maxWidth?: number
   buttons: ImageDisplayButton[]
   download: Object | null
   changesSaved(): void
   handleExecute(input?: string, clear?: boolean): void
}

export class ImageDisplay extends React.Component<ImageDisplayProps> {
   anchors: { [key: string]: React.RefObject<HTMLUListElement> } = {}

   constructor(props: ImageDisplayProps) {
      super(props)
      this.handleAnchor = this.handleAnchor.bind(this)
   }

   handleAnchor(anchorIndex: string): void {
      this.anchors[anchorIndex].current?.scrollIntoView()
   }

   render() {
      switch (this.props.content) {
         case ImageDisplayContentEnum.STATS:
            return this.renderStats()
         case ImageDisplayContentEnum.SAVE:
            return this.renderSave()
         case ImageDisplayContentEnum.IMAGES:
         default:
            return this.renderImages()
      }
   }

   renderSave() {
      let save: string = 'TAGS\n'
      const state = this.props.getState()
      for (let tag of state.data.tag.all) {
         save += `${tag.index}, ${tag.name}`
         if (tag.aliases.length) {
            save += `, ${tag.aliases.join(', ')}`
         }
         save += '\n'
      }
      save += '\n\n\nMINIONS\n'
      for (let minion of state.minions.all) {
         save += `${minion.index}, ${minion.tags.map(e => e.data.index).join(', ')}\n`
      }
      return (<div className='mainPanel'>
         <textarea value={save} />
      </div>)
   }

   createFactValueSpan(e: FactValue): JSX.Element {
      switch (e.emphasis) {
         case FactValueEmphasis.NONE:
            if (e.labelExecuteStatement.length) {
               return <span onClick={() => this.props.handleExecute(e.labelExecuteStatement, false)} className='executable'>{e.value}</span>
            } else {
               return <span>{e.value}</span>
            }
         case FactValueEmphasis.HIGHLIGHTED:
         case FactValueEmphasis.GOOD:
         case FactValueEmphasis.BAD:
            if (e.labelExecuteStatement.length) {
               return <span onClick={() => this.props.handleExecute(e.labelExecuteStatement, false)} className={e.emphasis + ' executable'}>{e.value}</span>
            } else {
               return <span className={e.emphasis}>{e.value}</span>
            }
         case FactValueEmphasis.PROGRESS_BAR_INACTIVE:
            return <span className='bar outer inactive'></span>
         case FactValueEmphasis.PROGRESS_BAR:
            if (e.value === '100%') {
               return <span className='bar outer'><span className='bar inner done'></span></span>
            }
            return <span className='bar outer'><span className='bar inner wip' style={{ width: e.value }}></span></span>
         case FactValueEmphasis.NOT_APPLICABLE:
            return <span className={'tc ' + e.emphasis}><i className='fas fa-times'></i></span>
         default:
            if (e.labelExecuteStatement.length) {
               return <span onClick={() => this.props.handleExecute(e.labelExecuteStatement, false)} className={'tc ' + e.emphasis + ' executable'}>{e.value}</span>
            } else {
               return <span className={'tc ' + e.emphasis}>{e.value}</span>
            }
      }
   }

   renderStats() {
      this.anchors = {}
      let stats: JSX.Element[] = []
      let anchors: { [key: string]: string[] } = {}
      for (let category of this.props.stats!.categories) {
         this.anchors[category.name[0]] = React.createRef()
         let items: JSX.Element[] = []
         for (let fact of category.facts) {
            if (fact instanceof FactCategory) {
               let subItems: JSX.Element[] = []
               for (let subfact of fact.facts) {
                  subItems.push(<li>{this.createFactValueSpan((subfact as Fact).label)} {(subfact as Fact).values.map(e => this.createFactValueSpan(e))}</li>)
               }
               this.anchors[category.name[0] + '.' + fact.name[0]] = React.createRef()
               items.push(<li className='ul'><ul ref={this.anchors[category.name[0] + '.' + fact.name[0]]}> <li>{fact.name.map(e => <span className='header'>{e}</span>)}</li>{subItems}</ul></li>)
            } else {
               alert('This should not happen! All facts under category should be instances of FactCategory.')
               items.push(<li><span>{fact.label}</span> {fact.values.map(e => <span>{e}</span>)}</li>)
            }
         }
         stats.push(<ul ref={this.anchors[category.name[0]]}><li><span>{category.name[0]}</span></li>{items}</ul>)
         anchors[category.name[0]] = (category.facts as FactCategory[]).map(e => category.name[0] + '.' + (e as FactCategory).name[0])
      }

      const infoPanelProps: InfoPanelProps = {
         getState: this.props.getState,
         handleExecute: this.props.handleExecute,
         anchors: anchors,
         handleAnchor: this.handleAnchor
      }
      return (
         <div className='mainPanel'>
            {this.renderButtons()}
            <div className='paddedInside'>
               <div className='textPanel'>
                  {stats}
               </div>
            </div>
            <InfoPanel {...infoPanelProps} />
         </div>
      );
   }

   renderButtons() {
      let buttons: JSX.Element[] = this.props.buttons.map(e => {
         if (e.file === undefined) {
            return (
               <button className={e.highlighted ? 'high' : ''} onClick={() => this.props.handleExecute(e.command, false)} disabled={e.disabled}>
                  <i className={e.icon}></i>
               </button>
            )
         } else {
            let fileData: string
            let fileName: string
            switch (e.file.type) {
               case AppStateFileTypeEnum.DATA:
                  fileData = JSON.stringify(e.file.data)
                  fileName = 'data.json'
                  break
               case AppStateFileTypeEnum.IO_COPY:
               case AppStateFileTypeEnum.IO_MOVE:
                  fileData = e.file.data as string
                  fileName = 'io.py'
                  break
               default:
                  alert('Not prepared for this type of file!')
                  fileData = 'error'
                  fileName = 'error.txt'
                  break
            }
            const blob = new Blob([fileData], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            return <a download={fileName} href={url} onClick={this.props.changesSaved}><button><i className={e.icon}></i></button></a>
         }
      })
      return (
         <div className='buttons'>
            {buttons}
         </div>
      )
   }

   renderImages() {
      const shown = this.props.shownData!
      const shownIndices = this.props.shown!
      const maxWidth = this.props.maxWidth!
      let minions: JSX.Element[] = []
      if (shown.length === 1) {
         minions.push(<img src={'.\\img\\img\\' + shown[0].url} alt='Could not display this one for whatever reason.' />)
      } else {
         shown.forEach((e, i) => {
            if (e !== undefined) {

               let iconPanel: JSX.Element[] = []

               if (e.tags.some(el => el.data.aliases.includes('del'))) { iconPanel.push(<i className='fas fa-ban delete'></i>) }

               minions.push(
                  <div
                     style={{
                        maxWidth: maxWidth + 'px'
                     }}
                     className={this.props.isSelected!(e.index) ? 'selected' : ''}
                     onClick={() => this.props.handleExecute(`ss ${shownIndices[i]}`, false)}
                  >
                     <p className='id'>{`${shownIndices[i]} (${e.index})`}</p>
                     <div className='iconPanel'>{iconPanel}</div>
                     <img src={'.\\img\\img\\' + e.url} alt='Could not display this one for whatever reason.' />
                  </div>
               )
            }
         })
      }
      const infoPanelProps: InfoPanelProps = {
         getState: this.props.getState,
         handleExecute: this.props.handleExecute
      }
      return (
         <div className='mainPanel'>
            {this.renderButtons()}
            <div className='paddedInside'>
               {minions}
            </div>
            <InfoPanel {...infoPanelProps} />
         </div>
      );
   }
}



