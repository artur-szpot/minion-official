import { Tag, Status } from "./dataCategory"
import { AppState } from './state'

export class AppStateMinionsParameters {
  showMany: boolean
  pageSize: number
  maxWidth: number
  initialCommand: string
  constructor(showMany: boolean, pageSize: number, maxWidth: number, initialCommand: string) {
    this.showMany = showMany
    this.pageSize = pageSize
    this.maxWidth = maxWidth
    this.initialCommand = initialCommand
  }
}

export class AppStateMinions {
  all: MinionData[]
  filtered: number[] = [] // which of the images are a current working set
  /** which of the filtered images are displayed */
  shown: number[] = []
  selected: number[] = [] // which of the filtered images are selected
  pageSize: number
  bigPageSize: number
  maxWidth: number
  last: MinionData | null = null

  constructor(minions: MinionData[], params: AppStateMinionsParameters) {
    this.all = minions
    this.bigPageSize = params.pageSize
    this.maxWidth = params.maxWidth
    this.pageSize = params.showMany ? this.bigPageSize : 1
    this.changeFiltered(null)
  }

  changeFiltered(newFiltered: number[] | null) {
    if (newFiltered === null) {
      this.filtered = this.all.map((_, i) => i)
      this.shown = [0]
      this.selected = []
      this.changeDisplay(false)
    } else {
      this.filtered = newFiltered
      this.shown = [0]
      this.selected = []
      this.changeDisplay(false)
    }
  }

  changePageSize(newValue: number) {
    this.bigPageSize = newValue
    this.changeDisplay(this.pageSize !== 1)
  }

  changeMaxWidth(newValue: number) {
    this.maxWidth = newValue
  }

  changeDisplay(doChange: boolean) {
    if (doChange) {
      if (this.pageSize === this.bigPageSize) {
        this.pageSize = 1
      } else {
        this.pageSize = this.bigPageSize
      }
    }
    if (this.pageSize === this.bigPageSize) {
      const currentPage = Math.floor(this.shown[0] / this.bigPageSize)
      this.shown = []
      this.selected = []
      for (let i = 0; i < this.pageSize; i++) {
        if (currentPage * this.bigPageSize + i < this.filtered.length) {
          this.shown.push(currentPage * this.bigPageSize + i)
        }
      }
    } else {
      if (this.filtered.length) {
        if (this.selected.length) {
          this.shown = [this.selected[0]]
        } else {
          this.shown = [this.shown[0]]
        }
      } else {
        this.shown = []
      }
      this.selected = this.shown
    }
  }

  /** Gets the MinionData of minions currently filtered. */
  get filteredData(): MinionData[] {
    return this.filtered.map(e => this.all[e])
  }

  /** Gets the MinionData of minions currently being displayed. */
  get shownData(): MinionData[] {
    return this.shown.map(e => this.all[this.filtered[e]])
  }

  /** Gets the MinionData of minions currently selected. */
  get selectedData(): MinionData[] {
    return this.selected.map(e => this.all[this.filtered[e]])
  }

  selectedInfo(state: AppState): MinionData | null {
    if (this.pageSize === 1) {
      return this.filtered.length ? this.shownData[0] : null
    } else if (this.selected.length === 1) {
      return this.selectedData[0]
    } else {
      // create an aggregate ImageData object with all the necessary info on the selection
      let retval = new MinionData()

      let tags: { [key: number]: number } = {}
      let allTags = new Set<Tag>()
      for (let minion of this.selectedData) {
        for (let tag of minion.tags) {
          if (!tags.hasOwnProperty(tag.data.index)) {
            tags[tag.data.index] = 0
          }
          tags[tag.data.index]++
          allTags.add(tag.data)
        }
      }
      for (let index in tags) {
        let tagToAdd = state.data.tag.numberDict[index]
        retval.tags.push(new Status<Tag>(tagToAdd, tags[index] !== this.selected.length))
      }

      return retval
    }
  }

  get showingInfo(): string[] {
    const pageNumber = this.shown[0] / this.pageSize + 1
    const totalPages = Math.ceil(this.filtered.length / this.pageSize)

    let max = -1
    let i = 1
    while (max === -1) { max = this.shown[this.shown.length - i++] }
    if (this.filtered.length) {
      if (max > this.shown[0]) {
        if (this.pageSize === 1 || !this.selected.length) {
          return [`Page ${pageNumber} of ${totalPages}`, `Images ${this.shown[0] + 1} to ${max + 1}`]
        } else {
          return [`Page ${pageNumber} of ${totalPages}`, `Images ${this.shown[0] + 1}-${max + 1}`, `${this.selected.length} selected`]
        }
      } else {
        return [`Image ${this.shown[0] + 1} of ${this.filtered.length}`]
      }
    } else {
      return ['No results found']
    }
  }

  isSelected(index: number) {
    return this.filtered.filter((_, i) => this.selected.includes(i)).map(e => this.all[e]).some(e => e.index === index)
  }
}

export class MinionData {
  index: number
  url: string
  tags: Status<Tag>[]
  comments: string[]
  isAggregated: boolean
  toBeDeleted: boolean = false

  constructor(index: number = -1, url: string = '', tags: Tag[] = [], comments: string[] = []) {
    this.index = index
    this.url = url
    this.tags = tags.map(e => new Status<Tag>(e))
    this.comments = comments
    this.isAggregated = index === -1
  }
}