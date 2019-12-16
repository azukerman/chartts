import React from "react";
import ReactApexChart from "react-apexcharts";

class SupplyVsDemandChart extends React.Component {

  constructor(props) {
    super(props);
    this.data = props.data;

  }

  render() {

    return (
      
      <div>
        <div id="chart">
          <ReactApexChart options={this.props.categories} series={this.props.data} type="bar" height="350" d />
        </div>
      </div>
    );
  }

}

export default SupplyVsDemandChart;