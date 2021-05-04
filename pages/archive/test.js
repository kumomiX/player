import * as d3 from 'd3'
import dayjs from 'dayjs'

import styles from './chart.module.scss'
import cn from 'classnames'
import { timeFormat } from 'd3'
const width = 960

const formatDate = (d) => dayjs.unix(d).format('H:mm:ss')

export default function chart({
  data,
  date,
  onDateRangeChange,
  setClear,
  onClick,
  container,
  tooltipContainer,
  archiveTimeline,
}) {
  const startX = 10
  const marginRight = 10
  const iconSize = 14

  // const uniqueRowLabels = archiveTimeline?.events_clusters
  //   .map((d) => d.event)
  //   .filter((value, index, self) => self.indexOf(value) === index)
  //   .sort()

  const height = 42 //(uniqueRowLabels.length + 1) * 40
  const xAxisStart = height - 2

  // const svg = d3
  //   .select(container)
  //   .append('svg')
  //   .attr('viewBox', '0 0 960 600')
  //   .style('width', '100%')
  //   .style('height', 'auto')

  const svg = d3
    .select(container)
    .attr('viewBox', [0, 0, width, height])
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('color', 'var(--color-gray-600)')

  const xScale = d3
    .scaleTime()
    // .domain([
    //   dayjs('2019-09-01').startOf('day'),
    //   dayjs('2019-09-01').endOf('day'),
    // ])
    .domain([dayjs(date).startOf('day'), dayjs(date).endOf('day')])
    .range([startX, width - marginRight])
    .nice()
    .clamp(true)

  // const yScale = d3.scaleBand().domain(uniqueRowLabels).range([50, height])

  let g = svg.append('g')

  let callerLines = g.append('g').attr('id', 'backgrounds')

  let xAxis = d3
    .axisTop(xScale)
    .ticks(16)
    .tickFormat((d, idx) => {
      return idx % 2 === 0 ? d3.timeFormat('%H')(d) : null
    })

  let xAxisGroup = g
    .append('g')
    .attr('class', 'xAxis axis')
    .attr('transform', `translate(0, ${xAxisStart})`)
    .call(xAxis)
    // .attr('fill', 'var(--color-danger-background)')
    .attr('cursor', 'pointer')

  // let yAxis = d3.axisLeft(yScale)
  // let yAxisGroup = g
  //   .append('g')
  //   .attr('class', 'axis axis--y')
  //   .attr('transform', 'translate(' + startX + ',-20)')
  //   .call(yAxis)

  // const zoomFunction = () => {
  //   const newXScale = d3.event.transform.rescaleX(xScale)

  //   // xAxis zoom with newScale
  //   g.selectAll('.xAxis').transition().duration(50).call(xAxis.scale(newXScale))
  //   // re-draw circles
  //   g.selectAll('.eventMarks').attr('cx', (d) =>
  //     newXScale(dayjs(d.eventTime))
  //   )
  // }

  // const zoom = d3
  //   .zoom()
  //   .scaleExtent([1, 40])
  //   .translateExtent([
  //     [0, 0],
  //     [width, 0],
  //   ]) // translate only extent of xaxis
  //   .on('zoom', zoomFunction)

  // g.call(zoom)

  const symbol = svg.append('defs')

  symbol
    .append('g')
    .attr('id', 'facerec')
    .append('path')
    .attr(
      'd',
      'M13.23047,2.00342A7.36652,7.36652,0,0,0,7.77734,4.11719,7.44119,7.44119,0,0,0,5.5,9.46533L3.65625,12.46289a.995.995,0,0,0-.15625.52v.04053a.99952.99952,0,0,0,.07031.34668l1.43946,3.87256c.01269.03418.02734.06689.043.09912A2.9843,2.9843,0,0,0,7.73633,19H8.5v2a1,1,0,0,0,2,0V19h1.99689l.00311.00049a.99907.99907,0,0,0,.32129-.05371l3.70026-1.25623a.99865.99865,0,0,0,.01751.12049l1,3.4663a1.00148,1.00148,0,0,0,.96094.72315,1.01777,1.01777,0,0,0,.27734-.03955,1.00043,1.00043,0,0,0,.6836-1.23828l-.92383-3.2002,1.92969-7.26611A1.03147,1.03147,0,0,0,20.5,10V9.77246A7.698,7.698,0,0,0,13.23047,2.00342ZM11.5,17H7.73633a.99477.99477,0,0,1-.874-.51318L5.93848,14H11.5Zm5.523-1.59137-3.523,1.196V13.72089l4.34479-1.44831Zm1.41211-5.38843a.973.973,0,0,0-.25147.03107L12.3374,12H6.28906l1.07422-1.74658a.99913.99913,0,0,0,.14746-.562c0-.01026-.00976-.18116-.01074-.19141A5.45491,5.45491,0,0,1,9.16992,5.55273a5.52222,5.52222,0,0,1,4-1.55029A5.6849,5.6849,0,0,1,18.5,9.77246Z'
    )

  symbol
    .append('g')
    .attr('id', 'service')
    .append('path')
    .attr(
      'd',
      'M12.25 11.6667H11.5267L8.96582 2.45002C8.86378 2.08121 8.64366 1.75602 8.33919 1.52424C8.03471 1.29246 7.66265 1.16686 7.27999 1.16669H6.69666C6.318 1.17192 5.95126 1.29984 5.65149 1.53124C5.35172 1.76264 5.1351 2.08503 5.03416 2.45002L2.47332 11.6667H1.74999C1.59528 11.6667 1.44691 11.7281 1.33751 11.8375C1.22811 11.9469 1.16666 12.0953 1.16666 12.25C1.16666 12.4047 1.22811 12.5531 1.33751 12.6625C1.44691 12.7719 1.59528 12.8334 1.74999 12.8334H12.25C12.4047 12.8334 12.5531 12.7719 12.6625 12.6625C12.7719 12.5531 12.8333 12.4047 12.8333 12.25C12.8333 12.0953 12.7719 11.9469 12.6625 11.8375C12.5531 11.7281 12.4047 11.6667 12.25 11.6667ZM6.15999 2.75919C6.19527 2.63301 6.27201 2.52239 6.37783 2.44514C6.48365 2.36789 6.6124 2.32851 6.74332 2.33335H7.32666C7.45758 2.32851 7.58633 2.36789 7.69215 2.44514C7.79797 2.52239 7.8747 2.63301 7.90999 2.75919L8.37082 4.66669H5.62916L6.15999 2.75919ZM5.30249 5.83335H8.69749L9.33332 8.16669H4.66666L5.30249 5.83335ZM3.68666 11.6667L4.33416 9.33335H9.66582L10.3133 11.6667H3.68666Z'
    )

  const tooltip = d3
    .select(tooltipContainer)
    .append('div')
    .attr('class', styles.tooltip)
    .style('position', 'absolute')
    .style('visibility', 'hidden')

  // const imgContainer = tooltip
  //   .append('div')
  //   .attr('id', 'tooltipImgContainer')
  //   .attr('class', styles.tooltipImgContainer)

  const textContainer = tooltip.append('div').text("I'm a circle!")

  // archive-timeline
  g.append('g')
    .attr('id', 'archive')
    .selectAll('g')
    .data(archiveTimeline?.archive || archiveTimeline)
    .enter()
    .append('rect')
    .attr('height', 23)
    .attr('transform', ({ from }) => {
      const date = new Date(from * 1000)
      return `translate(${xScale(date)}, ${xAxisStart - 20})`
    })
    .attr('width', ({ from, duration }) => {
      const start = dayjs.unix(from).toDate() //new Date(from * 1000)
      const end = dayjs.unix(from).add(duration, 's').toDate() //new Date((from + duration) * 1000)
      return xScale(end) - xScale(start)
    })
    .attr('fill', 'var(--color-success)')
    .attr('fill-opacity', 0.3)

  //brush
  const handleBrush = (event) => {
    const selection = event && event.selection

    if (!selection) return false

    const [startDate, endDate] = selection.map(xScale.invert)
    onDateRangeChange([startDate, endDate])
  }
  const [ex1, ex2] = xScale.range()
  const brush = d3
    .brushX()
    .extent([
      [ex1, 0],
      [ex2, height],
    ])
    .on('start', (e) => {
      const [x] = d3.pointer(e)

      handle.attr('transform', `translate(${x}, ${xAxisStart + 5})`)
      const time = xScale.invert(x)
      onClick(time)
    })
    .on('brush', handleBrush)
    .on('end', (e) => {
      if (!e.selection) {
        onDateRangeChange(null)
      }
    })
  const brushArea = g
    .append('g')
    .attr('class', cn('x brush', styles.brush))
    .call(brush)
    .selectAll('rect')
    .attr('y', 1)
    .attr('height', height)

  function resetBrush() {
    brush.clear(d3.selectAll('g.brush'))
  }
  setClear(resetBrush)

  // events
  // let marks = g.append('g').attr('id', 'events')
  // let missedMarks = marks
  //   .selectAll('g')
  //   .data(archiveTimeline?.events)
  //   .enter()
  //   .append('g')
  //   .attr('class', 'eventMarks')
  //   .attr('transform', (d) => {
  //     const date = dayjs.unix(d.date).toDate()
  //     return `translate(${xScale(date)},${height - 43})`
  //   })
  //   .on('mouseover', function (e, d) {
  //     textContainer.text(`${formatDate(d.date)} • ${d.event} `)
  //     return tooltip.style('visibility', 'visible')
  //   })
  //   .on('mousemove', function (event, d) {
  //     return tooltip
  //       .style('top', event.pageY - 10 + 'px')
  //       .style('left', event.pageX + 10 + 'px')
  //   })
  //   .on('mouseout', function () {
  //     return tooltip.style('visibility', 'hidden')
  //   })
  //   .on('click', (e, d) => {
  //     const time = dayjs.unix(d.date).toDate()
  //     const x = xScale(time)
  //     handle.attr('transform', `translate(${x}, ${xAxisStart + 5})`)
  //     onClick(time)
  //   })
  // // const marksPadding = 2
  // // missedMarks
  // //   .append('rect')
  // //   .attr('width', iconSize + marksPadding)
  // //   .attr('height', iconSize + marksPadding)
  // //   .attr('fill', 'var(--color-blurred-background)')
  // missedMarks
  //   .append('g')
  //   .attr('transform', (d) => `translate(-${iconSize / 2}, 5)`)
  //   .append('use')
  //   .attr('xlink:href', (d) => '#service') // event type check
  //   .attr('stroke-width', 0.7)
  //   .attr('opacity', 0.5)
  //   .attr('fill', (d) => 'var(--color-gray-100)')
  // // .attr('stroke', (d) =>
  // //   d.event === 'fail' ? 'var(--color-danger)' : 'var(--color-success)'
  // // )
  // // .attr('fill', (d) =>
  // //   d.event === 'fail' ? 'var(--color-danger)' : 'var(--color-success)'
  // // )

  // DRAG
  const cur = dayjs(date).startOf('day')
  function dragstarted(event, d) {
    d3.select(this).raise().attr('stroke', 'var(--color-primary-light)')
  }
  function dragged(event) {
    const time = xScale.invert(event.x)

    onClick(time)

    d3.select(this).attr(
      'transform',
      `translate(${xScale(time)}, ${xAxisStart})`
    )
  }
  function dragended(event, d) {
    d3.select(this).attr('stroke', null)
  }
  const drag = d3
    .drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
  const handle = g
    .append('g')
    .attr('id', 'currentHandle')
    .attr('cursor', 'grab')
    .attr('transform', (d) => {
      return `translate(${xScale(cur)}, ${xAxisStart - 7})`
    })
    .call(drag)

  handle
    .append('rect')
    .attr('width', 1)
    .attr('height', 35)
    .attr('fill', 'var(--color-primary)')
    .attr('transform', 'translate(0,-35)')

  handle
    .append('circle')
    // .attr('cx', xScale(cur))
    // .attr('cy', xAxisStart)
    .attr('r', 5)
    .attr('stroke', 'var(--color-primary)')
    .attr('fill', 'var(--color-primary)')

  // d3.select('g.xAxis').on('click', (e, d) => {
  //   const [x] = d3.pointer(e)
  //   handle.attr('cx', x)
  //   console.log('ultrakek')
  // })

  return svg
}
