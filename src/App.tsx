import React, { ChangeEvent, KeyboardEvent } from 'react'
import { AppState } from './classes/state'
import { Terminal, TerminalProps, TerminalLine } from './terminal/TerminalPanel'
import { ImageDisplay, ImageDisplayProps, ImageDisplayButton, ImageDisplayContentEnum } from './panels/ImageDisplay'
import execute from './execute/execute'
import loadCommands from './execute/load'
import { loadData, outputData } from './data/data'
import { validateChange, ChangeWrappingOption } from './general/general'
import { parseTerminalReplies } from './terminal/terminal'
import { MinionData } from './classes/minionData'
import { AppStateStats } from './classes/stats'
import { AppStateFileTypeEnum, AppStateFile } from './classes/file'

export class App extends React.Component<{}, AppState> {
  inputBox: React.RefObject<HTMLInputElement> = React.createRef()
  bumper: React.RefObject<HTMLParagraphElement> = React.createRef()

  // ==========================================================================================================================
  // #region constructor

  constructor(props: never) {
    super(props)
    this.handleInput = this.handleInput.bind(this)
    this.handleAction = this.handleAction.bind(this)
    this.focusTerminal = this.focusTerminal.bind(this)

    let [stateData, images, params] = loadData()
    stateData = loadCommands(stateData)
    this.state = execute(new AppState(stateData, images, params), params.initialCommand, true, true)
  }

  changesSaved() {
    let state = { ...this.state }
    state.file = new AppStateFile()
    this.setState(state)
    this.focusTerminal()
  }

  // #endregion
  // ==========================================================================================================================
  // #region handlers for actions

  handleInput(event: ChangeEvent): void {
    if (event.target !== null && event.target instanceof HTMLInputElement) {
      let state = { ...this.state }

      state.terminal.caret = -1
      state = execute(state, event.target.value.toLowerCase(), false, false)
      this.setState(state)
    }
  }

  handleAction(event: KeyboardEvent) {
    if (event.target !== null && event.target instanceof HTMLInputElement) {
      const input = this.state.terminal.input
      switch (event.keyCode) {
        case 13: // enter
          if (input.text.length) {
            this.handleExecute(input.text, true, false)
            this.bumper.current?.scrollIntoView()
          }
          break
        case 33: // page up
          this.handleExecute('prev', false, true)
          event.preventDefault()
          break
        case 34: // page down
          this.handleExecute('next', false, true)
          event.preventDefault()
          break
        case 38: // arrow up
          this.handleTerminalHistory(-1)
          event.preventDefault()
          break
        case 40: // arrow down
          this.handleTerminalHistory(1)
          event.preventDefault()
          break
        case 27: // escape
          this.handleExecute('', true, true)
          break
        case 9: // tab
          event.preventDefault()
          break
        case 192:
          this.handleExecute('input_toggle', false, true)
          event.preventDefault()
          break
        default:
          // uncomment to check keyCode for pressed key
          // alert(event.keyCode)
          break
      }
    }
  }

  handleTerminalHistory(change: number): void {
    if (!this.state.terminal.history.length) {
      return
    }
    let state = { ...this.state }
    if (state.terminal.caret === -1) {
      state.terminal.uncommitted = this.state.terminal.input.text
      state.terminal.caret = state.terminal.history.length
    }
    state.terminal.caret = validateChange(state.terminal.caret, change, 0, state.terminal.history.length, ChangeWrappingOption.STOP_IF_WRAP)
    if (state.terminal.caret === state.terminal.history.length) {
      state = execute(state, state.terminal.uncommitted, false, false)
    } else {
      state = execute(state, state.terminal.history[state.terminal.caret], false, false)
    }
    this.setState(state)
  }

  handleExecute(input: string = '', clear: boolean = true, overrideMode: boolean): void {
    let state: AppState = { ...this.state }
    if (input.length) {
      if (clear) {
        state.terminal.output.push(state.terminal.input)
      }
      state = parseTerminalReplies(execute(state, input, true, overrideMode))
      state.terminal.caret = -1
    }
    if (clear) {
      if (input.length && state.terminal.history[state.terminal.history.length - 1] !== input) {
        state.terminal.history.push(input)
        if (state.terminal.history.length === 30) {
          state.terminal.history.splice(0, 10)
        }
      }
      state.terminal.input = new TerminalLine('', [], true)
    } else {
      this.focusTerminal()
    }
    this.setState(state)
  }

  focusTerminal() {
    this.inputBox.current?.focus()
  }

