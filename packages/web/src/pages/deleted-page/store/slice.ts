import { createSlice } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'

import { asLineup } from 'common/store/lineup/reducer'

import { PREFIX as moreByPrefix } from './lineups/more-by/actions'
import moreByAgreementsReducer from './lineups/more-by/reducer'

type State = {}

const initialState: State = {}

const slice = createSlice({
  name: 'application/pages/remixes',
  initialState,
  reducers: {}
})

const moreByLineupReducer = asLineup(moreByPrefix, moreByAgreementsReducer)

export default combineReducers({
  page: slice.reducer,
  moreBy: moreByLineupReducer
})
