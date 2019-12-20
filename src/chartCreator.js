import React from "react";
import SupplyVsDemandChart from './SupplyVsDemandChart';
import ServerRequests from './ServerRequests'
import initCompleted from './initCompleted'

class SupplyVsDemandPerCourseChart extends initCompleted {

    constructor(props) {

        super(props);
        this.currentMonth = "January";
    }

    fetchSupplyVsDemandPerCourseChart=()=>
    {
        const newState =
            {
                supplyVsDemandPerMonth :ServerRequests.getCoursesSupplyVsDemandPerMonth(),
                months: ServerRequests.getAllMonthInHebrewAndEnglish()
            }
     this.updateStateWithInitCompletedTrue(newState);
    }
    componentDidMount=()=>
    {
        
        this.fetchSupplyVsDemandPerCourseChart();
    
    }
    

    getFilteredSupplyVsDemandByCurrrentMonth = () => this.state.supplyVsDemandPerMonth.filter((svd) => svd.month === this.currentMonth);

    getCoursesCategories = () => { return this.getFilteredSupplyVsDemandByCurrrentMonth().map((svd) => svd.course); }

    filterSupplies = () => { return this.getFilteredSupplyVsDemandByCurrrentMonth().map((svd) => svd.supply); }

    filterdemands = () => { return this.getFilteredSupplyVsDemandByCurrrentMonth().map((svd) => svd.demand); }

    getOptions = () => {

        let options = this.props.getPlotOptionsFunc();
        options.xaxis.categories = this.getCoursesCategories();;
        return options;
    }
    getDemandsForSeries = () => { return { data: this.filterdemands(), name: "Supply" }; }
    getSuppliesForSeries = () => { return { data: this.filterSupplies(), name: "Demand" }; }
    getSeries = () => [this.getSuppliesForSeries(), this.getDemandsForSeries()];
    render() {
        if(!this.wasInitialized()){
            console.log("hi")
            return this.renderToCompleteState()
          }

        return (

            <div>
                <ReactExample onChangeFunction={this.handleChange} options={this.state.months} />
                <SupplyVsDemandChart data={this.getSeries()} categories={this.getOptions()} />
            </div>

        );
    }
    handleChange = (event) => {

        this.currentMonth = event.target.value;
        this.fetchSupplyVsDemandPerCourseChart()

    }
    
}

export default SupplyVsDemandPerCourseChart;

export const ReactExample = (props) => {

    const optionsList = props.options.map(o => {
        return (
            <option value={o.value}>{o.txt}</option>
        )
    })
    return (
        <div>
            <select onChange={props.onChangeFunction}>
                {optionsList}
            </select>
        </div>


    )
}






