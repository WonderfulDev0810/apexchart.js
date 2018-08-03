import Bar from '../charts/Bar'
import BarStacked from '../charts/BarStacked'
import HeatMap from '../charts/HeatMap'
import Pie from '../charts/Pie'
import Radial from '../charts/Radial'
import Line from '../charts/Line'
import Graphics from './Graphics'
import DateTime from '../utils/DateTime'
import Grid from './axes/Grid'
import XAxis from './axes/XAxis'
import YAxis from './axes/YAxis'
import Range from './Range'
import Utils from '../utils/Utils'
import ClassListPolyfill from '../utils/ClassListPolyfill'
import Series from './Series'

import * as SVG from 'svg.js'
require('svg.filter.js')
require('svg.pathmorphing.js')
require('svg.draggable.js')
require('svg.select.js')
require('svg.resize.js')
/**
 * ApexCharts Core Class responsible for major calculations and creating elements.
 *
 * @module Core
 **/

class Core {
  constructor (el, ctx) {
    this.ctx = ctx
    this.w = ctx.w
    this.el = el
  }

  // get data and store into appropriate vars

  setupElements () {
    let gl = this.w.globals
    let cnf = this.w.config

    const graphics = new Graphics(this.ctx)

    let ct = cnf.chart.type
    let axisChartsArryTypes = [
      'line',
      'bar',
      'area',
      'scatter',
      'bubble',
      'heatmap'
    ]

    let xyChartsArrTypes = [
      'line',
      'bar',
      'area',
      'scatter',
      'bubble'
    ]

    gl.axisCharts = axisChartsArryTypes.indexOf(ct) > -1
    gl.xyCharts = xyChartsArrTypes.indexOf(ct) > -1

    gl.chartClass = '.apexcharts' + gl.cuid

    gl.dom.baseEl = this.el

    gl.dom.elWrap = document.createElement('div')
    Graphics.setAttrs(gl.dom.elWrap, {
      id: gl.chartClass.substring(1),
      class: 'apexcharts-canvas ' + gl.chartClass.substring(1)
    })
    gl.dom.elWrap.style.background = cnf.chart.background
    this.el.appendChild(gl.dom.elWrap)

    gl.dom.Paper = new SVG.Doc(gl.dom.elWrap)
    gl.dom.Paper.attr({
      class: 'apexcharts-svg',
      'xmlns:data': 'ApexChartsNS',
      transform: `translate(${cnf.chart.offsetX}, ${cnf.chart.offsetY})`
    })

    this.setSVGDimensions()

    gl.dom.elGraphical = gl.dom.Paper.group().attr({
      class: 'apexcharts-inner apexcharts-graphical'
    })

    gl.dom.elDefs = gl.dom.Paper.defs()

    // this element is required for hovering over virtual rect to determine x/y position in line and area charts. let's call this element hovering rect

    gl.dom.elLegendWrap = graphics.group({
      class: 'apexcharts-legend'
    })
    gl.dom.Paper.add(gl.dom.elLegendWrap)
    gl.dom.Paper.add(gl.dom.elGraphical)
    gl.dom.elGraphical.add(gl.dom.elDefs)

    if (Utils.isIE()) {
      ClassListPolyfill.fnClassList()
    }
  }

