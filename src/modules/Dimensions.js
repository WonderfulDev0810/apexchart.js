import Graphics from './Graphics'
import Formatters from '../modules/Formatters'
import Utils from './../utils/Utils'
import YAxis from './axes/YAxis'

/**
 * ApexCharts Dimensions Class for calculating rects of all elements that are drawn and will be drawn.
 *
 * @module Dimensions
 **/

class Dimensions {
  constructor (ctx) {
    this.ctx = ctx
    this.w = ctx.w
    this.lgRect = {}
    this.yAxisWidth = 0
    this.xAxisHeight = 0

    this.isBarHorizontal = !!((this.w.config.chart.type === 'bar' &&
      this.w.config.plotOptions.bar.horizontal))
  }

  /**
   * @memberof Dimensions
   * @param {object} w - chart context
   **/
  plotCoords () {
    let w = this.w
    let gl = w.globals

    // if user specified a type in series too, turn on comboCharts flag
    if (w.config.series.length && typeof w.config.series[0].type !== 'undefined') {
      w.globals.comboCharts = true
    }

    let lgRect = this.getLegendsRect()

    if (gl.axisCharts) {
      // for line / area / scatter / column
      this.setGridCoordsForAxisCharts(lgRect)
    } else {
      // for pie / donuts / circle
      this.setGridCoordsForNonAxisCharts(lgRect)
    }

    this.titleSubtitleOffset()
  }

