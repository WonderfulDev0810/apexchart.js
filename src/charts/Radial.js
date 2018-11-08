import Pie from './Pie'
import Utils from '../utils/Utils'
import Fill from '../modules/Fill'
import Graphics from '../modules/Graphics'
import Filters from '../modules/Filters'

/**
 * ApexCharts Radial Class for drawing Circle / Semi Circle Charts.
 * @module Radial
 **/

class Radial extends Pie {
  constructor (ctx) {
    super(ctx)

    this.ctx = ctx
    this.w = ctx.w
    this.animBeginArr = [0]
    this.animDur = 0

    const w = this.w
    this.startAngle = w.config.plotOptions.radialBar.startAngle
    this.endAngle = w.config.plotOptions.radialBar.endAngle

    this.trackStartAngle = w.config.plotOptions.radialBar.track.startAngle
    this.trackEndAngle = w.config.plotOptions.radialBar.track.endAngle

    this.radialDataLabels = w.config.plotOptions.radialBar.dataLabels

    if (!this.trackStartAngle) this.trackStartAngle = this.startAngle
    if (!this.trackEndAngle) this.trackEndAngle = this.endAngle

    if (this.endAngle === 360) this.endAngle = 359.99

    this.fullAngle = 360 - w.config.plotOptions.radialBar.endAngle - w.config.plotOptions.radialBar.startAngle

    this.margin = parseInt(w.config.plotOptions.radialBar.track.margin)
  }

  draw (series) {
    let w = this.w
    const graphics = new Graphics(this.ctx)

    let ret = graphics.group({
      class: 'apexcharts-radialbar'
    })

    let elSeries = graphics.group()

    let centerY = this.defaultSize / 2
    let centerX = w.globals.gridWidth / 2

    let size =
      this.defaultSize / 2.05 -
      w.config.stroke.width -
      w.config.chart.dropShadow.blur

    if (w.config.plotOptions.radialBar.size !== undefined) {
      size = w.config.plotOptions.radialBar.size
    }

    let colorArr = w.globals.fill.colors

    if (w.config.plotOptions.radialBar.track.show) {
      let elTracks = this.drawTracks({
        size,
        centerX,
        centerY,
        colorArr,
        series
      })
      elSeries.add(elTracks)
    }

    let elG = this.drawArcs({
      size,
      centerX,
      centerY,
      colorArr,
      series
    })

    elSeries.add(elG.g)

    if (w.config.plotOptions.radialBar.hollow.position === 'front') {
      elG.g.add(elG.elHollow)
      elG.g.add(elG.dataLabels)
    }

    ret.add(elSeries)

    return ret
  }

  drawTracks (opts) {
    let w = this.w
    const graphics = new Graphics(this.ctx)

    let g = graphics.group()

    let filters = new Filters(this.ctx)
    let fill = new Fill(this.ctx)

    let strokeWidth = this.getStrokeWidth(opts)

    opts.size = opts.size - strokeWidth / 2

    for (let i = 0; i < opts.series.length; i++) {
      let elRadialBarTrack = graphics.group({
        class: 'apexcharts-radialbar-track apexcharts-track'
      })
      g.add(elRadialBarTrack)

      elRadialBarTrack.attr({
        id: 'apexcharts-track-' + i,
        'rel': i + 1
      })

      opts.size = opts.size - strokeWidth - this.margin

      const trackConfig = w.config.plotOptions.radialBar.track
      let pathFill = fill.fillPath(elRadialBarTrack, {
        seriesNumber: 0,
        size: opts.size,
        fillColors: trackConfig.background,
        solid: true
      })

      let startAngle = this.trackStartAngle
      let endAngle = this.trackEndAngle

      if (Math.abs(endAngle) + Math.abs(startAngle) >= 360) endAngle = 360 - Math.abs(this.startAngle) - 0.1

      let elPath = graphics.drawPath({
        d: '',
        stroke: pathFill,
        strokeWidth: strokeWidth *
        parseInt(trackConfig.strokeWidth) /
        100,
        fill: 'none',
        strokeOpacity: trackConfig.opacity,
        classes: 'apexcharts-radialbar-area'
      })

      if (trackConfig.dropShadow.enabled) {
        const shadow = trackConfig.dropShadow
        filters.dropShadow(elPath, shadow)
      }

      elRadialBarTrack.add(elPath)

      elPath.attr('id', 'apexcharts-radialbarTrack-' + i)

      let pie = new Pie(this.ctx)
      pie.animatePaths(elPath, {
        centerX: opts.centerX,
        centerY: opts.centerY,
        endAngle,
        startAngle,
        size: opts.size,
        i,
        totalItems: 2,
        animBeginArr: 0,
        dur: 0,
        easing: w.globals.easing
      })
    }

    return g
  }

