import Graphics from './Graphics'
import Exports from './Exports'
import icoPan from './../assets/ico-pan-hand.svg'
import icoZoom from './../assets/ico-zoom-in.svg'
import icoReset from './../assets/ico-home.svg'
import icoZoomIn from './../assets/ico-plus.svg'
import icoZoomOut from './../assets/ico-minus.svg'
import icoSelect from './../assets/ico-select.svg'
import icoCamera from './../assets/ico-camera.svg'

/**
 * ApexCharts Toolbar Class for creating toolbar in axis based charts.
 *
 * @module Toolbar
 **/

class Toolbar {
  constructor (ctx) {
    this.ctx = ctx
    this.w = ctx.w

    this.cultureValues = this.w.globals.culture.toolbar
  }

  createToolbar () {
    let w = this.w

    this.elToolbarWrap = document.createElement('div')
    this.elToolbarWrap.setAttribute('class', 'apexcharts-toolbar')
    w.globals.dom.elWrap.appendChild(this.elToolbarWrap)

    this.elZoom = document.createElement('div')
    this.elZoomIn = document.createElement('div')
    this.elZoomOut = document.createElement('div')
    this.elPan = document.createElement('div')
    this.elSelection = document.createElement('div')
    this.elZoomReset = document.createElement('div')
    this.elCamera = document.createElement('div')

    let toolbarControls = []
    if (w.config.chart.toolbar.tools.download) {
      toolbarControls.push({
        el: this.elCamera,
        icon: icoCamera,
        title: this.cultureValues.download,
        class: 'apexcharts-download-icon'
      })
    }

    if (w.config.chart.toolbar.tools.selection) {
      toolbarControls.push({
        el: this.elSelection,
        icon: icoSelect,
        title: this.cultureValues.selection,
        class: 'apexcharts-selection-icon'
      })
    }

    if (w.config.chart.toolbar.tools.zoomin && w.config.chart.zoom.enabled) {
      toolbarControls.push({
        el: this.elZoomIn,
        icon: icoZoomIn,
        title: this.cultureValues.zoomIn,
        class: 'apexcharts-zoom-in-icon'
      })
    }

    if (w.config.chart.toolbar.tools.zoomout && w.config.chart.zoom.enabled) {
      toolbarControls.push({
        el: this.elZoomOut,
        icon: icoZoomOut,
        title: this.cultureValues.zoomOut,
        class: 'apexcharts-zoom-out-icon'
      })
    }

    if (w.config.chart.toolbar.tools.zoom && w.config.chart.zoom.enabled) {
      toolbarControls.push({
        el: this.elZoom,
        icon: icoZoom,
        title: this.cultureValues.selectionZoom,
        class: 'apexcharts-zoom-icon'
      })
    }

    if (w.config.chart.toolbar.tools.pan && (w.config.chart.zoom.enabled || w.config.chart.scroller.enabled)) {
      toolbarControls.push({
        el: this.elPan,
        icon: icoPan,
        title: this.cultureValues.panning,
        class: 'apexcharts-pan-icon'
      })
    }

    if (w.config.chart.toolbar.tools.reset) {
      toolbarControls.push({
        el: this.elZoomReset,
        icon: icoReset,
        title: this.cultureValues.reset,
        class: 'apexcharts-reset-zoom-icon'
      })
    }

    for (let i = 0; i < toolbarControls.length; i++) {
      Graphics.setAttrs(toolbarControls[i].el, {
        class: toolbarControls[i].class,
        title: toolbarControls[i].title
      })
      toolbarControls[i].el.innerHTML = toolbarControls[i].icon
      this.elToolbarWrap.appendChild(toolbarControls[i].el)
    }

    if (w.globals.zoomEnabled) {
      this.elZoom.classList.add('selected')
    } else if (w.globals.panEnabled) {
      this.elPan.classList.add('selected')
    } else if (w.globals.selectionEnabled) {
      this.elSelection.classList.add('selected')
    }

    this.addToolbarEventListeners()
  }

  addToolbarEventListeners () {
    this.elZoomReset.addEventListener('click', this.handleZoomReset.bind(this))
    this.elSelection.addEventListener('click', this.toggleSelection.bind(this))
    this.elZoom.addEventListener('click', this.toggleZooming.bind(this))
    this.elZoomIn.addEventListener('click', this.handleZoomIn.bind(this))
    this.elZoomOut.addEventListener('click', this.handleZoomOut.bind(this))
    this.elPan.addEventListener('click', this.togglePanning.bind(this))
    this.elCamera.addEventListener('click', this.downloadSVG.bind(this))
  }

