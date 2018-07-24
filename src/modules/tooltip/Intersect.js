import Utils from '../../utils/Utils'

/**
 * ApexCharts Tooltip.Intersect Class.
 *
 * @module Tooltip.Intersect
 **/

class Intersect {
  constructor (tooltipContext) {
    this.w = tooltipContext.w
    this.ttCtx = tooltipContext
  }

  getAttr = (e, attr) => {
    return parseFloat(e.target.getAttribute(attr))
  }

  handleHeatTooltip ({ e, opt, x, y }) {
    const ttCtx = this.ttCtx

    if (e.target.classList.contains('apexcharts-heatmap-rect')) {
      let i = this.getAttr(e, 'i')
      let j = this.getAttr(e, 'j')
      let cx = this.getAttr(e, 'cx')
      let cy = this.getAttr(e, 'cy')
      let width = this.getAttr(e, 'width')
      let height = this.getAttr(e, 'height')

      ttCtx.tooltipLabels.drawSeriesTexts({
        ttItems: opt.ttItems,
        i,
        j,
        shared: false
      })

      x = cx + (ttCtx.tooltipRect.ttWidth / 2) - width
      y = cy + (ttCtx.tooltipRect.ttHeight / 2) - height / 2

      if (ttCtx.w.config.tooltip.followCursor) {
        let elGrid = ttCtx.w.globals.dom.baseEl.querySelector(
          '.apexcharts-grid'
        )
        const seriesBound = elGrid.getBoundingClientRect()
        y = ttCtx.e.clientY - seriesBound.top
      }
    }

    return {
      x,
      y
    }
  }

  handleMarkerTooltip ({ e, opt, x, y }) {
    let w = this.w
    const ttCtx = this.ttCtx

    let i
    let j
    if (e.target.classList.contains('apexcharts-marker')) {
      let cx = parseInt(opt.paths.getAttribute('cx'))
      let cy = parseInt(opt.paths.getAttribute('cy'))
      let val = parseFloat(opt.paths.getAttribute('val'))

      j = parseInt(opt.paths.getAttribute('rel'))
      i = parseInt(opt.paths.parentNode.getAttribute('rel')) - 1

      if (ttCtx.intersect) {
        i = parseInt(
          Utils.findAncestor(
            opt.paths,
            'apexcharts-series'
          ).getAttribute('data:realIndex')
        )
      }

      ttCtx.tooltipLabels.drawSeriesTexts({
        ttItems: opt.ttItems,
        i,
        j,
        shared: ttCtx.intersect ? false : w.config.tooltip.shared
      })

      ttCtx.marker.enlargeCurrentPoint(j, opt.paths)

      // let dataPointsDividedWidth = w.globals.gridWidth/(w.globals.dataPoints + 1);

      x = cx
      y = cy - ttCtx.tooltipRect.ttHeight * 1.4

      if (ttCtx.w.config.tooltip.followCursor) {
        y = ttCtx.e.clientY - ttCtx.seriesBound.top
      }

      if (val < 0) {
        y = cy
      }
    }

    return {
      x,
      y
    }
  }

