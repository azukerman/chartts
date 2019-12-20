import React from "react";
import ReactApexChart from "react-apexcharts";
import CoursesIncomeLineChart from './CoursesIncomeLineChart';
import ServerRequests from "./ServerRequests";
import initCompleted from "./initCompleted";

class CoursesIncomePieChart extends initCompleted {
      
  constructor(props) {
    super(props);
   
    this.selectedMonth = "Feb"
    
  }
   
  updateSelectedMonthCallback=(selectedMonth) =>
  {
      this.selectedMonth = selectedMonth;
      this.fetchPieChartState();
      
     
  }

  fetchPieChartState =()=>
  {
    const newState = ServerRequests.getPieChartState(this.selectedMonth);

    this.updateStateWithInitCompletedTrue(newState);
   
    console.log(newState)
  }
  componentDidMount=()=>
  {
      
      this.fetchPieChartState();

  }


  render() {
    
    if(!this.wasInitialized()){
      console.log("hi")
      return this.renderToCompleteState()
    }

    return (

      <div id="coursesIncomePieChart">
       <CoursesIncomeLineChart toolTipFunction ={this.updateSelectedMonthCallback}/>
        <ReactApexChart options={this.state.options} series={this.state.series} type="pie" width="600" />

      </div>


    );
  }
}
export default CoursesIncomePieChart;