import Formatters from '../Formatters'
import Utils from './Utils'

/**
 * ApexCharts Tooltip.Labels Class to draw texts on the tooltip.
 *
 * @module Tooltip.Labels
 **/

class Labels {
  constructor (tooltipContext) {
    this.w = tooltipContext.w
    this.ctx = tooltipContext.ctx
    this.ttCtx = tooltipContext
    this.tooltipUtil = new Utils(tooltipContext)
  }

  drawSeriesTexts ({
    shared = true,
    ttItems,
    i = 0,
    j = null
  }) {
    let w = this.w

    if (w.config.tooltip.custom !== undefined) {
      this.handleCustomTooltip()
      return
    }

    this.toggleActiveInactiveSeries(shared)

    let values = this.getValuesToPrint({
      i,
      j
    })

    this.printLabels({
      i,
      j,
      values,
      ttItems,
      shared
    })
  }

  printLabels ({
    i,
    j,
    values,
    ttItems,
    shared
  }) {
    const w = this.w
    let val
    const {
      xVal,
      zVal
    } = values

    let seriesName = ''

    let pColor = w.globals.colors[i]
    if ((j !== null && w.config.plotOptions.bar.distributed)) {
      pColor = w.globals.colors[j]
    }

    let yLbFormatter = w.globals.yLabelFormatters[i]

    if (w.globals.ttValFormatter !== undefined) {
      yLbFormatter = w.globals.ttValFormatter
    }

    if (!yLbFormatter) {
      yLbFormatter = function (label) {
        return label
      }
    }

    for (let t = 0, inverset = w.globals.series.length - 1; t < w.globals.series.length; t++, inverset--) {
      seriesName = w.config.tooltip.y.title.formatter(String(w.globals.seriesNames[i]), {
        series: w.globals.series,
        seriesIndex: i,
        dataPointIndex: j,
        w
      })

      if (shared) {
        const tIndex = w.config.tooltip.inverseOrder ? inverset : t

        seriesName = w.config.tooltip.y.title.formatter(String(w.globals.seriesNames[tIndex]), {
          series: w.globals.series,
          seriesIndex: i,
          dataPointIndex: j,
          w
        })
        pColor = w.globals.colors[tIndex]
        // for plot charts, not for pie/donuts
        val = yLbFormatter(w.globals.series[tIndex][j], {
          series: w.globals.series,
          seriesIndex: i,
          dataPointIndex: j,
          w
        })

        // discard 0 values in BARS
        if ((this.ttCtx.bars.length && w.config.chart.stacked && w.globals.series[tIndex][j] === 0) || typeof w.globals.series[tIndex][j] === 'undefined') {
          val = undefined
        }
      } else {
        val = yLbFormatter(w.globals.series[i][j], w)
      }

      // for pie / donuts
      if (j === null) {
        val = yLbFormatter(w.globals.series[i], w)
      }

      this.DOMHandling({
        t,
        ttItems,
        values: {
          val,
          xVal,
          zVal
        },
        seriesName,
        shared,
        pColor
      })
    }
  }