  plotChartType (ser, xyRatios) {
    const w = this.w
    const cnf = w.config
    const gl = w.globals

    let lineSeries = {
      series: [],
      i: []
    }
    let areaSeries = {
      series: [],
      i: []
    }
    let columnSeries = {
      series: [],
      i: []
    }

    gl.series.map((series, st) => {
      // if user has specified a particular type for particular series
      if (typeof ser[st].type !== 'undefined') {
        if (ser[st].type === 'column' || ser[st].type === 'bar') {
          w.config.plotOptions.bar.horizontal = false // bar not supported in mixed charts
          columnSeries.series.push(series)
          columnSeries.i.push(st)
        } else if (ser[st].type === 'area') {
          areaSeries.series.push(series)
          areaSeries.i.push(st)
        } else if (ser[st].type === 'line') {
          lineSeries.series.push(series)
          lineSeries.i.push(st)
        } else {
          // user has specified type, but it is not valid (other than line/area/column)
          // make default to line
          lineSeries.series.push(series)
          lineSeries.i.push(st)
        }
        gl.comboCharts = true
      } else {
        lineSeries.series.push(series)
        lineSeries.i.push(st)
      }
    })

    let line = new Line(this.ctx, xyRatios)
    let pie = new Pie(this.ctx)
    let radialBar = new Radial(this.ctx)
    let elGraph = []

    if (gl.comboCharts) {
      if (areaSeries.series.length > 0) {
        elGraph.push(
          line.draw(areaSeries.series, 'area', areaSeries.i)
        )
      }
      if (columnSeries.series.length > 0) {
        let bar = new Bar(this.ctx, xyRatios)
        elGraph.push(bar.draw(columnSeries.series, columnSeries.i))
      }
      if (lineSeries.series.length > 0) {
        elGraph.push(
          line.draw(lineSeries.series, 'line', lineSeries.i)
        )
      }
    } else {
      switch (cnf.chart.type) {
        case 'line':
          elGraph = line.draw(gl.series, 'line')
          break
        case 'area':
          elGraph = line.draw(gl.series, 'area')
          break
        case 'bar':
          if (cnf.chart.stacked) {
            let barStacked = new BarStacked(this.ctx, xyRatios)
            elGraph = barStacked.draw(gl.series)
          } else {
            let bar = new Bar(this.ctx, xyRatios)
            elGraph = bar.draw(gl.series)
          }
          break
        case 'heatmap':
          let heatmap = new HeatMap(this.ctx, xyRatios)
          elGraph = heatmap.draw(gl.series)
          break
        case 'pie':
        case 'donut':
          elGraph = pie.draw(gl.series)
          break
        case 'radialBar':
          elGraph = radialBar.draw(gl.series)
          break
        default:
          elGraph = line.draw(gl.series)
      }
    }

    return elGraph
  }

  setSparkLineOptions () {
    const w = this.w
    const cnf = w.config

    if (w.config.chart.sparkline.enabled) {
      cnf.grid.show = false
      cnf.xaxis.labels.show = false
      cnf.legend.show = false
      cnf.chart.toolbar.show = false
      cnf.chart.zoom.enabled = false
      cnf.xaxis.tooltip.enabled = false
      cnf.xaxis.axisBorder.show = false
      for (const yaxe of cnf.yaxis) {
        yaxe.tooltip.enabled = false
        yaxe.labels.show = false
      }
      cnf.chart.scroller.enabled = false
      cnf.dataLabels.enabled = false
    }
  }

  setSVGDimensions () {
    let gl = this.w.globals
    let cnf = this.w.config

    gl.svgWidth = cnf.chart.width
    gl.svgHeight = cnf.chart.height

    let elDim = Utils.getDimensions(this.el)

    let widthUnit = cnf.chart.width.toString().split(/[0-9]+/g).pop()

    if (widthUnit === '%') {
      gl.svgWidth =
        (elDim[0] * parseInt(cnf.chart.width) / 100)
    } else if (widthUnit === 'px' || widthUnit === '') {
      gl.svgWidth = parseInt(cnf.chart.width)
    }

    if (gl.svgHeight !== 'auto' && gl.svgHeight !== '') {
      let heightUnit = cnf.chart.height.toString().split(/[0-9]+/g).pop()
      if (heightUnit === '%') {
        gl.svgHeight = elDim[1] * parseInt(cnf.chart.height) / 100
      } else {
        gl.svgHeight = parseInt(cnf.chart.height)
      }
    } else {
      if (gl.axisCharts) {
        gl.svgHeight = gl.svgWidth / 1.5
      } else {
        gl.svgHeight = gl.svgWidth
      }
    }

    Graphics.setAttrs(gl.dom.Paper.node, {
      width: gl.svgWidth,
      height: gl.svgHeight
    })

    // gl.dom.Paper.node.parentNode.parentNode.style.minWidth = gl.svgWidth + "px";
    let offsetY = cnf.chart.sparkline.enabled ? 0 : 14

    gl.dom.Paper.node.parentNode.parentNode.style.minHeight =
      gl.svgHeight + offsetY + 'px'

    gl.dom.elWrap.style.width = gl.svgWidth + 'px'
    gl.dom.elWrap.style.height = gl.svgHeight + 'px'
  }

  shiftGraphPosition () {
    let gl = this.w.globals

    let tY = gl.translateY
    let tX = gl.translateX

    let scalingAttrs = {
      transform: 'translate(' + tX + ', ' + tY + ')'
    }
    Graphics.setAttrs(gl.dom.elGraphical.node, scalingAttrs)
  }

