import { UID, ID, Collectible, Nullable } from '@coliving/common'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import NativeMobileAudio from 'live/NativeMobileAudio'

import { AudioState } from './types'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

type State = {
  // Identifiers for the live that's playing.
  uid: UID | null
  agreementId: ID | null

  collectible: Collectible | null

  live: AudioState

  // Keep 'playing' in the store separately from the live
  // object to allow components to subscribe to changes.
  playing: boolean

  // Keep 'buffering' in the store separately from the live
  // object to allow components to subscribe to changes.
  buffering: boolean

  // Unique integer that increments every time something is "played."
  // E.g. replaying a agreement doesn't change uid or agreementId, but counter changes.
  counter: number
}

export const initialState: State = {
  uid: null,
  agreementId: null,

  collectible: null,

  // In the case of native mobile, use the native mobile live
  // player directly. Otherwise, it is set dynamically
  live: NATIVE_MOBILE ? new NativeMobileAudio() : null,

  playing: false,
  buffering: false,
  counter: 0
}

type SetAudioStreamPayload = {
  live: AudioState
}

type PlayPayload = {
  uid?: Nullable<UID>
  agreementId?: ID
  onEnd?: (...args: any) => any
}

type PlaySucceededPayload = {
  uid?: Nullable<UID>
  agreementId?: ID
}

type PlayCollectiblePayload = {
  collectible: Collectible
  onEnd?: (...args: any) => any
}

type PlayCollectibleSucceededPayload = {
  collectible: Collectible
}

type PausePayload = {
  // Optionally allow only setting state which doesn't actually
  // invoke a .pause on the internal live object. This is used in
  // native mobile live only.
  onlySetState?: boolean
}

type StopPayload = {}

type SetBufferingPayload = {
  buffering: boolean
}

type SetPayload = {
  uid: UID
  agreementId: ID
}

type SeekPayload = {
  seconds: number
}

type ErrorPayload = {
  error: string
  agreementId: ID
  info: string
}

type ResetPayload = {
  shouldAutoplay: boolean
}

type ResetSucceededPayload = {
  shouldAutoplay: boolean
}

const slice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setAudioStream: (state, action: PayloadAction<SetAudioStreamPayload>) => {
      const { live } = action.payload
      // Redux toolkit seems to do something to state.live's type (some destructured form?)
      state.live = live as typeof state.live
    },
    play: (state, action: PayloadAction<PlayPayload>) => {},
    playSucceeded: (state, action: PayloadAction<PlaySucceededPayload>) => {
      const { uid, agreementId } = action.payload
      state.playing = true
      if (!uid || !agreementId) return
      state.uid = uid || state.uid
      state.agreementId = agreementId || state.agreementId
      state.collectible = null
    },
    playCollectible: (
      state,
      action: PayloadAction<PlayCollectiblePayload>
    ) => {},
    playCollectibleSucceeded: (
      state,
      action: PayloadAction<PlayCollectibleSucceededPayload>
    ) => {
      const { collectible } = action.payload
      state.playing = true
      state.uid = null
      state.agreementId = null
      state.collectible = collectible || state.collectible
    },
    pause: (state, action: PayloadAction<PausePayload>) => {
      state.playing = false
    },
    setBuffering: (state, action: PayloadAction<SetBufferingPayload>) => {
      const { buffering } = action.payload
      state.buffering = buffering
    },
    stop: (state, action: PayloadAction<StopPayload>) => {
      state.playing = false
      state.uid = null
      state.agreementId = null
      state.counter = state.counter + 1
    },
    set: (state, action: PayloadAction<SetPayload>) => {
      const { uid, agreementId } = action.payload
      state.uid = uid
      state.agreementId = agreementId
    },
    reset: (state, action: PayloadAction<ResetPayload>) => {},
    resetSuceeded: (state, action: PayloadAction<ResetSucceededPayload>) => {
      const { shouldAutoplay } = action.payload
      state.playing = shouldAutoplay
      state.counter = state.counter + 1
    },
    seek: (state, actions: PayloadAction<SeekPayload>) => {},
    error: (state, actions: PayloadAction<ErrorPayload>) => {},
    incrementCount: (state) => {
      state.counter = state.counter + 1
    }
  }
})

export const {
  setAudioStream,
  play,
  playSucceeded,
  playCollectible,
  playCollectibleSucceeded,
  pause,
  stop,
  setBuffering,
  set,
  reset,
  resetSuceeded,
  seek,
  error,
  incrementCount
} = slice.actions

export default slice.reducer