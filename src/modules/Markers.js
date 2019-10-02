import Filters from './Filters'
import Graphics from './Graphics'
import Utils from '../utils/Utils'

/**
 * ApexCharts Markers Class for drawing points on y values in axes charts.
 *
 * @module Markers
 **/

export default class Markers {
  constructor(ctx, opts) {
    this.ctx = ctx
    this.w = ctx.w
  }

  setGlobalMarkerSize() {
    const w = this.w

    w.globals.markers.size = Array.isArray(w.config.markers.size)
      ? w.config.markers.size
      : [w.config.markers.size]

    if (w.globals.markers.size.length > 0) {
      if (w.globals.markers.size.length < w.globals.series.length + 1) {
        for (let i = 0; i <= w.globals.series.length; i++) {
          if (typeof w.globals.markers.size[i] === 'undefined') {
            w.globals.markers.size.push(w.globals.markers.size[0])
          }
        }
      }
    } else {
      w.globals.markers.size = w.config.series.map((s) => {
        return w.config.markers.size
      })
    }
  }

  plotChartMarkers(pointsPos, seriesIndex, j) {
    let w = this.w

    let i = seriesIndex
    let p = pointsPos
    let elPointsWrap = null

    let graphics = new Graphics(this.ctx)

    let point

    if (w.globals.markers.size[seriesIndex] > 0) {
      elPointsWrap = graphics.group({
        class: 'apexcharts-series-markers'
      })

      elPointsWrap.attr(
        'clip-path',
        `url(#gridRectMarkerMask${w.globals.cuid})`
      )
    }

    if (p.x instanceof Array) {
      for (let q = 0; q < p.x.length; q++) {
        let dataPointIndex = j

        // a small hack as we have 2 points for the first val to connect it
        if (j === 1 && q === 0) dataPointIndex = 0
        if (j === 1 && q === 1) dataPointIndex = 1

        let PointClasses = 'apexcharts-marker'
        if (
          (w.config.chart.type === 'line' || w.config.chart.type === 'area') &&
          !w.globals.comboCharts &&
          !w.config.tooltip.intersect
        ) {
          PointClasses += ' no-pointer-events'
        }

        const shouldMarkerDraw = Array.isArray(w.config.markers.size)
          ? w.globals.markers.size[seriesIndex] > 0
          : w.config.markers.size > 0

        if (shouldMarkerDraw) {
          if (Utils.isNumber(p.y[q])) {
            PointClasses += ` w${(Math.random() + 1).toString(36).substring(4)}`
          } else {
            PointClasses = 'apexcharts-nullpoint'
          }

          let opts = this.getMarkerConfig(
            PointClasses,
            seriesIndex,
            dataPointIndex
          )

          if (w.config.series[i].data[j]) {
            if (w.config.series[i].data[j].fillColor) {
              opts.pointFillColor = w.config.series[i].data[j].fillColor
            }

            if (w.config.series[i].data[j].strokeColor) {
              opts.pointStrokeColor = w.config.series[i].data[j].strokeColor
            }
          }

          point = graphics.drawMarker(p.x[q], p.y[q], opts)

          point.attr('rel', dataPointIndex)
          point.attr('j', dataPointIndex)
          point.attr('index', seriesIndex)
          point.node.setAttribute('default-marker-size', opts.pSize)

          const filters = new Filters(this.ctx)
          filters.setSelectionFilter(point, seriesIndex, dataPointIndex)
          this.addEvents(point)

          if (elPointsWrap) {
            elPointsWrap.add(point)
          }
        } else {
          // dynamic array creation - multidimensional
          if (typeof w.globals.pointsArray[seriesIndex] === 'undefined')
            w.globals.pointsArray[seriesIndex] = []

          w.globals.pointsArray[seriesIndex].push([p.x[q], p.y[q]])
        }
      }
    }

    return elPointsWrap
  }

  getMarkerConfig(cssClass, seriesIndex, dataPointIndex = null) {
    const w = this.w
    let pStyle = this.getMarkerStyle(seriesIndex)
    let pSize = w.globals.markers.size[seriesIndex]

    const m = w.config.markers

    // discrete markers is an option where user can specify a particular marker with different size and color

    if (dataPointIndex !== null && m.discrete.length) {
      m.discrete.map((marker) => {
        if (
          marker.seriesIndex === seriesIndex &&
          marker.dataPointIndex === dataPointIndex
        ) {
          pStyle.pointStrokeColor = marker.strokeColor
          pStyle.pointFillColor = marker.fillColor
          pSize = marker.size
        }
      })
    }

    const strokeWidth =
      w.config.chart.type === 'bubble' ? w.config.stroke.width : m.strokeWidth

    return {
      pSize,
      pRadius: m.radius,
      pWidth:
        strokeWidth instanceof Array ? strokeWidth[seriesIndex] : strokeWidth,
      pointStrokeColor: pStyle.pointStrokeColor,
      pointFillColor: pStyle.pointFillColor,
      shape: m.shape instanceof Array ? m.shape[seriesIndex] : m.shape,
      class: cssClass,
      pointStrokeOpacity:
        m.strokeOpacity instanceof Array
          ? m.strokeOpacity[seriesIndex]
          : m.strokeOpacity,
      pointFillOpacity:
        m.fillOpacity instanceof Array
          ? m.fillOpacity[seriesIndex]
          : m.fillOpacity,
      seriesIndex
    }
  }

  addEvents(circle) {
    const w = this.w

    const graphics = new Graphics(this.ctx)
    circle.node.addEventListener(
      'mouseenter',
      graphics.pathMouseEnter.bind(this.ctx, circle)
    )
    circle.node.addEventListener(
      'mouseleave',
      graphics.pathMouseLeave.bind(this.ctx, circle)
    )

    circle.node.addEventListener(
      'mousedown',
      graphics.pathMouseDown.bind(this.ctx, circle)
    )

    circle.node.addEventListener('click', w.config.markers.onClick)
    circle.node.addEventListener('dblclick', w.config.markers.onDblClick)

    circle.node.addEventListener(
      'touchstart',
      graphics.pathMouseDown.bind(this.ctx, circle),
      { passive: true }
    )
  }

  getMarkerStyle(seriesIndex) {
    let w = this.w

    let colors = w.globals.markers.colors
    let strokeColors =
      w.config.markers.strokeColor || w.config.markers.strokeColors

    let pointStrokeColor =
      strokeColors instanceof Array ? strokeColors[seriesIndex] : strokeColors
    let pointFillColor = colors instanceof Array ? colors[seriesIndex] : colors

    return {
      pointStrokeColor,
      pointFillColor
    }
  }
}