  resetGlobals () {
    let gl = this.w.globals
    gl.series = []
    gl.seriesPercent = []
    gl.seriesX = []
    gl.seriesZ = []
    gl.seriesNames = []
    gl.seriesTotals = []
    gl.stackedSeriesTotals = []
    gl.labels = []
    gl.timelineLabels = []
    gl.noLabelsProvided = false
    gl.timescaleTicks = []
    gl.seriesXvalues = (() => {
      return this.w.config.series.map((s) => {
        return []
      })
    })()
    gl.seriesYvalues = (() => {
      return this.w.config.series.map((s) => {
        return []
      })
    })()
    gl.delayedElements = []
    gl.pointsArray = []
    gl.dataLabelsRects = []
    gl.dataXY = false
    gl.dataXYZ = false
    gl.maxY = -Number.MAX_VALUE
    gl.minY = Number.MIN_VALUE
    gl.minYArr = []
    gl.maxYArr = []
    gl.maxX = -Number.MAX_VALUE
    gl.minX = Number.MAX_VALUE
    gl.initialmaxX = -Number.MAX_VALUE
    gl.initialminX = Number.MAX_VALUE
    gl.maxDate = 0
    gl.minDate = Number.MAX_VALUE
    gl.minZ = Number.MAX_VALUE
    gl.maxZ = -Number.MAX_VALUE
    gl.yAxisScale = []
    gl.xAxisScale = null
    gl.xAxisTicksPositions = []
    gl.yLabelsCoords = []
    gl.yTitleCoords = []
    gl.xRange = 0
    gl.yRange = []
    gl.zRange = 0
    gl.dataPoints = 0
  }

  isMultipleY () {
    // user has supplied an array in yaxis property. So, turn on multipleYAxis flag
    if (this.w.config.yaxis.constructor === Array && this.w.config.yaxis.length > 1) {
      // first, turn off stacking if multiple y axis
      this.w.config.chart.stacked = false
      this.w.globals.isMultipleYAxis = true
      return true
    }
  }

