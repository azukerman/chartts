
  const getPlotOptionsFor2DChart = () => {

    return {
        plotOptions: {

            bar: {
                align: "left",
                horizontal: false,

                dataLabels: {
                    position: 'top',
                },
            }
        },
        dataLabels: {
            enabled: false,
            offsetX: -6,
            style: {
                fontSize: '12px',
                colors: ['#fff'],

            }
        },
        stroke: {
            show: true,
            width: 1,
            colors: ['#fff']
        },


        xaxis: {
            categories: null

        },
        yaxis: {
            opposite: true
        }
    };
}
export default getPlotOptionsFor2DChart;