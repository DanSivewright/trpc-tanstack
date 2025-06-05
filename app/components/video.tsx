import { IKVideo } from "imagekitio-react"
import type { IKVideoProps } from "imagekitio-react/dist/types/components/IKVideo/combinedProps"

type Props = IKVideoProps

const Video: React.FC<Props> = (props) => {
  return (
    <IKVideo
      urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
      {...(props as Props)}
    />
  )
}
export default Video