  // Segregate user provided data into appropriate vars
  parseData (ser) {
    let w = this.w
    let cnf = w.config
    let gl = w.globals

    const sr = new Series(this.ctx)

    gl.ignoreYAxisIndexes = gl.collapsedSeries.map((collapsed, i) => {
      if (this.w.globals.isMultipleYAxis) {
        return collapsed.index
      }
    })

    // to determine whether data is in XY format or array format, we use original config
    const series = cnf.series.slice()
    const activeSeriesIndex = sr.getActiveConfigSeriesIndex()

    // given format is [{x, y}, {x, y}]
    const isFormatXY = () => {
      if (typeof series[activeSeriesIndex].data !== 'undefined' &&
      series[activeSeriesIndex].data.length > 0 &&
      series[activeSeriesIndex].data[0] !== null &&
        typeof series[activeSeriesIndex].data[0].x !== 'undefined' &&
        series[activeSeriesIndex].data[0] !== null) {
        return true
      }
    }

    // given format is [[x, y], [x, y]]
    const isFormat2DArray = () => {
      if (typeof series[activeSeriesIndex].data !== 'undefined' &&
      series[activeSeriesIndex].data.length > 0 &&
        typeof series[activeSeriesIndex].data[0] !== 'undefined' &&
        series[activeSeriesIndex].data[0] !== null &&
        series[activeSeriesIndex].data[0].constructor === Array) {
        return true
      }
    }

    const dt = new DateTime(this.ctx)

    let fallbackToCategory = false

    this.resetGlobals()
    this.isMultipleY()

    if (gl.axisCharts) {
      for (let i = 0; i < series.length; i++) {
        let twoDSeries = []
        let threeDSeries = []
        let twoDseriesX = []

        if (typeof series[i].data === 'undefined') {
          console.warn("It is a possibility that you may have not included 'data' property in series.")
          return
        }

        const isMultiFormat = () => {
          return isFormatXY() || isFormat2DArray()
        }

        if (isMultiFormat()) {
          if (isFormat2DArray()) {
            for (let j = 0; j < ser[i].data.length; j++) {
              if (typeof ser[i].data[j][1] !== 'undefined') {
                twoDSeries.push(ser[i].data[j][1])
              }
              if (cnf.xaxis.type !== 'datetime') {
                // if timestamps are provided and xaxis type is datettime,

                let ts = new Date(ser[i].data[j][0])
                ts = new Date(ts).getTime()
                twoDseriesX.push(ts)
              } else {
                twoDseriesX.push(ser[i].data[j][0])
              }
            }

            for (let j = 0; j < ser[i].data.length; j++) {
              if (typeof ser[i].data[j][2] !== 'undefined') {
                threeDSeries.push(ser[i].data[j][2])
                gl.dataXYZ = true
              }
            }
          } else if (isFormatXY()) {
            for (let j = 0; j < ser[i].data.length; j++) {
              if (typeof ser[i].data[j].y !== 'undefined') {
                twoDSeries.push(ser[i].data[j].y)
              }

              const isXString = typeof ser[i].data[j].x === 'string'
              const isXDate = dt.isValidDate(ser[i].data[j].x.toString())

              if (isXString || isXDate) {
                // user supplied '01/01/2017' or a date string (a JS date object is not supported)
                if (isXString) {
                  if (cnf.xaxis.type === 'datetime') {
                    twoDseriesX.push(new Date(ser[i].data[j].x).getTime())
                  } else {
                    // a category and not a numeric x value
                    fallbackToCategory = true
                    twoDseriesX.push((ser[i].data[j].x))
                  }
                } else if (isXDate) {
                  if (cnf.xaxis.type === 'datetime') {
                    twoDseriesX.push(new Date(ser[i].data[j].x.toString()).getTime())
                  } else {
                    twoDseriesX.push(parseInt(ser[i].data[j].x))
                  }
                } else {
                  fallbackToCategory = true
                  twoDseriesX.push(parseInt(ser[i].data[j].x))
                }
              } else {
                // a numeric value in x property
                twoDseriesX.push(ser[i].data[j].x)
              }
            }

            if (series[i].data[0] && typeof series[i].data[0].z !== 'undefined') {
              for (let t = 0; t < series[i].data.length; t++) {
                threeDSeries.push(series[i].data[t].z)
              }
              gl.dataXYZ = true
            }
          }

          gl.series.push(twoDSeries)
          gl.labels.push(twoDseriesX)
          gl.seriesX.push(twoDseriesX)

          if (!fallbackToCategory) {
            gl.dataXY = true
          }
        } else {
          if (cnf.xaxis.type === 'datetime') {
            // user didn't supplied [{x,y}] or [[x,y]], but single array in data.
            // Also labels were supplied differently
            gl.dataXY = true
            const dates = cnf.labels.length > 0 ? cnf.labels.slice() : cnf.xaxis.categories.slice()

            for (let j = 0; j < dates.length; j++) {
              if (typeof (dates[j]) === 'string') {
                let isDate = dt.isValidDate(dates[j])
                if (isDate) {
                  twoDseriesX.push(new Date(dates[j]).getTime())
                }
              }
            }

            gl.seriesX.push(twoDseriesX)
          }
          gl.labels.push(twoDseriesX)
          gl.series.push(ser[i].data)
        }
        gl.seriesZ.push(threeDSeries)

        // gl.series.push(ser[i].data)
        if (ser[i].name !== undefined) {
          gl.seriesNames.push(ser[i].name)
        } else {
          gl.seriesNames.push('series-' + parseInt(i + 1))
        }
      }
    } else {
      gl.series = ser.slice()
      gl.seriesNames = cnf.labels.slice()
      for (let i = 0; i < gl.series.length; i++) {
        if (gl.seriesNames[i] === undefined) {
          gl.seriesNames.push('series-' + (i + 1))
        }
      }
    }

    // maxValsInArrayIndex is the index of series[] which has the largest number of items
    gl.maxValsInArrayIndex = gl.series
      .map(function (a) {
        return a.length
      })
      .indexOf(
        Math.max.apply(
          Math,
          gl.series.map(function (a) {
            return a.length
          })
        )
      )

    // set Null values to 0 in all series when user hides/shows some series
    if (cnf.chart.type === 'bar' && cnf.chart.stacked) {
      const series = new Series(this.ctx)
      gl.series = series.setNullSeriesToZeroValues(gl.series)
    }

    this.getSeriesTotals()
    if (gl.axisCharts) {
      this.getStackedSeriesTotals()
    }

    this.getPercentSeries()

    // user didn't provide a [[x,y],[x,y]] series, but a named series
    if (!gl.dataXY) {
      // user provided labels in category axis
      if (cnf.xaxis.categories.length > 0) {
        gl.labels = cnf.xaxis.categories
      } else if (cnf.labels.length > 0) {
        gl.labels = cnf.labels.slice()
      } else if (fallbackToCategory) {
        gl.labels = gl.labels[0]
      } else {
        // user didn't provided labels, fallback to 1-2-3-4-5
        let labelArr = []
        if (gl.axisCharts) {
          for (let i = 0; i < gl.series[gl.maxValsInArrayIndex].length; i++) {
            labelArr.push(i + 1)
          }

          for (let i = 0; i < ser.length; i++) {
            gl.seriesX.push(labelArr)
          }

          gl.dataXY = true
        }

        // no series to pull labels from, put a 0-10 series
        if (labelArr.length === 0) {
          labelArr = [0, 10]
          for (let i = 0; i < ser.length; i++) {
            gl.seriesX.push(labelArr)
          }
        }

        gl.labels = labelArr
        gl.noLabelsProvided = true
      }
    }
  }

