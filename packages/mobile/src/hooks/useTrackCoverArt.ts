import type { SquareSizes } from '@/common'
import { fetchCoverArt } from '-client/src/common/store/cache/tracks/actions'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { getUseImageSizeHook } from 'app/hooks/useImageSize'

export const useTrackCoverArt = getUseImageSizeHook<SquareSizes>({
  action: fetchCoverArt,
  defaultImageSource: imageEmpty
})
