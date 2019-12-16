import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SupplyVsDemandPerCourseChart from './chartCreator';
import getPlotOptionsFor2DChart from './PlotOptionsGetters';
import CoursesIncomePieChart from './CoursesIncomePieChart';
import CoursesIncomeLineChart from './CoursesIncomeLineChart';
import GetCoursesIncomeCharts from './GetCoursesIncomeCharts';

// import Resource from './Calendar';

//  ReactDOM.render(<SupplyVsDemandPerCourseChart getPlotOptionsFunc ={getPlotOptionsFor2DChart} />, document.getElementById('root'));
// ReactDOM.render(<Resource />, document.getElementById('root'));
//ReactDOM.render(< getCoursesIncomeCharts />, document.getElementById('root'));
ReactDOM.render(<GetCoursesIncomeCharts />, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