  /**
   * @memberof Core
   * returns the sum of all individual values in a multiple stacked series
   * Eg. w.globals.series = [[32,33,43,12], [2,3,5,1]]
   *  @return [34,36,48,13]
   **/
  getStackedSeriesTotals () {
    const w = this.w
    let total = []

    for (let i = 0; i < w.globals.series[w.globals.maxValsInArrayIndex].length; i++) {
      let t = 0
      for (let j = 0; j < w.globals.series.length; j++) {
        t += w.globals.series[j][i]
      }
      total.push(t)
    }
    w.globals.stackedSeriesTotals = total
  }

  // get total of the all values inside all series
  getSeriesTotalByIndex (index = null) {
    if (index === null) {
      // non-plot chart types - pie / donut / circle
      return this.w.config.series.reduce((acc, cur) => {
        return acc + cur
      })
    } else {
      // axis charts - supporting multiple series
      return this.w.config.series[index].data.reduce((acc, cur) => {
        return acc + cur
      })
    }
  }

  /**
   * @memberof Core
   * returns the sum of all values in a series
   * Eg. w.globals.series = [[32,33,43,12], [2,3,5,1]]
   *  @return [120, 11]
   **/
  getSeriesTotals () {
    const w = this.w

    w.globals.seriesTotals = w.globals.series.map((ser, index) => {
      let total = 0

      if (Array.isArray(ser)) {
        for (let j = 0; j < ser.length; j++) {
          total += ser[j]
        }
      } else {
        // for pie/donuts/gauges
        total += ser
      }

      return total
    })
  }

  getSeriesTotalsXRange (minX, maxX) {
    const w = this.w

    const seriesTotalsXRange = w.globals.series.map((ser, index) => {
      let total = 0

      for (let j = 0; j < ser.length; j++) {
        if (w.globals.seriesX[index][j] > minX && w.globals.seriesX[index][j] < maxX) {
          total += ser[j]
        }
      }

      return total
    })

    return seriesTotalsXRange
  }

  /**
   * @memberof Core
   * returns the percentage value of all individual values which can be used in a 100% stacked series
   * Eg. w.globals.series = [[32, 33, 43, 12], [2, 3, 5, 1]]
   *  @return [[94.11, 91.66, 89.58, 92.30], [5.88, 8.33, 10.41, 7.7]]
   **/
  getPercentSeries () {
    const w = this.w

    w.globals.seriesPercent = w.globals.series.map((ser, index) => {
      let seriesPercent = []
      if (Array.isArray(ser)) {
        for (let j = 0; j < ser.length; j++) {
          const total = w.globals.stackedSeriesTotals[j]
          let percent = (100 * ser[j]) / total
          seriesPercent.push(percent)
        }
      } else {
        const total = w.globals.seriesTotals.reduce((acc, val) => {
          return acc + val
        })
        let percent = (100 * ser) / total
        seriesPercent.push(percent)
      }

      return seriesPercent
    })
  }

  /*
   ** All the calculations for setting range in charts will be done here
   */
  coreCalculations () {
    const range = new Range(this.ctx, this.checkComboCharts)
    range.init()
  }

