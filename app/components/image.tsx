import { IKImage } from "imagekitio-react"
import type { IKImageProps } from "imagekitio-react/dist/types/components/IKImage/combinedProps"

type Props = IKImageProps

const Image: React.FC<Props> = (props) => {
  return (
    <IKImage
      urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
      {...props}
    />
  )
}
export default Image