  handleBarTooltip ({ e, opt, x, y }) {
    const w = this.w
    const ttCtx = this.ttCtx

    let bx = 0
    let j = 0

    if (ttCtx.isBarHorizontal || !w.config.tooltip.shared) {
      let barXY = this.getBarTooltipXY({
        e,
        opt,
        x,
        y
      })
      x = barXY.x
      y = barXY.y
      j = barXY.j
      bx = x
    } else {
      if (!w.globals.comboCharts && !w.config.tooltip.shared) {
        bx = bx / 2
        ttCtx.tooltipPosition.moveXCrosshairs(bx, j)
      }
    }

    // y is NaN, make it touch the bottom of grid area
    if (isNaN(y)) {
      y = w.globals.svgHeight - ttCtx.tooltipRect.ttHeight
    }

    // y exceeds gridHeight
    // if (ttCtx.tooltipRect.ttHeight + y - 20 > w.globals.gridHeight) {
    //   y = w.globals.gridHeight - ttCtx.tooltipRect.ttHeight / 2
    // } else if (y < 0) {
    //   // y less than 0, touch the top of grid
    //   y = 0
    // }

    if (ttCtx.w.config.tooltip.followCursor) {
      y = ttCtx.e.clientY - ttCtx.seriesBound.top
    }

    // if tooltip is still null, querySelector
    if (ttCtx.tooltip === null) {
      ttCtx.tooltip = w.globals.dom.baseEl.querySelector(
        '.apexcharts-tooltip'
      )
    }

    if (!w.globals.comboCharts && !w.config.tooltip.shared) {
      ttCtx.tooltipPosition.moveXCrosshairs(bx)
    }

    // move tooltip here
    if (!w.config.tooltip.shared || ttCtx.isBarHorizontal) {
      ttCtx.tooltip.style.left = x + w.globals.translateX + 'px'
      ttCtx.tooltip.style.top = y + w.globals.translateY - ttCtx.tooltipRect.ttHeight / 2 + 'px'
    }
  }

  getBarTooltipXY ({ e, opt, x, y }) {
    let w = this.w
    let j = null
    const ttCtx = this.ttCtx

    if (e.target.classList.contains('apexcharts-bar-area')) {
      let bar = e.target
      let barRect = bar.getBoundingClientRect()

      let seriesBound = opt.elGrid.getBoundingClientRect()

      let bh = barRect.height
      let bw = barRect.width

      let cx = parseInt(bar.getAttribute('cx'))
      let cy = parseInt(bar.getAttribute('cy'))
      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX

      j = parseInt(bar.getAttribute('j'))
      let i = parseInt(bar.parentNode.getAttribute('rel')) - 1

      if (w.globals.comboCharts) {
        i = parseInt(bar.parentNode.getAttribute('data:realIndex'))
      }

      // if (w.config.tooltip.shared) {
      // this check not needed  at the moment
      //   const yDivisor = w.globals.gridHeight / (w.globals.series.length)
      //   const hoverY = ttCtx.clientY - ttCtx.seriesBound.top

      //   j = Math.ceil(hoverY / yDivisor)
      // }

      ttCtx.tooltipLabels.drawSeriesTexts({
        ttItems: opt.ttItems,
        i,
        j,
        shared: ttCtx.showOnIntersect ? false : w.config.tooltip.shared
      })

      if (w.config.tooltip.followCursor) {
        if (w.config.plotOptions.bar.horizontal) {
          x = clientX - seriesBound.left + 15
          y =
            cy -
            ttCtx.dataPointsDividedHeight +
            bh / 2 -
            ttCtx.tooltipRect.ttHeight / 2
        } else {
          if (w.globals.dataXY) {
            x = cx - bw / 2
          } else {
            x = cx - ttCtx.dataPointsDividedWidth + bw / 2
          }
          y = e.clientY - seriesBound.top - ttCtx.tooltipRect.ttHeight / 2 - 15
        }
      } else {
        if (w.config.plotOptions.bar.horizontal) {
          x = cx
          if (x < ttCtx.xyRatios.baseLineInvertedY) {
            x = cx - ttCtx.tooltipRect.ttWidth
          }

          y =
            cy -
            ttCtx.dataPointsDividedHeight +
            bh / 2 -
            ttCtx.tooltipRect.ttHeight / 2
        } else {
          // if columns
          if (w.globals.dataXY) {
            x = cx - bw / 2
          } else {
            x = cx - ttCtx.dataPointsDividedWidth + bw / 2
          }

          y = cy // - ttCtx.tooltipRect.ttHeight / 2 + 10
        }
      }
    }

    return {
      x,
      y,
      j
    }
  }
}

export default Intersect