  drawArcs (opts) {
    let w = this.w

    let self = this
    // size, donutSize, centerX, centerY, colorArr, lineColorArr, sectorAngleArr, series

    let graphics = new Graphics(this.ctx)
    let fill = new Fill(this.ctx)
    let filters = new Filters(this.ctx)
    let g = graphics.group()

    let strokeWidth = this.getStrokeWidth(opts)
    opts.size = opts.size - strokeWidth / 2

    let hollowFillID = w.config.plotOptions.radialBar.hollow.background
    let hollowSize =
      opts.size -
      strokeWidth * opts.series.length -
      this.margin * opts.series.length -
      strokeWidth *
        parseInt(w.config.plotOptions.radialBar.track.strokeWidth) /
        100 /
        2

    let hollowRadius = hollowSize - w.config.plotOptions.radialBar.hollow.margin

    if (w.config.plotOptions.radialBar.hollow.image !== undefined) {
      hollowFillID = this.drawHollowImage(opts, g, hollowSize, hollowFillID)
    }

    let elHollow = this.drawHollow({
      size: hollowRadius,
      centerX: opts.centerX,
      centerY: opts.centerY,
      fill: hollowFillID
    })

    if (w.config.plotOptions.radialBar.hollow.dropShadow.enabled) {
      const shadow = w.config.plotOptions.radialBar.hollow.dropShadow
      filters.dropShadow(elHollow, shadow)
    }

    let shown = 1
    if (!this.radialDataLabels.total.show && w.globals.series.length > 1) {
      shown = 0
    }

    let dataLabels = this.renderDataLabels({
      hollowSize,
      centerX: opts.centerX,
      centerY: opts.centerY,
      opacity: shown
    })

    if (w.config.plotOptions.radialBar.hollow.position === 'back') {
      g.add(elHollow)
      g.add(dataLabels)
    }

    let reverseLoop = false
    if (w.config.plotOptions.radialBar.inverseOrder) {
      reverseLoop = true
    }

    for (let i = (reverseLoop ? opts.series.length - 1 : 0); (reverseLoop ? i >= 0 : i < opts.series.length) ; (reverseLoop ? i-- : i++)) {
      let elRadialBarArc = graphics.group({
        class: `apexcharts-series apexcharts-radial-series ${w.globals.seriesNames[i].toString().replace(/ /g, '-')}`
      })
      g.add(elRadialBarArc)

      elRadialBarArc.attr({
        id: 'apexcharts-series-' + i,
        'rel': i + 1
      })

      this.ctx.series.addCollapsedClassToSeries(elRadialBarArc, i)

      opts.size = opts.size - strokeWidth - this.margin

      let pathFill = fill.fillPath(elRadialBarArc, {
        seriesNumber: i,
        size: opts.size
      })

      let startAngle = this.startAngle
      let prevStartAngle

      const totalAngle = Math.abs(w.config.plotOptions.radialBar.endAngle - w.config.plotOptions.radialBar.startAngle)
      let endAngle = Math.round(totalAngle * Utils.negToZero(opts.series[i]) / 100) + this.startAngle

      let prevEndAngle
      if (w.globals.dataChanged) {
        prevStartAngle = this.startAngle
        prevEndAngle = Math.round(totalAngle * Utils.negToZero(w.globals.previousPaths[i]) / 100) + prevStartAngle
      }

      const currFullAngle = Math.abs(endAngle) + Math.abs(startAngle)
      if (currFullAngle >= 360) {
        endAngle = endAngle - 0.01
      }

      const prevFullAngle = Math.abs(prevEndAngle) + Math.abs(prevStartAngle)
      if (prevFullAngle >= 360) {
        prevEndAngle = prevEndAngle - 0.01
      }

      let angle = endAngle - startAngle

      const dashArray = Array.isArray(w.config.stroke.dashArray) ? w.config.stroke.dashArray[i] : w.config.stroke.dashArray

      let elPath = graphics.drawPath({
        d: '',
        stroke: pathFill,
        strokeWidth,
        fill: 'none',
        fillOpacity: w.config.fill.opacity,
        classes: 'apexcharts-radialbar-area',
        strokeDashArray: dashArray
      })

      Graphics.setAttrs(elPath.node, {
        'data:angle': angle,
        'data:value': opts.series[i]
      })

      if (w.config.chart.dropShadow.enabled) {
        const shadow = w.config.chart.dropShadow
        filters.dropShadow(elPath, shadow)
      }

      this.addListeners(elPath)

      elPath.node.addEventListener(
        'mouseenter',
        self.dataLabelsMouseIn.bind(this, elPath.node)
      )
      elPath.node.addEventListener(
        'mouseleave',
        self.dataLabelsMouseout.bind(this, elPath.node)
      )

      elRadialBarArc.add(elPath)

      elPath.attr('id', 'apexcharts-radialArc-' + i)

      let pie = new Pie(this.ctx)

      let dur = 0
      if (pie.initialAnim && !w.globals.resized && !w.globals.dataChanged) {
        dur = ((endAngle - startAngle) / 360) *
              w.config.chart.animations.speed

        this.animDur = dur / (opts.series.length * 1.2) + this.animDur
        this.animBeginArr.push(this.animDur)
      }

      if (w.globals.dataChanged) {
        dur =
            ((endAngle - startAngle) / 360) *
            w.config.chart.animations.dynamicAnimation.speed

        this.animDur = dur / (opts.series.length * 1.2) + this.animDur
        this.animBeginArr.push(this.animDur)
      }

      pie.animatePaths(elPath, {
        centerX: opts.centerX,
        centerY: opts.centerY,
        endAngle,
        startAngle,
        prevEndAngle,
        prevStartAngle,
        size: opts.size,
        i,
        totalItems: 2,
        animBeginArr: this.animBeginArr,
        dur: dur,
        shouldSetPrevPaths: true,
        easing: w.globals.easing
      })
    }

    return {
      g, elHollow, dataLabels
    }
  }