  // #endregion
  // ==========================================================================================================================
  // #region render

  render() {
    // prepare terminal

    const inputBox = <input type='text' ref={this.inputBox} autoFocus={true} spellCheck={false} onChange={this.handleInput} onKeyDown={this.handleAction} value={this.state.terminal.input.text} className={this.state.terminal.tagInput ? 'tag' : 'command'} />
    const bumper = <p className='bumper' ref={this.bumper}></p>

    const terminalProps: TerminalProps = {
      appState: this.state,
      inputBox: inputBox,
      bumper: bumper,
    }

    // prepare image display

    let buttons: ImageDisplayButton[] = []
    buttons.push({
      command: 'zoom',
      disabled: false,
      icon: `fas fa-search-${this.state.minions.pageSize !== 1 ? 'plus' : 'minus'}`
    })
    let disabled: boolean = !this.state.showSave && !this.state.stats.show
    buttons.push({
      command: 'images',
      icon: `fas fa-images`,
      disabled: disabled,
      highlighted: disabled
    })
    disabled = this.state.stats.show && this.state.stats.type === 'general'
    buttons.push({
      command: 'general_stats',
      icon: `fas fa-chart-bar`,
      disabled: disabled,
      highlighted: disabled
    })
    disabled = this.state.stats.show && this.state.stats.type === 'tag'
    buttons.push({
      command: 'tag_stats',
      icon: `fas fa-tags`,
      disabled: disabled,
      highlighted: disabled
    })
    buttons.push({
      command: 'prev',
      disabled: this.state.minions.shown.includes(0),
      icon: `fas fa-backward`
    })
    buttons.push({
      command: 'next',
      disabled: this.state.minions.shown.includes(this.state.minions.filtered.length - 1),
      icon: `fas fa-forward`
    })
    if (this.state.file.type !== AppStateFileTypeEnum.NONE) {
      buttons.push({
        command: 'prepare_save',
        disabled: true,
        icon: `fas fa-save`,
        highlighted: this.state.file.type === AppStateFileTypeEnum.DATA
      })
      buttons.push({
        command: 'io_copy',
        disabled: true,
        icon: `fas fa-copy`,
        highlighted: this.state.file.type === AppStateFileTypeEnum.IO_COPY
      })
      buttons.push({
        command: 'io_move',
        disabled: true,
        icon: `fas fa-file-excel`,
        highlighted: this.state.file.type === AppStateFileTypeEnum.IO_MOVE
      })
      buttons.push({
        command: '',
        disabled: false,
        icon: `fas fa-file-download`,
        file: this.state.file
      })
    } else {
      buttons.push({
        command: 'prepare_save',
        disabled: false,
        icon: `fas fa-save`
      })
      buttons.push({
        command: 'io_copy',
        disabled: false,
        icon: `fas fa-copy`
      })
      buttons.push({
        command: 'io_move',
        disabled: false,
        icon: `fas fa-file-excel`
      })
      buttons.push({
        command: '',
        disabled: true,
        icon: `fas fa-file-download`
      })
    }

    let content: ImageDisplayContentEnum
    let stats: AppStateStats | undefined = undefined
    let shownData: MinionData[] | undefined = undefined
    let shown: number[] | undefined = undefined
    let isSelected: ((index: number) => boolean) | undefined = undefined
    let maxWidth: number | undefined = undefined

    if (this.state.showSave) {
      content = ImageDisplayContentEnum.SAVE
    } else if (this.state.stats.show) {
      content = ImageDisplayContentEnum.STATS
      stats = this.state.stats
    } else {
      content = ImageDisplayContentEnum.IMAGES
      shownData = this.state.minions.shownData
      shown = this.state.minions.shown
      maxWidth = this.state.minions.maxWidth
      isSelected = (index: number) => this.state.minions.isSelected(index)
    }

    const imageDisplayProps: ImageDisplayProps = {
      content: content,
      stats: stats,
      shownData: shownData,
      shown: shown,
      isSelected: isSelected,
      maxWidth: maxWidth,
      buttons: buttons,
      download: outputData(this.state),
      changesSaved: () => this.changesSaved(),
      handleExecute: (input: string = '', clear: boolean = true) => this.handleExecute(input, clear, true),
      getState: () => this.state
    }

    return (
      <>
        <div className='container' onClick={this.focusTerminal}>
          <ImageDisplay {...imageDisplayProps} />
          <Terminal {...terminalProps} />
        </div>
      </>
    );
  }

  // #endregion
  // ==========================================================================================================================
}

export default App