  toggleSelection () {
    this.toggleOtherControls()
    this.w.globals.selectionEnabled = !this.w.globals.selectionEnabled

    if (!this.elSelection.classList.contains('selected')) {
      this.elSelection.classList.add('selected')
    } else {
      this.elSelection.classList.remove('selected')
    }
  }

  toggleZooming () {
    this.toggleOtherControls()
    this.w.globals.zoomEnabled = !this.w.globals.zoomEnabled

    if (!this.elZoom.classList.contains('selected')) {
      this.elZoom.classList.add('selected')
    } else {
      this.elZoom.classList.remove('selected')
    }
  }

  getToolbarIconsReference () {
    const w = this.w
    if (!this.elZoom) {
      this.elZoom = w.globals.dom.baseEl.querySelector('.apexcharts-zoom-icon')
    }
    if (!this.elPan) {
      this.elPan = w.globals.dom.baseEl.querySelector('.apexcharts-pan-icon')
    }
    if (!this.elSelection) {
      this.elSelection = w.globals.dom.baseEl.querySelector('.apexcharts-selection-icon')
    }
  }

  enableZooming () {
    this.toggleOtherControls()
    this.w.globals.zoomEnabled = true
    this.elZoom.classList.add('selected')
    this.elPan.classList.remove('selected')
  }

  enablePanning () {
    this.toggleOtherControls()
    this.w.globals.panEnabled = true
    this.elPan.classList.add('selected')
    this.elZoom.classList.remove('selected')
  }

  togglePanning () {
    this.toggleOtherControls()
    this.w.globals.panEnabled = !this.w.globals.panEnabled

    if (!this.elPan.classList.contains('selected')) {
      this.elPan.classList.add('selected')
    } else {
      this.elPan.classList.remove('selected')
    }
  }

  toggleOtherControls () {
    const w = this.w
    w.globals.panEnabled = false
    w.globals.zoomEnabled = false
    w.globals.selectionEnabled = false

    this.getToolbarIconsReference()

    this.elPan.classList.remove('selected')
    this.elSelection.classList.remove('selected')
    this.elZoom.classList.remove('selected')
  }

  handleZoomIn () {
    const w = this.w

    const centerX = (w.globals.minX + w.globals.maxX) / 2
    const newMinX = (w.globals.minX + centerX) / 2
    const newMaxX = (w.globals.maxX + centerX) / 2

    this.ctx.updateOptionsInternal({
      xaxis: {
        min: newMinX,
        max: newMaxX
      }
    },
    false,
    true
    )
  }

  handleZoomOut () {
    const w = this.w

    // avoid zooming out beyond 1000 which may result in NaN values being printed on x-axis
    if (w.config.xaxis.type === 'datetime' && new Date(w.globals.minX).getUTCFullYear() < 1000) {
      return
    }

    const centerX = (w.globals.minX + w.globals.maxX) / 2
    const newMinX = w.globals.minX - (centerX - w.globals.minX)
    const newMaxX = w.globals.maxX - (centerX - w.globals.maxX)

    this.ctx.updateOptionsInternal({
      xaxis: {
        min: newMinX,
        max: newMaxX
      }
    },
    false,
    true
    )
  }

  downloadSVG () {
    // const w = this.w
    const downloadSVG = new Exports(this.ctx)

    downloadSVG.exportToSVG()
  }

  handleZoomReset (e) {
    let w = this.w

    let me = this
    let yaxis = w.config.yaxis
    let xaxis = w.config.xaxis
    w.globals.zoomed = false

    if (w.globals.minX === w.globals.initialminX && w.globals.maxX === w.globals.initialmaxX) return

    w.config.yaxis.map((yaxe, index) => {
      yaxis[index].min = w.globals.initialYAxis[index].min
      yaxis[index].max = w.globals.initialYAxis[index].max
    })
    xaxis.min = w.globals.initialConfig.xaxis.min
    xaxis.max = w.globals.initialConfig.xaxis.max

    me.ctx.updateSeriesInternal(w.globals.initialSeries, true)
  }
}

module.exports = Toolbar