  setGridCoordsForAxisCharts (lgRect) {
    let w = this.w
    let gl = w.globals

    let xPad = 0

    let xtitleCoords = {
      width: 0,
      height: 0
    }
    let ytitleCoords = []
    let yaxisLabelCoords = {
      width: 0,
      height: 0
    }
    let xaxisLabelCoords = {
      width: 0,
      height: 0
    }

    yaxisLabelCoords = this.getyAxisLabelsCoords()
    xaxisLabelCoords = this.getxAxisLabelsCoords()

    if (w.globals.timelineLabels.length > 0) {
      xaxisLabelCoords = this.getxAxisTimeScaleLabelsCoords()
    }

    xtitleCoords = this.getxAxisTitleCoords()
    ytitleCoords = this.getyAxisTitleCoords()

    if (
      this.isBarHorizontal
    ) {
      // move x with y for horizontal bars
      // let tempObj = Object.assign({}, yaxisLabelCoords)
      // yaxisLabelCoords = Object.assign({}, xaxisLabelCoords)
      // xaxisLabelCoords = Object.assign({}, tempObj)
    }

    // no x labels, make w=0,h=0
    if (!w.config.xaxis.labels.show) {
      xaxisLabelCoords = {
        height: 0,
        width: 0
      }
    }

    w.globals.yLabelsCoords = []
    w.globals.yTitleCoords = []
    w.config.yaxis.map((yaxe, index) => {
      // store the labels and titles coords in global vars
      w.globals.yLabelsCoords.push({
        width: yaxisLabelCoords[index].width,
        index
      })
      w.globals.yTitleCoords.push({
        width: ytitleCoords[index].width,
        index
      })
    })

    this.xAxisHeight = (xaxisLabelCoords.height + xtitleCoords.height) * w.globals.lineHeightRatio + 15

    this.xAxisWidth = xaxisLabelCoords.width

    if (
      this.xAxisHeight - xtitleCoords.height >
      w.config.xaxis.labels.maxHeight
    ) {
      this.xAxisHeight = w.config.xaxis.labels.maxHeight
    }

    if (w.config.xaxis.floating) {
      this.xAxisHeight = 0
    }

    gl.xAxisLabelsHeight = this.xAxisHeight

    gl.translateXAxisY = w.globals.rotateXLabels ? this.xAxisHeight / 8 : -4
    gl.translateXAxisX = w.globals.rotateXLabels &&
      w.globals.dataXY &&
      w.config.xaxis.labels.rotate <= -45
      ? -this.xAxisWidth / 4
      : 0

    if (
      this.isBarHorizontal
    ) {
      gl.rotateXLabels = false
      gl.translateXAxisY = -1 * (parseInt(w.config.xaxis.labels.style.fontSize) / 1.5)
    }

    gl.translateXAxisY = gl.translateXAxisY + w.config.xaxis.labels.offsetY
    gl.translateXAxisX = gl.translateXAxisX + w.config.xaxis.labels.offsetX

    if (!this.isBarHorizontal) {
      this.yAxisWidth = this.getTotalYAxisWidth()
    } else {
      this.yAxisWidth = w.globals.yLabelsCoords[0].width + w.globals.yTitleCoords[0].width + 15
      if (this.yAxisWidth > w.config.yaxis[0].labels.maxWidth) {
        this.yAxisWidth = w.config.yaxis[0].labels.maxWidth
      }
    }

    let yAxisWidth = this.yAxisWidth
    let xAxisHeight = this.xAxisHeight
    let translateY = 10

    if (!w.config.grid.show) {
      yAxisWidth = 0
      xAxisHeight = 35
    }

    if (w.config.chart.sparkline.enabled) {
      lgRect = {
        height: 0,
        width: 0
      }
      xPad = 0
      xAxisHeight = 0
      yAxisWidth = 0
      translateY = 0
    }

    switch (w.config.legend.position) {
      case 'bottom':
        gl.translateY = translateY
        gl.translateX = yAxisWidth
        gl.gridHeight = gl.svgHeight - lgRect.height - xAxisHeight - (w.globals.rotateXLabels ? 10 : 15)
        gl.gridWidth = gl.svgWidth - xPad - yAxisWidth
        break
      case 'top':
        gl.translateY = lgRect.height + translateY
        gl.translateX = yAxisWidth
        gl.gridHeight = gl.svgHeight - lgRect.height - xAxisHeight - (w.globals.rotateXLabels ? 10 : 15)
        gl.gridWidth = gl.svgWidth - xPad - yAxisWidth
        break
      case 'left':
        gl.translateY = translateY
        gl.translateX = lgRect.width + yAxisWidth
        gl.gridHeight = gl.svgHeight - xAxisHeight
        gl.gridWidth = gl.svgWidth - lgRect.width - xPad - yAxisWidth
        break
      case 'right':
        gl.translateY = translateY
        gl.translateX = yAxisWidth
        gl.gridHeight = gl.svgHeight - xAxisHeight
        gl.gridWidth = gl.svgWidth - lgRect.width - xPad - yAxisWidth
        break
      default:
        gl.translateY = translateY
        gl.translateX = yAxisWidth
        gl.gridHeight = gl.svgHeight - lgRect.height - xAxisHeight
        gl.gridWidth = gl.svgWidth - xPad
        break
    }

    let scrollerHeight = 0
    if (w.config.chart.scroller.enabled && w.globals.dataXY) {
      scrollerHeight = w.config.chart.scroller.height
    }

    gl.gridHeight = gl.gridHeight -
      w.config.grid.padding.top -
      w.config.grid.padding.bottom -
      scrollerHeight

    gl.gridWidth = gl.gridWidth - w.config.grid.padding.left - w.config.grid.padding.right

    gl.translateX = gl.translateX + w.config.grid.padding.left
    gl.translateY = gl.translateY + w.config.grid.padding.top

    if (!this.isBarHorizontal) {
      this.setGridXPosForDualYAxis(ytitleCoords, yaxisLabelCoords)
    }

    // after drawing everything, set the Y axis positions
    this.setYAxisXPosition(yaxisLabelCoords, ytitleCoords)
  }

