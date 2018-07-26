<p align="center"><img src="https://apexcharts.com/media/apexcharts-logo.png"></p>

<p align="center">
  <a href="https://github.com/apexcharts/apexcharts.js/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-MIT-brightgreen.svg" alt="License"></a>
  <a href="https://github.com/apexcharts/apexcharts.js/blob/master/LICENSE"><img src="https://img.shields.io/badge/price-FREE-0098f7.svg" alt="FREE"></a>
  <a href="https://www.npmjs.com/package/apexcharts"><img src="https://img.shields.io/npm/v/apexcharts.svg" alt="Version"></a>
</p>
<p align="center">
  <a href="https://twitter.com/intent/tweet?text=Create%20visualizations%20with%20this%20free%20and%20open-source%20JavaScript%20Chart%20library&url=https://www.apexcharts.com&hashtags=javascript,charts,visualizations,developers,apexcharts"><img src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social"> </a>
</p>

<p align="center">A modern JavaScript charting library to build interactive charts and visualizations with simple API.</p>

<p align="center"><a href="https://apexcharts.com/javascript-chart-demos/"><img src="https://apexcharts.com/media/apexcharts-banner.png"></a></p>

## Download and Installation

##### Installing via npm
[![NPM](https://nodei.co/npm/apexcharts.png?mini=true)](https://npmjs.org/package/apexcharts)

##### Direct &lt;script&gt; include
```html
<script src="https://unpkg.com/apexcharts/dist/apexcharts.min.js"></script>
```

## Usage

### Creating your first chart
To create a basic bar chart with minimal configuration, write as follows:
```js
var options = {
  chart: {
    type: 'bar'
  },
  series: [{
    name: 'sales',
    data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
  }],
  xaxis: {
    categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
  }
}

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
```
This will render the following chart
<p align="left"><a href="https://apexcharts.com/javascript-chart-demos/column-charts/"><img src="https://apexcharts.com/media/first-bar-chart.svg"></a></p>

### A little more than the basic

You can create a combination of different charts, sync them and give your desired look with unlimited possibilites.
Below is an example of synchronized charts with github style.
<p align="left"><a href="https://apexcharts.com/javascript-chart-demos/area-charts/github-style/"><img src="https://apexcharts.com/media/github-charts.gif"></a></p>


## Some interactivity
Zoom, Pan, Scroll through data. Make selections and load other charts using those selections.
An example showing some interactivity
<p align="left"><a href="https://codepen.io/apexcharts/pen/QrbEQg" target="_blank"><img src="https://apexcharts.com/media/interactivity.gif" alt="interactive chart"></a></p>

## Dynamic Data Updation
Another approach to Drill down charts where one selection updates the data of other charts.
An example of loading dynamic series into charts is shown below
<p align="left"><a href="https://apexcharts.com/javascript-chart-demos/column-charts/dynamic-loaded-chart/"><img src="https://apexcharts.com/media/dynamic-selection.gif" alt="dynamic-loading-chart" /></a></p>


## Annotations
Annotations allows you to write custom text on specific values or on axes values. Valuable to expand the visual appeal of your chart and make it more informative.
<p align="left"><a href="https://apexcharts.com/docs/annotations/"><img src="https://apexcharts.com/media/annotations" alt="annotations" /></a></p>


## Heatmaps
use Heatmaps to represent data through colors and shades. Frequently used with bigger data collections, they are valuable for recognizing patterns and area of focus. 
<p align="left"><a href="https://apexcharts.com/javascript-chart-demos/heatmap-charts/"><img src="https://apexcharts.com/media/heatmap.png" alt="heatmap" /></a></p>

## Gauges
The tiny little gauges are an important part of a dashboard and are useful in displaying single digit data. A demo of these gauges:
<p align="left"><a href="https://apexcharts.com/javascript-chart-demos/radialbar-charts/"><img src="https://apexcharts.com/media/radialbars.png" alt="radialbar-chart" /></a></p>

## What's included

The download bundle includes the following files and directories providing a minified single file in the dist folder. Every asset including icon/css is bundled in the js itself to avoid loading multiple files.

```
apexcharts/
├── dist/
│   └── apexcharts.min.js
├── src/
│   ├── assets/
│   ├── charts/
│   ├── modules/
│   ├── utils/
│   └── apexcharts.js
└── samples/
```

## Development
#### Install dependencies and run project

```bash
npm install
npm run start
```
This will start the webpack watch and any changes you make to `src` folder will autocompile and output will be produced in `dist` folder.

#### Minifying the src
```bash
npm run build
```

## Where do I go next?

Head over to the <a href="https://apexcharts.com/docs/">documentation</a> section to read more about how to use different kinds of charts and explore all options.

## Support
ApexCharts has professional <a href="https://apexcharts.com/plans/">Support Plans</a> that can be purchased from the authors of ApexCharts to provide assistance with questions you might have.

## Credits.
ApexCharts uses <a href="http://svgjs.com/" target="_blank">SVG.js</a> for drawing shapes, animations, applying svg filters and a lot more under the hood.

## License
ApexCharts is released under MIT license. You are free to use, modify and distribute this software, as long as the copyright header is left intact.
