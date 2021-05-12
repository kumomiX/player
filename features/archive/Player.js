import { useCallback, useEffect, useRef, useState } from 'react'
import ArchiveControls from '../../features/archive/Controls'
import dayjs from 'dayjs'
import ReactPlayer from 'react-player/lazy'

export default function ArchivePlayer({ date, setDate }) {
  const player = useRef()
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(true)
  const togglePlayState = useCallback(() => {
    setPlaying(!playing)
  }, [playing])

  return (
    <>
      <div>
        <button
          onClick={() => {
            player.current.seekTo(duration - 1, 'seconds')
          }}>
          to end
        </button>
      </div>

      <ReactPlayer
        ref={player}
        playing={playing}
        // events
        onPause={() => setPlaying(false)}
        onPlay={() => {
          setPlaying(true)
        }}
        onEnded={() => {
          setPlaying(false)
        }}
        onProgress={({ played, playedSeconds }) => {
          // console.log('prog', playedSeconds)
          const d = date.startOf('day').add(playedSeconds, 's')
          setDate(d)

          // if (!playing) setPlaying(true)
        }}
        onDuration={(d) => setDuration(d)}
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
        onDragStart={() => {
          setPlaying(false)
        }}
        onDragEnd={(time) => {
          if (player.current) {
            const seconds = dayjs(time).diff(date.startOf('day'), 'second')
            console.log(seconds)
            player.current.seekTo(seconds, 'seconds')

            // console.log(seconds)
            if (seconds >= duration) return
          }
        }}
      />
    </>
  )
}