  setGridCoordsForNonAxisCharts (lgRect) {
    let w = this.w
    let gl = w.globals
    let xPad =
      w.config.legend.markers.size * 4 + w.config.legend.itemMargin.horizontal

    let offY = 15

    if (w.config.chart.type === 'pie' || w.config.chart.type === 'donut') {
      offY = offY + w.config.plotOptions.pie.offsetY
    } else if (w.config.chart.type === 'radialBar') {
      offY = offY + w.config.plotOptions.radialBar.offsetY
    }

    switch (w.config.legend.position) {
      case 'bottom':
        gl.gridHeight = gl.svgHeight - lgRect.height - 35
        gl.gridWidth = gl.gridHeight

        gl.translateY = offY
        gl.translateX = (gl.svgWidth - gl.gridWidth) / 2
        break
      case 'top':
        gl.gridHeight = gl.svgHeight - lgRect.height - 35
        gl.gridWidth = gl.gridHeight

        gl.translateY = lgRect.height + offY
        gl.translateX = (gl.svgWidth - gl.gridWidth) / 2
        break
      case 'left':
        gl.gridWidth = gl.svgWidth - lgRect.width - xPad
        gl.gridHeight = gl.gridWidth
        gl.translateY = offY
        gl.translateX = lgRect.width + xPad

        break
      case 'right':
        gl.gridWidth = gl.svgWidth - lgRect.width - xPad
        gl.gridHeight = gl.gridWidth
        gl.translateY = offY
        gl.translateX = 5

        break
      default:
        gl.gridHeight = gl.svgHeight - lgRect.height - 30
        gl.gridWidth = gl.gridHeight

        gl.translateY = offY
        gl.translateX = (gl.svgWidth - gl.gridWidth) / 2
        break
    }
  }

  setGridXPosForDualYAxis (ytitleCoords, yaxisLabelCoords) {
    let w = this.w
    // if(w.config.yaxis.length > 1) {
    w.config.yaxis.map((yaxe, index) => {
      if (!w.globals.ignoreYAxisIndexes.includes(index) && !w.config.yaxis[index].floating) {
        if (yaxe.opposite) {
          w.globals.translateX = w.globals.translateX - (yaxisLabelCoords[index].width + ytitleCoords[index].width) - (parseInt(w.config.yaxis[index].labels.style.fontSize) / 1.2)
        }
      }
    })
    // }
  }

  titleSubtitleOffset () {
    const w = this.w
    const gl = w.globals
    let gridShrinkOffset = 10

    if (w.config.title.text !== undefined) {
      gridShrinkOffset += w.config.title.margin
    } else {
      gridShrinkOffset += 5
    }

    if (w.config.subtitle.text !== undefined) {
      gridShrinkOffset += w.config.subtitle.margin
    } else {
      gridShrinkOffset += 5
    }

    if (w.config.legend.show && w.config.legend.position === 'bottom' && !w.config.legend.floating && w.config.series.length > 1) {
      gridShrinkOffset += 10
    }

    let titleCoords = this.getMainTitleCoords()
    let subtitleCoords = this.getSubTitleCoords()

    gl.gridHeight = gl.gridHeight - titleCoords.height - subtitleCoords.height - gridShrinkOffset

    gl.translateY = gl.translateY + titleCoords.height + subtitleCoords.height + gridShrinkOffset
  }

  getTotalYAxisWidth () {
    let w = this.w
    let yAxisWidth = 0

    w.globals.yLabelsCoords.map((yLabelCoord, index) => {
      let floating = w.config.yaxis[index].floating
      if (yLabelCoord.width > 0 && !floating) {
        yAxisWidth = yAxisWidth + yLabelCoord.width
        if (w.globals.ignoreYAxisIndexes.includes(index)) {
          yAxisWidth = yAxisWidth - yLabelCoord.width
        }
      } else {
        yAxisWidth = yAxisWidth + (floating ? 0 : 5)
      }
    })

    w.globals.yTitleCoords.map((yTitleCoord, index) => {
      let floating = w.config.yaxis[index].floating
      if (yTitleCoord.width > 0 && !floating) {
        yAxisWidth = yAxisWidth + yTitleCoord.width + (parseInt(w.config.yaxis[index].title.style.fontSize))
        if (w.globals.ignoreYAxisIndexes.includes(index)) {
          yAxisWidth = yAxisWidth - yTitleCoord.width
        }
      } else {
        yAxisWidth = yAxisWidth + (floating ? 0 : 5)
      }
    })

    return yAxisWidth
  }

