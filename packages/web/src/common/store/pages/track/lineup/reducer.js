import { RESET_SUCCEEDED, stripPrefix } from 'common/store/lineup/actions'
import { initialLineupState } from 'common/store/lineup/reducer'
import { PREFIX } from 'common/store/pages/track/lineup/actions'

const initialState = {
  ...initialLineupState,
  prefix: PREFIX,
  maxEntries: 6
}

const actionsMap = {
  [RESET_SUCCEEDED](state, action) {
    const newState = initialState
    return newState
  }
}

const tracks = (state = initialState, action) => {
  const baseActionType = stripPrefix(PREFIX, action.type)
  const matchingReduceFunction = actionsMap[baseActionType]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}

export default tracks
