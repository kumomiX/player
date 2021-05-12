import * as d3 from 'd3'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import useResizeObserver from 'use-resize-observer'
import dayjs from 'dayjs'

import { inertiaHelper } from 'd3-inertia'

const margin = {
  top: 0,
  right: 0,
  bottom: 10,
  left: 0,
}

function drawScale(svg, scale, visHeight, margins) {
  svg.selectAll('g').remove()
  let axisGroup = svg
    .append('g')
    .attr('transform', `translate(0,${margins.top})`)
    .attr('class', 'axisSegment')

  // const monthYearFormat = (d) => d3.timeFormat('%b %Y')(d).toUpperCase()
  const hourMinuteFormat = (d) => d3.timeFormat('%H:%M')(d).toUpperCase()
  let axisGenerator = d3
    .axisBottom(scale)
    .ticks(4)
    .tickFormat(hourMinuteFormat)
    .tickSizeInner(visHeight - margins.top - margins.bottom)
    .tickSizeOuter(0)
  axisGenerator(axisGroup)

  function addTicks(tickArg, length) {
    axisGroup
      .selectAll('.tick')
      .data(scale.ticks(tickArg), (d) => d)
      .enter()
      .append('line')
      .attr('class', 'tick')
      .attr('stroke', 'currentColor')
      .attr('y1', 0)
      .attr('y2', length || 8)
      .attr('x1', scale)
      .attr('x2', scale)
  }

  addTicks(12, 20)
  addTicks(100, 8)

  return svg
}

function drawDial(svg, x) {
  if (x === undefined) x = -200 // Start with the dial out of view
  svg.select('.dial').remove()
  let dial = svg
    .append('g')
    .attr('transform', 'translate(' + x + ', 0)')
    .attr('class', 'dial')

  // Draw the main shape
  let dialShape =
    'M0 0 l 15 20 v 18 q 0 5 -5 5 h -20 q -5 0 -5 -5 v -18 l 15 -20'
  dial
    .append('path')
    .attr('fill', '#ccc')
    .attr('fill-opacity', '0.85')
    .attr('stroke', '#333')
    .attr('stroke-width', '1px')
    .attr('d', dialShape)

  // Add stripes for texture
  function addStripe(x) {
    dial
      .append('rect')
      .attr('fill', '#515151')
      .attr('width', '3')
      .attr('height', '16')
      .attr('x', x)
      .attr('y', '21')
  }

  addStripe(-7.5)
  addStripe(-1.5)
  addStripe(4.5)

  return svg
}