  getxAxisTimeScaleLabelsCoords () {
    let w = this.w

    let timescaleLabels = w.globals.timelineLabels.slice()

    let labels = timescaleLabels.map(label => {
      return label.value
    })

    //  get the longest string from the labels array and also apply label formatter to it
    let val = labels.reduce(function (a, b) {
      // if undefined, maybe user didn't pass the datetime(x) values
      if (typeof a === 'undefined') {
        throw new Error('You have possibly supplied invalid Date format. Please supply a valid JavaScript Date')
      }
      return a.length > b.length ? a : b
    })

    let graphics = new Graphics(this.ctx)
    let virtualText = graphics.drawText({
      x: -200,
      y: -200,
      text: val,
      textAnchor: 'start',
      fontSize: w.config.xaxis.labels.style.fontSize,
      foreColor: '#fff',
      opacity: 0
    })

    w.globals.dom.Paper.add(virtualText)

    let rect = virtualText.node.getBoundingClientRect()

    let totalWidthRotated = (rect.width * 1.05) * labels.length

    if (
      totalWidthRotated > w.globals.gridWidth && w.config.xaxis.labels.rotate !== 0
    ) {
      w.globals.overlappingXLabels = true
    } else {
      w.globals.overlappingXLabels = true
    }

    virtualText.node.parentNode.removeChild(virtualText.node)

    return {
      width: rect.width,
      height: rect.height
    }
  }

  /**
   * Get X Axis Dimensions
   * @memberof Dimensions
   * @return {{width, height}}
   **/
  getxAxisLabelsCoords () {
    let w = this.w

    let xaxisLabels = w.globals.labels.slice()

    let lgWidthForSideLegends = w.config.legend.position === 'left' && w.config.legend.position === 'right' && !w.config.legend.floating ? this.lgRect.width : 0

    //  get the longest string from the labels array and also apply label formatter to it
    let val = xaxisLabels.reduce(function (a, b) {
      return a.length > b.length ? a : b
    })

    let xlbFormatter = w.globals.xLabelFormatter

    let xFormat = new Formatters(this.ctx)
    val = xFormat.xLabelFormat(xlbFormatter, val)

    let graphics = new Graphics(this.ctx)
    let virtualText = graphics.drawText({
      x: -200,
      y: -200,
      text: val,
      textAnchor: 'start',
      fontSize: w.config.xaxis.labels.style.fontSize,
      foreColor: '#fff',
      opacity: 0
    })

    w.globals.dom.Paper.add(virtualText)

    let xLabelrect = virtualText.node.getBoundingClientRect()

    let rect = {
      width: xLabelrect.width,
      height: xLabelrect.height
    }

    if (
      rect.width * xaxisLabels.length >
      w.globals.svgWidth - lgWidthForSideLegends - this.yAxisWidth &&
      w.config.xaxis.labels.rotate !== 0
    ) {
      if (!this.isBarHorizontal) {
        w.globals.rotateXLabels = true
        virtualText.attr(
          'transform',
          `rotate(${w.config.xaxis.labels.rotate} 0 0)`
        )

        xLabelrect = virtualText.node.getBoundingClientRect()
        rect.height = xLabelrect.height / 1.65
      }
    } else {
      w.globals.rotateXLabels = false
    }

    virtualText.node.parentNode.removeChild(virtualText.node)

    return {
      width: rect.width,
      height: rect.height
    }
  }

