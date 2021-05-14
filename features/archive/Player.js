import { useCallback, useEffect, useRef, useState } from 'react'
import ArchiveControls from '../../features/archive/Controls'
import dayjs from 'dayjs'
import ReactPlayer from 'react-player/lazy'
import { convertArchiveUrl } from './utils'

//[{duration: 43577, from: 1620853200}]
//https://cvs.fastel.biz/840bc45e-1c7a-4c3f-9c24-0840969e7db4/archive-$utc_time_from_sec-$duration_sec
//duration: 86399
//from: 1620680400

export default function ArchivePlayer({
  // url = 'https://www.youtube.com/watch?v=xmGaAjeqaBQ',
  url = 'https://cvs.fastel.biz/840bc45e-1c7a-4c3f-9c24-0840969e7db4/archive-$utc_time_from_sec-$duration_sec',
  date,
  setDate,
}) {
  const player = useRef()
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [loading, setLoading] = useState(true)
  const togglePlayState = () => setPlaying(!playing)

  const [segments, setSegments] = useState([
    { duration: 43577, from: 1620853200 },
  ]) // segments depend on date
  useEffect(() => {
    // date changes -> update segments
  }, [date])
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0)
  useEffect(() => {
    setCurrentSegmentIdx(0)
  }, [segments])

  const [archiveLink, setArchiveLink] = useState(null)
  // link depends on segments
  useEffect(() => {
    const segment = segments[currentSegmentIdx]
    console.log(segment)
    if (segment) {
      setArchiveLink(convertArchiveUrl(url, segment.from, segment.duration))
    }
  }, [url, currentSegmentIdx, segments])

  return (
    <>
      <div>
        {loading && 'loading...'}
        <button
          onClick={() => {
            setPlaying(false)
            const t = player.current.getCurrentTime()
            player.current.seekTo(t - 15, 'seconds')
            setPlaying(true)
          }}>
          -15
        </button>
        <button
          onClick={() => {
            setPlaying(false)
            const t = player.current.getCurrentTime()
            player.current.seekTo(t + 15, 'seconds')
            setPlaying(true)
          }}>
          +15
        </button>
        <button onClick={togglePlayState}>{playing ? 'pause' : 'play'}</button>
        <button
          onClick={() => {
            player.current.seekTo(duration, 'seconds')
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
          const nextIdx = currentSegmentIdx + 1
          const nextSegment = segments[nextIdx]
          if (nextSegment) {
            setCurrentSegmentIdx(currentSegmentIdx + 1)
          } else {
            setPlaying(false)
            alert('end')
          }
        }}
        onProgress={({ played, playedSeconds }) => {
          // console.log('prog', playedSeconds)
          const d = date.startOf('day').add(playedSeconds, 's')
          setDate(d)

          // if (!playing) setPlaying(true)
        }}
        onDuration={(d) => setDuration(d)}
        onBuffer={() => {
          setLoading(true)
        }}
        onBufferEnd={() => {
          setLoading(false)
        }}
        // onSeek={}
        // onReady={() => {
        //   console.log('seek')
        //   setPlaying(true)
        // }}
        //
        url={archiveLink}
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
        segments={segments}
        date={date}
        onDragStart={() => {
          setPlaying(false)
        }}
        onDragEnd={(time) => {
          if (player.current) {
            // check if inside cur segment and if segment available

            // seek  inside cur segment
            const seconds = dayjs(time).diff(date.startOf('day'), 'second')
            console.log(seconds)
            player.current.seekTo(seconds, 'seconds')

            if (seconds >= duration) {
              // check segment
              return
            } else {
              setPlaying(true)
            }
          }
        }}
      />
    </>
  )
}