function buildDateSelector(config) {
  let {
    firstDay,
    lastDay,
    initialSelection,
    margins,
    padding,
    width: visWidth, // Avoid conflict with Observable global variable
    height: visHeight, // Avoid conflict with a likely user-defined variable
    initTranslate,
    minZoom,
    maxZoom,
    initZoom,
    elementRef,
    onDateChange,
    setDate,
    videoRef,
  } = config

  if (!lastDay) lastDay = d3.timeDay(new Date())
  if (!firstDay) firstDay = d3.timeDay.offset(lastDay, -1)
  // let setDate(date || d3.timeDay.offset(lastDay, -1))

  if (!margins) margins = Object({ top: 0, right: 5, bottom: 0, left: 0 })
  if (!padding) padding = Object({ left: 200, right: 0 })
  if (!visWidth) visWidth = width // screen width
  if (!visHeight) visHeight = 70
  if (!initTranslate) initTranslate = 0
  let zoomWidth = visWidth - margins.right - margins.left
  if (!minZoom) minZoom = zoomWidth / (zoomWidth + padding.right + padding.left)
  if (!maxZoom) maxZoom = 10
  if (!initZoom) initZoom = 10

  if (!lastDay) lastDay = d3.timeDay(new Date())
  if (!firstDay) firstDay = d3.timeDay.offset(lastDay, -1)

  //
  const m = 50
  const height = 100

  let date = initialSelection || firstDay

  const timeScale = d3
    .scaleUtc()
    .domain([firstDay, lastDay])
    .range([
      margins.left - padding.left,
      visWidth - margins.right + padding.right,
    ])
    .clamp(true)

  const svg = d3
    .select(elementRef.current)
    // .attr('viewBox', [0, 0, visWidth, visHeight])
    .style('background', '#aeaeae')
    .style('overflow', 'hidden')
    .attr('height', visHeight)
    .attr('width', visWidth)

  const g = svg.append('g')

  const transform = d3.zoomIdentity.translate(0, 0).scale(initZoom)
  let zoomedScale = timeScale.copy()
  const display = [
    [margins.left, margins.top],
    [visWidth - margins.right, visHeight - margins.top],
  ]
  // We render an area larger than the visible SVG, to make sure axis labels
  // don't suddenly appear or disappear as they scroll past the edge of the display.
  const rendering = [
    [display[0][0] - padding.left - initZoom * 2, display[0][1]],
    [display[1][0] + padding.right + initZoom * 2, display[1][1]],
  ]
  const zoomer = d3
    .zoom()
    .scaleExtent([minZoom, maxZoom])
    .translateExtent(rendering)
    // .translateExtent(rendering)
    .extent(display)
  // .on('start', (e) => {
  //   // videoRef.current.pause()
  //   zoomer.translateExtent([
  //     [
  //       display[0][0] - padding.left - visWidth / (e.transform.k * 2),
  //       display[0][1],
  //     ],
  //     [
  //       display[1][0] + padding.right + visWidth / (e.transform.k * 2),
  //       display[1][1],
  //     ],
  //   ])
  // })
  // // .on('zoom', rescale)
  // .on('end', () => {
  //   updateDate(zoomedScale.invert(visWidth / 2)) // -2.5 ????? padding left / right
  //   // videoRef.current.play()
  // })

  svg.call(zoomer).call(zoomer.transform, transform)

  // let axisGroup = svg
  //   .append('g')
  // .attr('transform', `translate(0,${m})`)

  const axis = function (g, scale) {
    g.selectAll('.x-axis-bottom')
      .data(['x-axis-bottom'], (d) => d)
      .join('g')
      .attr('class', (d) => d)
      .attr('transform', `translate(${0}, ${height - m})`)
      .call(d3.axisBottom(scale))
  }

  svg.call(axis, timeScale, height, m)

  // svg.call(
  //   zoom.on('zoom', function (e) {
  //     let newScale = e.transform.rescaleX(timeScale)
  //     svg.call(axis, newScale, height, m)
  //   })
  // )

  var position = [visWidth / 2, visHeight / 2]
  const radius = 20
  var offset = { x: 0, y: 0 }

  function draw() {
    g.attr('transform', `translate(${position[0]}, ${position[1]})`)
  }
  draw()

  var circle = d3
    .select('g')
    .append('circle')
    .attr('class', 'circle')
    .attr('r', radius)

  /* Function to keep the ball inside the view */
  function updatePosition(newPosition, offset) {
    if (offset === undefined) {
      offset = { x: 0, y: 0 }
    }
    newPosition[0] = Math.max(
      radius,
      Math.min(newPosition[0] + offset.x, visWidth - radius)
    )
    newPosition[1] = Math.max(
      radius,
      Math.min(newPosition[1] + offset.y, visHeight - radius)
    )
    position = newPosition
  }

  function getTransformParameters(transformString) {
    var values = transformString
      .substr('translate('.length)
      .split(',')
      .map(function (d) {
        return parseInt(d, 10)
      })
    return { x: values[0], y: values[1] }
  }

  var inertia = inertiaHelper({
    start: function () {
      var transform = getTransformParameters(g.attr('transform'))
      offset = {
        x: transform.x - inertia.position[0],
        y: transform.y - inertia.position[1],
      }
    },
    move: function () {
      updatePosition(inertia.position, offset)
      draw()
    },
    render: function (t) {
      updatePosition([
        // velocity is constant, so I use t**2 to make it look like it slows down
        // 0.25 is just to slow down the ball so it doesn't fly off
        inertia.position[0] + 0.25 * t ** 2 * inertia.velocity[0],
        inertia.position[1] + 0.25 * t ** 2 * inertia.velocity[1],
      ])
      draw()
    },
  })

  // var position = [0, 0],
  //   startposition,
  //   endposition
  // var offset = { x: 0, y: 0 }
  // var n = 10000 // reference time in ms
  // var inertia = inertiaHelper({
  //   start: function () {
  //     startposition = inertia.position
  //   },
  //   move: function () {
  //     draw([
  //       position[0] + inertia.position[0] - startposition[0],
  //       position[1] + inertia.position[1] - startposition[1],
  //     ])
  //   },
  //   end: function () {
  //     position = endposition = [
  //       position[0] + inertia.position[0] - startposition[0],
  //       position[1] + inertia.position[1] - startposition[1],
  //     ]
  //   },
  //   render: function (t) {
  //     position = [
  //       endposition[0] + t * (1 - t) * inertia.velocity[0],
  //       endposition[1] + t * (1 - t) * inertia.velocity[1],
  //     ]
  //     draw(position)
  //   },
  //   time: n,
  // })

  svg.call(
    d3
      .drag()
      .on('start', inertia.start)
      .on('drag', inertia.move)
      .on('end', inertia.end)
  )
}

export default function PlayerKek() {
  const svgRef = useRef()
  const { ref, width: playerWidth = 1 } = useResizeObserver()
  const [date, setDate] = useState(new Date(2020, 4, 1, 9, 30))
  const vis = useRef({})
  const videoRef = useRef()
  const lastTick = useRef(0)
  const [paused, setPaused] = useState(false)

  useLayoutEffect(() => {
    if (playerWidth > 1) {
      console.log('reß')
      vis.current = buildDateSelector({
        width: playerWidth,
        elementRef: svgRef,
        videoRef,
        initialSelection: date,
        onDateChange: setDate,
      })
    }
  }, [playerWidth])

  const togglePlayState = useCallback(() => {
    videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()
  }, [videoRef.current])

  return (
    <div ref={ref} style={{ width: '100%' }}>
      Test Controls
      <button
        onClick={() => {
          vis.current.translateToDate(new Date(2020, 4, 1, 13))
        }}>
        jump to 13:00
      </button>
      <video
        autoPlay
        playsInline
        src="/vid1.mp4"
        style={{ width: '100%' }}
        ref={videoRef}
        onPause={() => setPaused(true)}
        onPlay={() => {
          setPaused(false)
        }}
        onClick={togglePlayState}
        // onTimeUpdate={(e) => {
        //   vis.current.translateToDate(
        //     dayjs(date)
        //       .add(e.currentTarget.currentTime - lastTick.current, 's')
        //       .toDate()
        //   )

        //   lastTick.current = e.currentTarget.currentTime
        // }}
      ></video>
      <svg ref={svgRef} />
      {date?.toLocaleTimeString()}
      <br />
      <code>{JSON.stringify(date, null, 2)}</code>
    </div>
  )
}

// call zoom translate on date -> d3.zoomIdentity.translate(initTranslate, 0).scale(initZoom)