  setYAxisXPosition (yaxisLabelCoords, ytitleCoords) {
    let w = this.w

    let xLeft = 0
    let xRight = 0
    let leftDrawnYs = 0 // already drawn y axis on left side
    let rightDrawnYs = 4 // already drawn y axis on right side
    let multipleYPadd = 5
    this.multipleYs = false

    if (w.config.yaxis.length > 1) {
      this.multipleYs = true
    }

    w.config.yaxis.map((yaxe, index) => {
      let yAxisWidth = (yaxisLabelCoords[index].width + ytitleCoords[index].width)

      let objyAxis = new YAxis(this.ctx)

      let paddingForYAxisTitle = objyAxis.xPaddingForYAxisTitle(index, {
        width: yaxisLabelCoords[index].width
      }, {
        width: ytitleCoords[index].width
      }, yaxe.opposite)

      if (w.config.yaxis.length > 1) {
        // multiple yaxis
        yAxisWidth = yAxisWidth + Math.abs(paddingForYAxisTitle.padd)
      } else {
        // just a single y axis in axis chart
        if (yaxe.title.text === undefined) {
          yAxisWidth = yAxisWidth + Math.abs(paddingForYAxisTitle.padd) + 15
        } else {
          yAxisWidth = yAxisWidth + Math.abs(paddingForYAxisTitle.padd)
        }
      }

      if (!yaxe.opposite) {
        // left side y axis
        let offset = yAxisWidth
        if (w.globals.ignoreYAxisIndexes.includes(index)) {
          offset = 0
        }

        if (this.multipleYs) {
          xLeft = w.globals.translateX - yAxisWidth - leftDrawnYs + multipleYPadd + (parseInt(w.config.yaxis[index].labels.style.fontSize) / 1.2) + yaxe.labels.offsetX + 5
        } else {
          xLeft = w.globals.translateX - yAxisWidth + yaxisLabelCoords[index].width + yaxe.labels.offsetX + 2
        }

        leftDrawnYs = leftDrawnYs + offset
        w.globals.translateYAxisX[index] = xLeft
      } else {
        // right side y axis
        xRight = w.globals.gridWidth + (w.globals.translateX) + rightDrawnYs + 26 + (w.globals.series.length - w.globals.collapsedSeries.length)

        rightDrawnYs = rightDrawnYs + yAxisWidth
        w.globals.translateYAxisX[index] = xRight - yaxe.labels.offsetX
      }

      // w.globals.yAxisWidths.push(yAxisWidth)
    })
  }

  /**
   * Get Y Axis Dimensions
   * @memberof Dimensions
   * @return {{width, height}}
   **/
  getyAxisLabelsCoords () {
    let w = this.w

    let width = 0
    let height = 0
    let ret = []
    let labelPad = 10

    w.config.yaxis.map((yaxe, index) => {
      if (yaxe.labels.show && w.globals.yAxisScale[index].result.length) {
        let lbFormatter = w.globals.yLabelFormatters[index]
        let val = lbFormatter(w.globals.yAxisScale[index].niceMax)

        if (this.isBarHorizontal) {
          labelPad = 0

          let barYaxisLabels = w.globals.labels.slice()

          //  get the longest string from the labels array and also apply label formatter to it
          val = barYaxisLabels.reduce(function (a, b) {
            return a.length > b.length ? a : b
          })

          val = lbFormatter(val)
        }

        let graphics = new Graphics(this.ctx)
        let virtualText = graphics.drawText({
          x: 0,
          y: 0,
          text: val,
          textAnchor: 'start',
          fontSize: yaxe.labels.style.fontSize,
          foreColor: '#fff',
          opacity: 0
        })

        w.globals.dom.Paper.add(virtualText)

        let rect = virtualText.node.getBoundingClientRect()

        virtualText.node.parentNode.removeChild(virtualText.node)

        ret.push({
          width: rect.width + labelPad,
          height: rect.height
        })
      } else {
        ret.push({
          width,
          height
        })
      }
    })

    return ret
  }

