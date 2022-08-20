import { Collection, LineupState } from '@coliving/common'

import { RESET_SUCCEEDED, stripPrefix } from 'common/store/lineup/actions'
import { initialLineupState } from 'common/store/lineup/reducer'

import { PREFIX } from './actions'

export const initialState: LineupState<Collection> = {
  ...initialLineupState,
  prefix: PREFIX,
  // Trending is limited to 30 content lists
  // on the backend, so safe to cap it here
  maxEntries: 30
}

const actionsMap: { [key in string]: any } = {
  [RESET_SUCCEEDED](state: typeof initialState) {
    const newState = initialState
    return newState
  }
}

const content listsReducer = (state = initialState, action: { type: string }) => {
  const baseActionType = stripPrefix(PREFIX, action.type)
  const matchingReduceFunction = actionsMap[baseActionType]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}

export default content listsReducer