  drawHollow (opts) {
    const graphics = new Graphics(this.ctx)

    let circle = graphics.drawCircle(opts.size * 2)

    circle.attr({
      class: 'apexcharts-radialbar-hollow',
      cx: opts.centerX,
      cy: opts.centerY,
      r: opts.size,
      fill: opts.fill
    })

    return circle
  }

  drawHollowImage (opts, g, hollowSize, hollowFillID) {
    const w = this.w
    let fill = new Fill(this.ctx)

    let randID = (Math.random() + 1).toString(36).substring(4)
    let hollowFillImg = w.config.plotOptions.radialBar.hollow.image

    if (w.config.plotOptions.radialBar.hollow.imageClipped) {
      fill.clippedImgArea({
        width: hollowSize,
        height: hollowSize,
        image: hollowFillImg,
        patternID: `pattern${w.globals.cuid}${randID}`
      })
      hollowFillID = `url(#pattern${w.globals.cuid}${randID})`
    } else {
      const imgWidth = w.config.plotOptions.radialBar.hollow.imageWidth
      const imgHeight = w.config.plotOptions.radialBar.hollow.imageHeight
      if (imgWidth === undefined && imgHeight === undefined) {
        let image = w.globals.dom.Paper.image(hollowFillImg).loaded(function (loader) {
          this.move(
            opts.centerX - loader.width / 2 + w.config.plotOptions.radialBar.hollow.imageOffsetX,
            opts.centerY - loader.height / 2 + w.config.plotOptions.radialBar.hollow.imageOffsetY
          )
        })
        g.add(image)
      } else {
        let image = w.globals.dom.Paper.image(hollowFillImg).loaded(function (loader) {
          this.move(
            opts.centerX - imgWidth / 2 + w.config.plotOptions.radialBar.hollow.imageOffsetX,
            opts.centerY - imgHeight / 2 + w.config.plotOptions.radialBar.hollow.imageOffsetY
          )
          this.size(imgWidth, imgHeight)
        })
        g.add(image)
      }
    }
    return hollowFillID
  }

