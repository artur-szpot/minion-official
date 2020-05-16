import { SyntaxElementEnum, Syntax } from "./syntax"
import { AppState } from "./state"

export class AppStateData {
  category: AppStateDataCategory<Category>
  tag: AppStateDataCategory<Tag>
  command: AppStateDataCategory<Command>
  constructor() {
    this.category = new AppStateDataCategory<Category>()
    this.tag = new AppStateDataCategory<Tag>()
    this.command = new AppStateDataCategory<Command>()
  }
}

export class AppStateDataCategory<T extends DataCategory> {
  all: T[] = []
  index: string[] = []
  numberDict: { [key: number]: T } = {}
  freeNumber: number = 0
  stringDict: { [key: string]: T } = {}

  add(newObject: T) {
    if (newObject.index === -1) {
      newObject.index = this.freeNumber
    }
    this.freeNumber = Math.max(newObject.index + 1, this.freeNumber)
    this.all.push(newObject)
    this.numberDict[newObject.index] = newObject
    this.index.push(newObject.qualifiedName)
    this.stringDict[newObject.qualifiedName] = newObject
    if (newObject.qualifiedName.includes('_')) {
      const name = newObject.qualifiedName.replace(/_/g, '')
      this.index.push(name)
      this.stringDict[name] = newObject
    }
    newObject.aliases.forEach(e => {
      let alias = e.toLowerCase()
      this.index.push(alias)
      this.stringDict[alias] = newObject
      if (alias.includes('_')) {
        alias = alias.replace(/_/g, '')
        this.index.push(alias)
        this.stringDict[alias] = newObject
      }
    })
  }

  addAliases(objectName: string, newAliases: string[]) {
    newAliases.forEach(e => {
      this.stringDict[objectName].aliases.push(e)
      this.index.push(e.toLowerCase())
      this.stringDict[e.toLowerCase()] = this.stringDict[objectName]
    })
  }
}

export class DataCategory {
  index: number
  name: string
  aliases: string[]
  qualifiedName: string = ''
  fullName(): string { return this.name }
  constructor(index: number, name: string, aliases: string[]) {
    this.index = index
    this.name = name
    this.aliases = aliases
    this.updateQualifiedName()
  }
  updateQualifiedName() {
    const specialCharactersRegExp = new RegExp('[^-_a-zA-Z0-9 ]', 'g')
    const spacesRegExp = new RegExp('[ ]', 'g')
      this.qualifiedName = this.name.replace(specialCharactersRegExp, '').replace(spacesRegExp, '_').toLowerCase()
  }
}

export class Status<T>{
  partial: boolean
  data: T
  constructor(data: T, partial: boolean = false) {
    this.data = data
    this.partial = partial
  }
}

export class Category extends DataCategory { }

export class Tag extends DataCategory {
  category: Category
  partial: boolean = false
  constructor(index: number, category: Category, name: string, aliases: string[]) {
    super(index, name, aliases)
    this.category = category
  }
  fullName() {
    return this.category.name + '.' + this.name
  }
}

export class Command extends DataCategory {
  executeFunction: (state: AppState, args: string[]) => AppState
  syntax: Syntax[]
  constructor(name: string, aliases: string[], executeFunction: (state: AppState, args: string[]) => AppState, syntax: Syntax[]) {
    super(-1, name, aliases)
    if (executeFunction === undefined) {
      alert('The function passed for command ' + name + ' is not defined!')
    }
    this.executeFunction = executeFunction
    this.syntax = syntax
  }

  get syntaxToDisplay(): [string, SyntaxElementEnum[]][] {
    return this.syntax.map(e => e.toDisplay())
  }
}