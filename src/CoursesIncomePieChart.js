import React from "react";
import ReactApexChart from "react-apexcharts";
import CoursesIncomeLineChart from './CoursesIncomeLineChart';
import ServerRequests from "./ServerRequests";

class CoursesIncomePieChart extends React.Component {
      
  constructor(props) {
    super(props);
   
    this.selectedMonth = "Feb"
   
 
    
    this.state = {
      initCompleted: false
    }
    
  }
   
  updateSelectedMonthCallback=(selectedMonth) =>
  {
      this.selectedMonth = selectedMonth;
      this.fetchPieChartState();
      
     
  }

  fetchPieChartState =()=>
  {
    let newState = ServerRequests.getPieChartState(this.selectedMonth);
    this.setState({...newState, initCompleted: true});
   
    console.log(newState)
  }
  componentDidMount=()=>
  {
      
      this.fetchPieChartState();

  }
  render() {
    const {initCompleted} = this.state;
    if(!initCompleted){
    return <span>Fetching....</span>
}

    return (

      <div id="chart">
       <CoursesIncomeLineChart toolTipFunction ={this.updateSelectedMonthCallback}/>
        <ReactApexChart options={this.state.options} series={this.state.series} type="pie" width="600" />

      </div>


    );
  }
}
export default CoursesIncomePieChart;