  /**
   * This static method allows users to call chart methods without necessarily from the
   * instance of the chart in case user has assigned chartID to the targetted chart.
   * The chartID is used for mapping the instance stored in Apex._chartInstances global variable
   *
   * This is helpful in cases when you don't have reference of the chart instance
   * easily and need to call the method from anywhere.
   * For eg, in React/Vue applications when you have many parent/child components,
   * and need easy reference to other charts for performing dynamic operations
   *
   * @param {string} name - The name of the series
   * @param {string} val - The value of that series
   * @param {object} el - Optional el (indicates which series was hovered). If this param is not present, means we need to show total
   */
  printLabels (name, val, el) {
    const w = this.w

    let labelColor

    if (el) {
      if (this.radialDataLabels.name.color === undefined) {
        labelColor =
          w.globals.colors[parseInt(el.parentNode.getAttribute('rel')) - 1]
      } else {
        labelColor = this.radialDataLabels.name.color
      }
    } else {
      if (w.globals.series.length > 1 && this.radialDataLabels.total.show) {
        labelColor = this.radialDataLabels.total.color
      }
    }

    let elLabel = w.globals.dom.baseEl.querySelector(
      '.apexcharts-datalabel-label'
    )
    let elValue = w.globals.dom.baseEl.querySelector(
      '.apexcharts-datalabel-value'
    )

    let lbFormatter = this.radialDataLabels.value.formatter
    val = lbFormatter(val, w)

    // we need to show Total Val - so get the formatter of it
    if (!el && typeof this.radialDataLabels.total.formatter === 'function') {
      val = this.radialDataLabels.total.formatter(w)
    }

    if (elLabel !== null) {
      elLabel.textContent = name
    }

    if (elValue !== null) {
      elValue.textContent = val
    }
    if (elLabel !== null) {
      elLabel.style.fill = labelColor
    }
  }

  dataLabelsMouseIn (el) {
    let w = this.w

    let val = el.getAttribute('data:value')
    let name = w.globals.seriesNames[parseInt(el.parentNode.getAttribute('rel')) - 1]

    this.printLabels(name, val, el)

    let dataLabelsGroup = w.globals.dom.baseEl.querySelector(
      '.apexcharts-datalabels-group'
    )
    if (dataLabelsGroup !== null) {
      dataLabelsGroup.style.opacity = 1
    }
  }

  dataLabelsMouseout (el) {
    let w = this.w
    let dataLabelsGroup = w.globals.dom.baseEl.querySelector(
      '.apexcharts-datalabels-group'
    )
    if (
      this.radialDataLabels.total.show && w.globals.series.length > 1
    ) {
      this.printLabels(this.radialDataLabels.total.label, this.radialDataLabels.total.formatter(w))
    } else {
      if (dataLabelsGroup !== null) {
        dataLabelsGroup.style.opacity = 0
      }
    }
  }

  getStrokeWidth (opts) {
    const w = this.w
    return opts.size *
    (100 - parseInt(w.config.plotOptions.radialBar.hollow.size)) /
    100 /
    (opts.series.length + 1) - this.margin
  }

  renderDataLabels (opts) {
    let w = this.w
    const graphics = new Graphics(this.ctx)

    let g = graphics.group({
      class: 'apexcharts-datalabels-group'
    })

    g.node.style.opacity = opts.opacity

    let x = opts.centerX
    let y = opts.centerY

    let labelColor, valueColor

    if (this.radialDataLabels.name.color === undefined) {
      labelColor = w.globals.colors[0]
    } else {
      labelColor = this.radialDataLabels.name.color
    }

    if (w.globals.series.length > 1 && this.radialDataLabels.total.show) {
      labelColor = this.radialDataLabels.total.color
    }

    if (this.radialDataLabels.value.color === undefined) {
      valueColor = w.config.chart.foreColor
    } else {
      valueColor = this.radialDataLabels.value.color
    }

    let lbFormatter = this.radialDataLabels.value.formatter
    let val = lbFormatter(w.globals.series[0], w)

    if (this.radialDataLabels.name.show) {
      let elLabel = graphics.drawText({
        x: x,
        y: y + parseInt(this.radialDataLabels.name.offsetY),
        text: w.globals.seriesNames[0],
        textAnchor: 'middle',
        foreColor: labelColor,
        fontSize: this.radialDataLabels.name.fontSize,
        fontFamily: this.radialDataLabels.name.fontFamily
      })
      elLabel.node.classList.add('apexcharts-datalabel-label')
      g.add(elLabel)
    }

    if (this.radialDataLabels.value.show) {
      let valOffset = this.radialDataLabels.name.show ? parseInt(this.radialDataLabels.value.offsetY) + 16 : (this.radialDataLabels.value.offsetY)

      let elValue = graphics.drawText({
        x: x,
        y: y + valOffset,
        text: val,
        textAnchor: 'middle',
        foreColor: valueColor,
        fontSize: this.radialDataLabels.value.fontSize,
        fontFamily: this.radialDataLabels.value.fontFamily
      })
      elValue.node.classList.add('apexcharts-datalabel-value')
      g.add(elValue)
    }

    // for a multi-series circle chart, we need to show total value instead of first series labels
    this.dataLabelsMouseout()

    return g
  }
}

export default Radial
