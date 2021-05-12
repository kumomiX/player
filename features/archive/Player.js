import { useCallback, useEffect, useRef, useState } from 'react'
import ArchiveControls from '../../features/archive/Controls'
import dayjs from 'dayjs'
import ReactPlayer from 'react-player/lazy'

export default function ArchivePlayer({ date, setDate }) {
  const player = useRef()
  const [playing, setPlaying] = useState(true)
  const togglePlayState = useCallback(() => {
    setPlaying(!playing)
  }, [playing])

  return (
    <>
      <ReactPlayer
        ref={player}
        playing={playing}
        // events
        onPause={() => setPlaying(false)}
        onPlay={() => {
          setPlaying(true)
        }}
        onProgress={({ played, playedSeconds }) => {
          setDate(date.startOf('day').second(playedSeconds))
        }}
        // onSeek={}
        // onReady={() => {
        //   console.log('seek')
        //   setPlaying(true)
        // }}
        //
        url="https://www.youtube.com/watch?v=xmGaAjeqaBQ"
        autoPlay
        muted={true}
        playsinline
        width="100%"
        style={{ flex: 1 }}
        // height="100%"
        // style={{
        //   position: 'absolute',
        //   top: 0,
        //   left: 0,
        // }}
      />

      <ArchiveControls
        date={date}
        onDragEnd={(time) => {
          if (player.current) {
            // setPlaying(false)
            const seconds = dayjs(time).diff(date.startOf('day'), 'second')
            player.current.seekTo(seconds, 'seconds')
          }
        }}
      />
    </>
  )
}
