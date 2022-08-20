import { Status } from '@coliving/common'

import {
  FETCH_SEARCH_REQUESTED,
  FETCH_SEARCH_SUCCEEDED,
  FETCH_SEARCH_FAILED,
  CLEAR_SEARCH,
  SearchBarActions
} from 'components/search-bar/store/actions'
import { ActionsMap } from 'utils/reducer'

import SearchBarState from './types'

const initialState = {
  searchText: '',
  agreements: [],
  users: [],
  content lists: [],
  albums: [],
  status: Status.SUCCESS,
  disregardResponses: false
}

const actionsMap: ActionsMap<SearchBarState> = {
  [FETCH_SEARCH_REQUESTED](state, action) {
    return {
      ...state,
      status: Status.LOADING,
      disregardResponses: false
    }
  },
  [FETCH_SEARCH_SUCCEEDED](state, action) {
    const newState = { ...state }
    newState.status = Status.SUCCESS

    // We might have since deleted the text that
    // we originally queried for;
    if (state.disregardResponses) return { ...newState }

    if (action.results) {
      newState.searchText = action.searchText
      newState.agreements = action.results.agreements ? action.results.agreements : []
      newState.albums = action.results.albums ? action.results.albums : []
      newState.content lists = action.results.content lists
        ? action.results.content lists
        : []
      newState.users = action.results.users ? action.results.users : []
    }
    return newState
  },
  [FETCH_SEARCH_FAILED](state, action) {
    return { ...initialState }
  },
  [CLEAR_SEARCH](state, action) {
    return { ...initialState, disregardResponses: true }
  }
}

export default function search(state = initialState, action: SearchBarActions) {
  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}
