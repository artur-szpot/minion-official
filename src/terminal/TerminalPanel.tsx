import React from 'react'
import { SyntaxElementEnum } from '../classes/syntax'
import { AppState } from '../classes/state'

export class TerminalColor {
   dataType: SyntaxElementEnum
   value: string
   spaceAfter: boolean
   constructor(dataType: SyntaxElementEnum, value: string, spaceAfter: boolean) {
      this.dataType = dataType
      this.value = value
      this.spaceAfter = spaceAfter
   }
}

export class TerminalLine {
   text: string
   words: TerminalColor[]
   command: boolean
   constructor(text: string, words: TerminalColor[], command: boolean) {
      this.text = text
      this.words = words
      this.command = command
   }
}

export interface TerminalProps {
   appState: AppState
   inputBox: JSX.Element
   bumper: JSX.Element
}

export class Terminal extends React.Component<TerminalProps> {
 
   renderTerminalLine(line: TerminalLine, input: boolean = false): JSX.Element {
      let words: JSX.Element[] = []
      let lineClass = ''
      let spanClass = ''
      if (!input && line.command) {
         lineClass = 'command'
         words.push(<span>&gt;&nbsp;</span>)
      } else if (input) {
         lineClass = 'input'
         spanClass = ' input'
      } else {
         words.push(<span className='ninja'>&gt;</span>)
      }
      for (let word of line.words) {
         if (word.spaceAfter) {
            words.push(<span className={word.dataType + spanClass}>{word.value}&nbsp;</span>)
         } else {
            words.push(<span className={word.dataType + spanClass}>{word.value}</span>)
         }
      }
      return <div className={lineClass}>{words}</div>
   }

   render() {
      const input = this.props.appState.terminal.input
      const output = this.props.appState.terminal.output
      let outputJSX: JSX.Element[] = output.map(e => this.renderTerminalLine(e))
      outputJSX.push(this.props.bumper)

      return (
         <div className='terminal'>
            <div className='paddedInside'>
            {outputJSX}
            {this.props.inputBox}
            {this.renderTerminalLine(input, true)}
            </div>
         </div>
      );
   }
}