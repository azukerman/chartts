import React from "react";
import ReactApexChart from "react-apexcharts";
import CoursesIncomePieChart from './CoursesIncomePieChart';
import CoursesIncomeLineChart from './CoursesIncomeLineChart';
class GetCoursesIncomeCharts extends React.Component {
      
    constructor(props) {
        super(props);

        
      }

      render() {

        return (
            <div>
         
              <CoursesIncomePieChart/>
            </div>
           
            
  

        );
      }
    }
  export default GetCoursesIncomeCharts;