  DOMHandling ({
    t,
    ttItems,
    values,
    seriesName,
    shared,
    pColor
  }) {
    const w = this.w
    const ttCtx = this.ttCtx

    const {
      val,
      xVal,
      zVal
    } = values

    let ttItemsChildren = null
    ttItemsChildren = ttItems[t].children

    if (w.config.tooltip.fillSeriesColor) {
      //  elTooltip.style.backgroundColor = pColor
      ttItems[t].style.backgroundColor = pColor
      ttItemsChildren[0].style.display = 'none'
    }

    if (ttCtx.showTooltipTitle) {
      if (ttCtx.tooltipTitle === null) {
        // get it once if null, and store it in class property
        ttCtx.tooltipTitle = w.globals.dom.baseEl.querySelector(
          '.apexcharts-tooltip-title'
        )
      }
      ttCtx.tooltipTitle.innerHTML = xVal
    }

    if (ttCtx.blxaxisTooltip) {
      ttCtx.xaxisTooltipText.innerHTML = xVal
    }

    const ttYLabel = ttItems[t].querySelector('.apexcharts-tooltip-text-label')
    ttYLabel.innerHTML = seriesName ? seriesName + ': ' : ''
    const ttYVal = ttItems[t].querySelector('.apexcharts-tooltip-text-value')
    ttYVal.innerHTML = val

    if (ttItemsChildren[0].classList.contains('apexcharts-tooltip-marker')) {
      ttItemsChildren[0].style.backgroundColor = pColor
    }

    if (!w.config.tooltip.marker.show) {
      ttItemsChildren[0].style.display = 'none'
    }

    if (zVal !== null) {
      const ttZLabel = ttItems[t].querySelector('.apexcharts-tooltip-text-z-label')
      ttZLabel.innerHTML = w.config.tooltip.z.title
      const ttZVal = ttItems[t].querySelector('.apexcharts-tooltip-text-z-value')
      ttZVal.innerHTML = zVal
    }

    if (shared) {
      // hide when no Val
      if (typeof val === 'undefined') {
        ttItemsChildren[0].parentNode.style.display = 'none'
      } else {
        ttItemsChildren[0].parentNode.style.display = w.config.tooltip.items.display
      }
    }
  }

  toggleActiveInactiveSeries (shared) {
    const w = this.w
    if (shared) {
      // make all tooltips active
      this.tooltipUtil.toggleAllTooltipSeriesGroups('enable')
    } else {
      // disable all tooltip text groups
      this.tooltipUtil.toggleAllTooltipSeriesGroups('disable')

      // enable the first tooltip text group
      let firstTooltipSeriesGroup = w.globals.dom.baseEl.querySelector(
        '.apexcharts-tooltip-series-group'
      )

      if (firstTooltipSeriesGroup) {
        firstTooltipSeriesGroup.classList.add('active')
        firstTooltipSeriesGroup.style.display = w.config.tooltip.items.display
      }
    }
  }

  getValuesToPrint ({
    i,
    j
  }) {
    const w = this.w
    const filteredSeriesX = this.tooltipUtil.filteredSeriesX()

    let xVal = ''
    let zVal = null
    let val = null

    let zFormatter = w.globals.ttZFormatter

    if (j === null) {
      val = w.globals.series[i]
    } else {
      if (w.globals.dataXY) {
        xVal = filteredSeriesX[i][j]
      } else {
        xVal = typeof w.globals.labels[j] !== 'undefined'
          ? w.globals.labels[j]
          : ''
      }
    }

    let bufferXVal = xVal

    if (w.globals.dataXY && w.config.xaxis.type === 'datetime') {
      let xFormat = new Formatters(this.ctx)
      xVal = xFormat.xLabelFormat(w.globals.ttKeyFormatter, bufferXVal)
    } else {
      xVal = w.globals.xLabelFormatter(bufferXVal, {
        series: w.globals.series,
        seriesIndex: i,
        dataPointIndex: j,
        w
      })
    }

    // override default x-axis formatter with tooltip formatter
    if (w.config.tooltip.x.formatter !== undefined) {
      xVal = w.globals.ttKeyFormatter(bufferXVal, {
        series: w.globals.series,
        seriesIndex: i,
        dataPointIndex: j,
        w
      })
    }

    if (w.globals.seriesZ.length > 0 && w.globals.seriesZ[0].length > 0) {
      zVal = zFormatter(w.globals.seriesZ[i][j], w)
    }

    return {
      val,
      xVal,
      zVal
    }
  }

  handleCustomTooltip ({
    i,
    j
  }) {
    const w = this.w
    // override everything with a custom html tooltip and replace it
    this.ttCtx.tooltip.innerHTML = ''
    this.ttCtx.tooltip.innerHTML = w.config.tooltip.custom({
      series: w.globals.series,
      seriesIndex: i,
      dataPointIndex: j,
      w
    })
  }
}
module.exports = Labels
