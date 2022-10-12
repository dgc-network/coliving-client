import { Status } from '@coliving/common'

import { asLineup } from 'common/store/lineup/reducer'
import {
  FETCH_SEARCH_PAGE_RESULTS,
  FETCH_SEARCH_PAGE_RESULTS_SUCCEEDED,
  FETCH_SEARCH_PAGE_RESULTS_FAILED,
  SearchPageActions,
  FETCH_SEARCH_PAGE_TAGS,
  FETCH_SEARCH_PAGE_TAGS_SUCCEEDED,
  FETCH_SEARCH_PAGE_TAGS_FAILED,
  FetchSearchPageResultsFailedAction,
  FetchSearchPageResultsSuceededAction,
  FetchSearchPageTagsAction,
  FetchSearchPageTagsSucceededAction,
  FetchSearchPageTagsFailedAction
} from 'common/store/pages/searchResults/actions'
import { PREFIX } from 'common/store/pages/searchResults/lineup/digital_contents/actions'
import digitalContentsReducer from 'common/store/pages/searchResults/lineup/digital_contents/reducer'

import { SearchPageState } from './types'

const initialState: SearchPageState = {
  status: Status.SUCCESS,
  searchText: '',
  digitalContentIds: [],
  albumIds: [],
  contentListIds: [],
  landlordIds: [],
  digitalContents: {
    entries: [],
    order: {},
    total: 0,
    deleted: 0,
    nullCount: 0,
    status: Status.LOADING,
    hasMore: true,
    inView: false,
    prefix: '',
    page: 0,
    isMetadataLoading: false,
    maxEntries: null,
    containsDeleted: false
  }
}

const actionsMap = {
  [FETCH_SEARCH_PAGE_RESULTS](state: SearchPageState) {
    return {
      ...state,
      status: Status.LOADING
    }
  },
  [FETCH_SEARCH_PAGE_RESULTS_SUCCEEDED](
    state: SearchPageState,
    action: FetchSearchPageResultsSuceededAction
  ) {
    const newState = {
      ...initialState,
      status: Status.SUCCESS
    }

    if (action.results) {
      newState.searchText = action.searchText
      newState.digitalContentIds = action.results.digitalContents || []
      newState.albumIds = action.results.albums || []
      newState.contentListIds = action.results.contentLists || []
      newState.landlordIds = action.results.users || []
    }
    return newState
  },
  [FETCH_SEARCH_PAGE_RESULTS_FAILED](
    state: SearchPageState,
    action: FetchSearchPageResultsFailedAction
  ) {
    return {
      ...initialState,
      status: Status.ERROR
    }
  },
  [FETCH_SEARCH_PAGE_TAGS](
    state: SearchPageState,
    action: FetchSearchPageTagsAction
  ) {
    return {
      ...state,
      status: Status.LOADING
    }
  },
  [FETCH_SEARCH_PAGE_TAGS_SUCCEEDED](
    state: SearchPageState,
    action: FetchSearchPageTagsSucceededAction
  ) {
    const newState = {
      ...initialState,
      status: Status.SUCCESS
    }

    if (action.results) {
      newState.searchText = action.tag
      newState.digitalContentIds = action.results.digitalContents || []
      newState.landlordIds = action.results.users || []
      newState.albumIds = []
      newState.contentListIds = []
    }

    return newState
  },
  [FETCH_SEARCH_PAGE_TAGS_FAILED](
    state: SearchPageState,
    action: FetchSearchPageTagsFailedAction
  ) {
    return {
      ...initialState,
      status: Status.ERROR
    }
  }
}

const digitalContentsLineupReducer = asLineup(PREFIX, digitalContentsReducer)

function reducer(
  state: SearchPageState = initialState,
  action: SearchPageActions
) {
  // @ts-ignore this technically will never hit with actions typed the way they are
  const digitalContents = digitalContentsLineupReducer(state.digitalContents, action)
  if (digitalContents !== state.digitalContents) return { ...state, digitalContents }

  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state
  // @ts-ignore for some reason action is never ts 4.0 may help
  return matchingReduceFunction(state, action as SearchPageActions)
}

export default reducer