  /**
   * Get X Axis Title Dimensions
   * @memberof Dimensions
   * @return {{width, height}}
   **/
  getxAxisTitleCoords () {
    let w = this.w
    let width = 0
    let height = 0

    if (w.config.xaxis.title.text !== undefined) {
      let graphics = new Graphics(this.ctx)
      let virtualText = graphics.drawText({
        x: 0,
        y: 0,
        text: w.config.xaxis.title.text,
        textAnchor: 'start',
        fontSize: w.config.xaxis.title.style.fontSize,
        foreColor: '#fff',
        opacity: 0
      })

      w.globals.dom.Paper.add(virtualText)

      let rect = virtualText.node.getBoundingClientRect()

      width = rect.width
      height = rect.height

      virtualText.node.parentNode.removeChild(virtualText.node)
    }

    return {
      width: width,
      height: height
    }
  }

  /**
   * Get Y Axis Dimensions
   * @memberof Dimensions
   * @return {{width, height}}
   **/
  getyAxisTitleCoords () {
    let w = this.w
    let ret = []

    w.config.yaxis.map((yaxe, index) => {
      if (yaxe.title.text !== undefined) {
        let graphics = new Graphics(this.ctx)
        let virtualText = graphics.drawText({
          x: 0,
          y: 0,
          text: yaxe.title.text,
          textAnchor: 'middle',
          fontSize: yaxe.title.style.fontSize,
          foreColor: '#fff',
          opacity: 0
        })

        virtualText.attr('transform', `rotate(-90 0 0)`)

        w.globals.dom.Paper.add(virtualText)

        let rect = virtualText.node.getBoundingClientRect()

        ret.push({
          width: rect.width,
          height: rect.height
        })

        virtualText.node.parentNode.removeChild(virtualText.node)
      } else {
        ret.push({
          width: 0,
          height: 0
        })
      }
    })

    return ret
  }

  /**
   * Get Chart Title Dimensions
   * @memberof Dimensions
   * @return {{width, height}}
   **/
  getMainTitleCoords () {
    let w = this.w
    let width = 0
    let height = 0

    let elTitle = w.globals.dom.baseEl.querySelector(
      '.apexcharts-title-text'
    )

    if (elTitle !== null && !w.config.title.floating) {
      let titleCoords = elTitle.getBoundingClientRect()
      width = titleCoords.width
      height = titleCoords.height + 5
    }

    return {
      width,
      height
    }
  }

  /**
   * Get Chart Title Dimensions
   * @memberof Dimensions
   * @return {{width, height}}
   **/
  getSubTitleCoords () {
    let w = this.w
    let width = 0
    let height = 0

    let elSubTitle = w.globals.dom.baseEl.querySelector(
      '.apexcharts-subtitle-text'
    )

    if (elSubTitle !== null && !w.config.subtitle.floating) {
      let subtitleCoords = elSubTitle.getBoundingClientRect()
      width = subtitleCoords.width
      height = subtitleCoords.height + 5
    }

    return {
      width,
      height
    }
  }

  getLegendsRect () {
    let w = this.w

    let elLegendWrap = w.globals.dom.baseEl.querySelector(
      '.apexcharts-legend'
    )
    let lgRect = Object.assign({}, Utils.getBoundingClientRect(elLegendWrap))

    lgRect.height = lgRect.height + w.config.legend.containerMargin.top + w.config.legend.containerMargin.bottom
    lgRect.width = lgRect.width + w.config.legend.containerMargin.left + w.config.legend.containerMargin.right

    if (elLegendWrap !== null && !w.config.legend.floating) {
      this.lgRect = lgRect
    } else {
      this.lgRect = {
        x: 0,
        y: 0,
        height: 0,
        width: 0
      }
    }

    return this.lgRect
  }
}

module.exports = Dimensions
