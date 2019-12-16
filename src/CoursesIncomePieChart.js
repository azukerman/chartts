
    import React from "react";
    import ReactApexChart from "react-apexcharts";
    import CoursesIncomeLineChart from './CoursesIncomeLineChart';
import ServerRequests from "./ServerRequests";
import { throwStatement } from "@babel/types";

    class CoursesIncomePieChart extends React.Component {
      
      constructor(props) {
        super(props);
       
        this.selectedMonth = "Feb"
       
     
        
        this.state = {
          
        }
        
      }
       
      updateSelectedMonth=(selectedMonth) =>
      {
          this.selectedMonth = selectedMonth;
          
         
      }

      updateState =()=>
      {
        let newState = ServerRequests.getPieChartState(this.selectedMonth);
        this.setState(newState);
        console.log(newState)
      }
      componentDidMount=()=>
      {
          
          this.updateState();
    
      }
      render() {
        

        return (

          <div id="chart">
           <CoursesIncomeLineChart toolTipFunction ={this.updateSelectedMonth}/>
            <ReactApexChart options={this.state.options} series={this.state.series} type="pie" width="600" />

          </div>
  

        );
      }
    }
    export default CoursesIncomePieChart;