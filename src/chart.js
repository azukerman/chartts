import React from 'react'
//
import useChartConfig from '../node_modules/react-Chart/src/hooks/useChartConfig'
import Box from '../node_modules/compo'
import { Chart } from '.../node_modules/react-Chart/src/components/Chart'
let sourceCode
export default () => {
  const { data, randomizeData } = useChartConfig({
    series: 10
  })
  const series = React.useMemo(
    () => ({
      showPoints: false
    }),
    []
  )
  const axes = React.useMemo(
    () => [
      { primary: true, type: 'time', position: 'bottom' },
      { type: 'linear', position: 'left' }
    ],
    []
  )
  return (
    <>
      <button onClick={randomizeData}>Randomize Data</button>
      <br />
      <br />
      <Box
        style={{
          background: 'rgba(0, 27, 45, 0.9)',
          padding: '.5rem',
          borderRadius: '5px'
        }}
      >
        <Chart data={data} series={series} axes={axes} tooltip dark />
      </Box>
      <br />
      <pre>
        <code>{sourceCode}</code>
      </pre>
    </>
  )
}