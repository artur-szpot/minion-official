import data from './data.json'
import settings from './settings.json'
import { Category, Tag } from '../classes/dataCategory'
import { AppState } from '../classes/state'
import { MinionData, AppStateMinionsParameters } from '../classes/minionData'
import { AppStateData } from '../classes/dataCategory'

export function loadData(): [AppStateData, MinionData[], AppStateMinionsParameters] {
   let stateData = new AppStateData()
   data.tag_categories.forEach(e => stateData.category.add(new Category(e.index, e.name, e.aliases)))
   data.tags.forEach(e => stateData.tag.add(new Tag(e.index, stateData.category.numberDict[e.category], e.name, e.aliases)))

   let minions: MinionData[] = []
   data.image_data.forEach(e => {
      minions.push(new MinionData(
         e.id,
         e.url,
         e.tags.map(el => stateData.tag.numberDict[el]),
         e.comments
      ))
   })

   let params = new AppStateMinionsParameters(settings.show_many, settings.page_size, settings.width, settings.initial_command)

   return [stateData, minions, params]
}

export function outputData(state: AppState): Object {
   let retval: { [key: string]: Object[] } = {
      tag_categories: [],
      tags: [],
      image_data: []
   }
   for (let i in state.data.category.numberDict) {
      retval.tag_categories.push({
         index: +i,
         name: state.data.category.numberDict[i].name,
         aliases: state.data.category.numberDict[i].aliases
      })
   }
   for (let i in state.data.tag.numberDict) {
      retval.tags.push({
         index: +i,
         category: state.data.tag.numberDict[i].category.index,
         name: state.data.tag.numberDict[i].name,
         aliases: state.data.tag.numberDict[i].aliases
      })
   }
   state.minions.all
      .filter(e => !e.toBeDeleted)
      .forEach(e => retval.image_data.push({
         id: e.index,
         url: e.url,
         tags: e.tags.map(el => el.data.index),
         comments: e.comments
      }))
   return retval
}