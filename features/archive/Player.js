import { useCallback, useEffect, useRef, useState } from 'react'
import TimelineControls from './TimelineControls'
import dayjs from 'dayjs'
import ReactPlayer from 'react-player/lazy'
import {
  convertArchiveUrl,
  convertDateToThumbUrl,
  getArchiveDomain,
} from './utils'
import styles from './Player.module.scss'
import { useThrottle } from '@react-hook/throttle'

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
  const controls = useRef()

  const player = useRef()
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [loading, setLoading] = useState(true)
  const togglePlayState = () => setPlaying(!playing)

  const [segments, setSegments] = useState([
    { duration: 1449, from: 1621198800 },
    { duration: 48094, from: 1621200353 },
    { duration: 3497, from: 1621248551 },
    { duration: 33131, from: 1621252068 },
  ]) // segments depend on date
  useEffect(() => {
    // TODO: date changes -> update segments
  }, [date])
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0)
  useEffect(() => {
    setCurrentSegmentIdx(0)
  }, [segments])
  const [archiveLink, setArchiveLink] = useState(null)
  // link depends on segments
  useEffect(() => {
    const segment = segments[currentSegmentIdx]
    console.log('Segment changed to ', currentSegmentIdx, segment)
    if (segment) {
      setArchiveLink(convertArchiveUrl(url, segment.from, segment.duration))
    }
  }, [url, currentSegmentIdx, segments])
  useEffect(() => {
    console.log('Archive link changed to ', archiveLink)
  }, [archiveLink])

  const handleDrag = (time) => {
    if (player.current) {
      // check if inside cur segment and if segment available
      const currentSegment = segments[currentSegmentIdx]
      const timeUnix = time.unix()
      const elapsed = time.diff(date.startOf('day'), 'second')

      // check segment
      if (elapsed <= duration && timeUnix >= currentSegment.from) {
        // current segment
        const secondsSinceSegStarted = timeUnix - currentSegment.from
        player.current.seekTo(secondsSinceSegStarted, 'seconds')
        setPlaying(true)
      } else {
        // other segment
        const newSeg = segments?.find(
          (s) => timeUnix >= s.from && timeUnix <= s.from + s.duration
        )
        if (newSeg) {
          const newIdx = segments.indexOf(newSeg)
          setCurrentSegmentIdx(newIdx)
          const diff = timeUnix - newSeg.from
          player.current.seekTo(diff, 'seconds')
          setPlaying(true)
        }
      }
    }
  }

  const [thumb, setThumb] = useThrottle(null, 5, true)

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

      <div className={styles.playerWrapper}>
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
              setCurrentSegmentIdx(nextIdx)
              // setDate(dayjs.unix(nextSegment.from))
            } else {
              setPlaying(false)
              alert('end')
            }
          }}
          onProgress={({ played, playedSeconds }) => {
            const { from } = segments?.[currentSegmentIdx]

            // const d = date.startOf('day').add(playedSeconds, 's')
            // setDate(d)

            //           if (playedSeconds > from + duration) {
            // setCurrentSegmentIdx
            //           } else {

            //           }

            const d = dayjs.unix(from + playedSeconds)
            controls.current.jumpTo(d)
          }}
          onDuration={(d) => {
            console.log('upd duration', d)
            setDuration(d)
          }}
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
          playsInline
          width="100%"
          style={{ flex: 1 }}
          height="100%"
          // style={{
          //   position: 'absolute',
          //   top: 0,
          //   left: 0,
          // }}
        />
        {(!playing || loading) && (
          <div className={styles.thumbWrapper}>
            <video autoPlay playsInline loop muted src={thumb} />
            <p>preview</p>
          </div>
        )}
      </div>

      <TimelineControls
        segments={segments}
        date={date}
        onDragStart={() => {
          setPlaying(false)
        }}
        onDrag={(time) => {
          const thumbUrl = convertDateToThumbUrl(getArchiveDomain(url), time)
          setThumb(thumbUrl)
        }}
        onDragEnd={handleDrag}
        archiveUrl={url}>
        {(c) => {
          controls.current = c
        }}
      </TimelineControls>
    </>
  )
}
