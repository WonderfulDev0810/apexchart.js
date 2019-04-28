import { createChartWithOptions } from './utils/utils.js'

describe('Exponential values should parse', () => {
  it('should correctly set the min/max for small exponential values', () => {
    const chart = createChartWithOptions({
      chart: {
        type: 'line'
      },
      series: [
        {
          data: [
            [1551225600000, 2.9e-7],
            [1551312000000, 2.9e-7],
            [1551398400000, 2.8e-7],
            [1551484800000, 3e-7],
            [1551571200000, 2.8e-7],
            [1551657600000, 2.7e-7],
            [1551744000000, 2.8e-7],
            [1551830400000, 2.7e-7],
            [1551916800000, 2.7e-7],
            [1552003200000, 2.7e-7],
            [1552089600000, 2.8e-7],
            [1552176000000, 2.9e-7],
            [1552262400000, 2.7e-7],
            [1552348800000, 2.7e-7],
            [1552435200000, 2.8e-7],
            [1552521600000, 2.8e-7],
            [1552608000000, 3e-7],
            [1552694400000, 3.1e-7],
            [1552780800000, 2.9e-7],
            [1552867200000, 2.9e-7],
            [1552953600000, 2.9e-7],
            [1553040000000, 3.1e-7],
            [1553126400000, 3e-7],
            [1553212800000, 3e-7],
            [1553299200000, 2.9e-7],
            [1553385600000, 2.9e-7],
            [1553472000000, 2.8e-7],
            [1553558400000, 2.8e-7],
            [1553644800000, 2.8e-7],
            [1553731200000, 2.9e-7],
            [1553817600000, 2.8e-7],
            [1553904000000, 2.9e-7],
            [1553990400000, 2.8e-7],
            [1554076800000, 2.8e-7],
            [1554163200000, 2.5e-7],
            [1554249600000, 2.5e-7],
            [1554336000000, 2.6e-7],
            [1554422400000, 2.7e-7],
            [1554508800000, 2.6e-7],
            [1554595200000, 2.5e-7],
            [1554681600000, 2.5e-7],
            [1554768000000, 2.6e-7],
            [1554854400000, 2.4e-7],
            [1554940800000, 2.5e-7],
            [1555027200000, 2.4e-7],
            [1555113600000, 2.5e-7],
            [1555200000000, 2.5e-7],
            [1555286400000, 2.5e-7],
            [1555372800000, 2.6e-7],
            [1555459200000, 2.9e-7],
            [1555545600000, 2.8e-7],
            [1555632000000, 2.6e-7],
            [1555718400000, 2.8e-7],
            [1555804800000, 2.7e-7],
            [1555891200000, 2.6e-7],
            [1555977600000, 2.4e-7],
            [1556064000000, 2.3e-7],
            [1556150400000, 2.3e-7],
            [1556236800000, 2.4e-7],
            [1556323200000, 2.4e-7]
          ]
        }
      ],
      xaxis: {
        type: 'datetime'
      }
    })

    const minY = chart.w.globals.minY
    const maxY = chart.w.globals.maxY

    expect(minY).toEqual(2.2e-7)
    expect(maxY).toEqual(3.200000000000001e-7)
  })
})
