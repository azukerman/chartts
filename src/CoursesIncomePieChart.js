
    import React from "react";
    import ReactApexChart from "react-apexcharts";
    import CoursesIncomeLineChart from './CoursesIncomeLineChart';
import ServerRequests from "./ServerRequests";

    class CoursesIncomePieChart extends React.Component {
      
      constructor(props) {
        super(props);
       
        this.selectedMonth = "Feb"
       
     
        this.updateState();
        this.state = {
          
        }
        
      }
       
      updateSelectedMonth=(selectedMonth) =>
      {
          this.selectedMonth = selectedMonth;
          this.updateState();
         
      }

      updateState =()=>
      {
        let newState = ServerRequests.getPieChartState(this.selectedMonth);

        this.setState(newState);
      }
      componentWillMount=()=>
      {
          
          this.updateState();
    
      }
      render() {
        console.log(this.state)

        return (

          <div id="chart">
           <CoursesIncomeLineChart toolTipFunction ={this.updateSelectedMonth}/>
            <ReactApexChart options={this.state.options} series={this.state.series} type="pie" width="600" />

          </div>
  

        );
      }
    }
    export default CoursesIncomePieChart;