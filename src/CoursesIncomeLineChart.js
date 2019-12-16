import React from "react";
import ReactApexChart from "react-apexcharts";
class CoursesIncomeLineChart extends React.Component {
      
    constructor(props) {
        super(props);
        
        this.months =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
       const toolTipHandler =(monthIndex)=>{
             let selectedMonth = this.months[monthIndex-1]
              
              props.toolTipFunction(selectedMonth);
            
            return selectedMonth;
      }
        this.state = {
         
            
          options: {
            chart: {
                  zoom: {
                      enabled: false
                  }
                  
              },
              
              dataLabels: {
                  enabled: false
              },
              stroke: {
                  curve: 'straight'
              },
              title: {
                  text: 'Hellooooooo',
                  align: 'left'
              },
              grid: {
                  row: {
                      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                      opacity: 0.5
                  },
              },
              xaxis: {
                  categories: this.months,
                  tooltip: {
                    
                        formatter: function (x) {
                          return toolTipHandler(x);
                         
                        }
                  },
              }
          },
          series: [{
              name: "Income",
              data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
          }],
        }
      }

       
      render() {

        return (
          

          <div id="chart">
            <ReactApexChart options={this.state.options} series={this.state.series} type="line" height="350" 
            />
          </div>
  

        );
      }
      
    }
  export default CoursesIncomeLineChart;