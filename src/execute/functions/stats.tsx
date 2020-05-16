import { AppState } from '../../classes/state'
import { FactCategory, Fact, FactValue, FactValues, FactValueEmphasis } from '../../classes/stats'
import { Tag } from '../../classes/dataCategory'
import { displayPercent } from '../../general/general'

export function executeShowGeneralStats(state: AppState, args: string[]): AppState {
  state.stats.show = true
  state.stats.type = 'general'
  state.stats.categories = []
  let categories: FactCategory[] = []

  let facts: Fact[] = []
  const totalImages = state.minions.all.length
  const imagesWithTags = state.minions.all.filter(e => e.tags.length !== 0).length
  const percentDone = displayPercent(imagesWithTags / totalImages, false)
  facts.push(new Fact('images tagged', [
    ...FactValues([imagesWithTags, totalImages - imagesWithTags, totalImages, percentDone]),
    new FactValue(percentDone, FactValueEmphasis.PROGRESS_BAR)
  ]))

  categories.push(new FactCategory(['Progress', 'done', 'todo', 'total', '%'], facts))

  let totalTags = 0
  let totalTaggedImages = 0
  state.minions.all.forEach(e => {
    totalTags += e.tags.length
    if (e.tags.length) { totalTaggedImages++ }
  })

  facts = []
  facts.push(new Fact('total tags applied', FactValues(totalTags)))
  facts.push(new Fact('average tags per image', FactValues(Math.round(totalTags * 100 / totalImages) / 100)))
  facts.push(new Fact('average tags per tagged image', FactValues(Math.round(totalTags * 100 / totalTaggedImages) / 100)))

  categories.push(new FactCategory('General', facts))
  state.stats.categories.push(new FactCategory('Overall statistics', categories))

  return state
}

export function executeShowTagStats(state: AppState, args: string[]): AppState {
  state.stats.show = true
  state.stats.type = 'tag'
  state.stats.categories = []
  let facts: Fact[] = []
  let categories: FactCategory[] = []

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
    facts = []
    let lengths: number[] = []
    let tags: [string, number][] = []
    for (let tag of categoryTags[index]) {
      const length = state.minions.all.filter(e => e.tags.some(el => el.data === tag)).length
      if (!lengths.includes(length)) { lengths.push(length) }
      tags.push([tag.name, length])
    }
    lengths = lengths.sort((a, b) => b - a)
    for (let length of lengths) {
      for (let tag of tags) {
        if (tag[1] === length) {
          const execute = `nf; f has tag ${tag[0]}; images`
          facts.push(new Fact(new FactValue(tag[0], FactValueEmphasis.NONE, execute), FactValues(tag[1])))
        }
      }
    }
    categories.push(new FactCategory(state.data.category.numberDict[index].name, facts))
  }
  state.stats.categories.push(new FactCategory('Tags\' occurrences', categories))

  return state
}

export function executeShowImages(state: AppState, args: string[]): AppState {
  state.stats.show = false
  state.showSave = false
  return state
}