  getCalculatedRatios () {
    let gl = this.w.globals

    let yRatio = []
    let invertedYRatio = 0
    let xRatio = 0
    let initialXRatio = 0
    let invertedXRatio = 0
    let zRatio = 0
    let baseLineY = []
    let baseLineInvertedY = 0.1
    let baseLineX = 0

    gl.yRange = []
    if (gl.isMultipleYAxis) {
      for (let i = 0; i < gl.minYArr.length; i++) {
        gl.yRange.push(Math.abs(gl.minYArr[i] - gl.maxYArr[i]))
        baseLineY.push(0)
      }
    } else {
      gl.yRange.push(Math.abs(gl.minY - gl.maxY))
    }
    gl.xRange = Math.abs(gl.maxX - gl.minX)
    gl.zRange = Math.abs(gl.maxZ - gl.minZ)

    // multiple y axis
    for (let i = 0; i < gl.yRange.length; i++) {
      yRatio.push(gl.yRange[i] / gl.gridHeight)
    }

    xRatio = gl.xRange / gl.gridWidth
    initialXRatio = Math.abs(gl.initialmaxX - gl.initialminX) / gl.gridWidth

    invertedYRatio = gl.yRange / gl.gridWidth
    invertedXRatio = gl.xRange / gl.gridHeight
    zRatio = gl.zRange / gl.gridHeight * 16

    if (gl.minY !== Number.MIN_VALUE && Math.abs(gl.minY) !== 0) {
      // Negative numbers present in series
      gl.hasNegs = true
      baseLineY = []

      // baseline variables is the 0 of the yaxis which will be needed when there are negatives
      if (gl.isMultipleYAxis) {
        for (let i = 0; i < yRatio.length; i++) {
          baseLineY.push(-gl.minYArr[i] / yRatio[i])
        }
      } else {
        baseLineY.push(-gl.minY / yRatio[0])
      }

      baseLineInvertedY = -gl.minY / invertedYRatio // this is for bar chart
      baseLineX = gl.minX / xRatio
    } else {
      baseLineY.push(0)
    }

    return {
      yRatio,
      invertedYRatio,
      zRatio,
      xRatio,
      initialXRatio,
      invertedXRatio,
      baseLineInvertedY,
      baseLineY,
      baseLineX
    }
  }

  checkComboCharts () {
    let w = this.w
    let cnf = w.config

    cnf.series.map((series, st) => {
      if (typeof series.type !== 'undefined') {
        w.globals.comboCharts = true
      }
    })
  }

  drawAxis (type, xyRatios) {
    let gl = this.w.globals
    let cnf = this.w.config

    let xAxis = new XAxis(this.ctx)
    let yAxis = new YAxis(this.ctx)

    if (gl.axisCharts) {
      let elXaxis, elYaxis

      if (type === 'bar' && cnf.plotOptions.bar.horizontal) {
        elYaxis = yAxis.drawYaxisInversed(0)
        elXaxis = xAxis.drawXaxisInversed(0)

        gl.dom.elGraphical.add(elXaxis)
        gl.dom.elGraphical.add(elYaxis)
      } else {
        elXaxis = xAxis.drawXaxis()
        gl.dom.elGraphical.add(elXaxis)

        cnf.yaxis.map((yaxe, index) => {
          if (!gl.ignoreYAxisIndexes.includes(index)) {
            elYaxis = yAxis.drawYaxis(xyRatios, index)
            gl.dom.Paper.add(elYaxis)
          }
        })
      }
    }

    cnf.yaxis.map((yaxe, index) => {
      if (!gl.ignoreYAxisIndexes.includes(index)) {
        yAxis.yAxisTitleRotate(index, yaxe.opposite)
      }
    })
  }

  drawGrid () {
    let w = this.w

    let grid = new Grid(this.ctx)
    let xAxis = new XAxis(this.ctx)

    let gl = this.w.globals

    let elgrid = null

    if (gl.axisCharts) {
      if (w.config.grid.show) {
        // grid is drawn after xaxis and yaxis are drawn
        elgrid = grid.renderGrid()
        gl.dom.elGraphical.add(elgrid.el)

        grid.drawGridArea(elgrid.el)
      } else {
        let elgridArea = grid.drawGridArea()
        gl.dom.elGraphical.add(elgridArea)
      }

      if (elgrid !== null) {
        xAxis.xAxisLabelCorrections(elgrid.xAxisTickWidth)
      }
    }
  }

  // This mask will clip off overflowing graphics from the drawable area
  createGridMask () {
    let w = this.w
    const graphics = new Graphics(this.ctx)

    w.globals.dom.elGridRectMask = document.createElementNS(
      w.globals.svgNS,
      'clipPath'
    )
    w.globals.dom.elGridRectMask.setAttribute('id', `gridRectMask${w.globals.cuid}`)

    w.globals.dom.elGridRect = graphics.drawRect(0, 0, w.globals.gridWidth, w.globals.gridHeight + 1, 0, '#fff')
    w.globals.dom.elGridRectMask.appendChild(w.globals.dom.elGridRect.node)

    let defs = w.globals.dom.baseEl.querySelector('defs')
    defs.appendChild(w.globals.dom.elGridRectMask)
  }
}

module.exports = Core
