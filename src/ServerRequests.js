class ServerRequests {
     static getCoursesSupplyVsDemandPerMonth = () => {

        return [
            {
                course: "Physics",
                demand: 3,
                supply: 5,
                month: "February"
            },
            {
                course: "מתמטיקה",
                demand: 151,
                supply: 52,
                month: "February"
            },
            {
                course: "הסטוריה",
                demand: 5,
                supply: 42,
                month: "February"
            }
            ,
            {
                course: "מדעי המחשב",
                demand: 11,
                supply: 6,
                month: "February"
            },
            {
                course: "Physics",
                demand: 10,
                supply: 5,
                month: "March"
            },
            {
                course: "מתמטיקה",
                demand: 11,
                supply: 52,
                month: "March"
            },
            {
                course: "הסטוריה",
                demand: 12,
                supply: 4,
                month: "March"
            }
            ,
            {
                course: "מדעי המחשב",
                demand: 10,
                supply: 5,
                month: "March"
            },
            {
                course: "פיזיקה",
                demand: 1,
                supply: 24,
                month: "April"
            },
            {
                course: "מתמטיקה",
                demand: 4,
                supply: 1,
                month: "April"
            },
            {
                course: "הסטוריה",
                demand: 1,
                supply: 4,
                month: "April"
            }
            ,
            {
                course: "מדעי המחשב",
                demand: 3,
                supply: 5,
                month: "April"
            },



        ];
    }


    static getAllMonthInHebrewAndEnglish = () => {

        return [
            {
                value: "January",
                txt: "January"
            },
            {
                value: "February",
                txt: "February"
            },
            {
                value: "March",
                txt: "March"
            },
            {
                value: "April",
                txt: "April"
            },
            {
                value: "May",
                txt: "May"
            },
            {
                value: "June",
                txt: "June"
            },
            {
                value: "July",
                txt: "July"
            },
            {
                value: "August",
                txt: "August"
            },
            {
                value: "September",
                txt: "September"
            },
            {
                value: "October",
                txt: "October"
            },
            {
                value: "November",
                txt: "November"
            },
            {
                value: "December",
                txt: "December"
            }
        ]

    }
    static getAllCoursesStatisticsOfSelectedMonth = (selectedMonth) => {
        let data= {
            Jan:[
               
                {
                    courseName:"Mathmatics",
                    count: 5

                },
                {
                    courseName:"Computer Sceince",
                    count: 32

                },
                {
                    courseName:"English",
                    count: 110

                }
               
                
            ],
            Feb:[
                {
                    courseName:"Physics",
                    count: 4222

                },
                {
                    courseName:"Mathmatics",
                    count: 5

                },
                {
                    courseName:"Computer Sceince",
                    count: 32

                },
                {
                    courseName:"English",
                    count: 110

                },
                {
                    courseName:"Physics",
                    count: 5

                },
                
            ],
            Mar:[
                {
                    courseName:"Physics",
                    count: 4222

                },
                {
                    courseName:"Mathmatics",
                    count: 5

                },
                {
                    courseName:"Computer Sceince",
                    count: 32

                },
                {
                    courseName:"English",
                    count: 110

                },
                {
                    courseName:"Physics",
                    count: 5

                },
                
            ],
            Apr:[
                {
                    courseName:"Physics",
                    count: 4222

                },
                {
                    courseName:"Mathmatics",
                    count: 5

                },
                {
                    courseName:"Computer Sceince",
                    count: 32

                },
                {
                    courseName:"English",
                    count: 110

                },
                {
                    courseName:"Physics",
                    count: 5

                },
                
            ],
               May:[
                {
                    courseName:"Physics",
                    count: 4222

                },
                {
                    courseName:"Mathmatics",
                    count: 5

                },
                {
                    courseName:"Computer Sceince",
                    count: 32

                },
                {
                    courseName:"English",
                    count: 110

                },
                {
                    courseName:"Physics",
                    count: 5

                },
                
            ],
            Jun:[
                {
                    courseName:"Physics",
                    count: 4222

                },
                {
                    courseName:"Mathmatics",
                    count: 5

                },
                {
                    courseName:"Computer Sceince",
                    count: 32

                },
                {
                    courseName:"English",
                    count: 110

                },
                {
                    courseName:"Physics",
                    count: 5

                },
                
            ],
            Feb:[
                {
                    courseName:"Physics",
                    count: 4222

                },
                {
                    courseName:"Mathmatics",
                    count: 5

                },
                {
                    courseName:"Computer Sceince",
                    count: 32

                },
                {
                    courseName:"English",
                    count: 110

                },
                {
                    courseName:"Physics",
                    count: 5

                },
                
            ],
            Feb:[
                {
                    courseName:"Physics",
                    count: 4222

                },
                {
                    courseName:"Mathmatics",
                    count: 5

                },
                {
                    courseName:"Computer Sceince",
                    count: 32

                },
                {
                    courseName:"English",
                    count: 110

                },
                {
                    courseName:"Physics",
                    count: 5

                },
                
            ]
            
        }
        return data[selectedMonth];
    }
    static getPieChartState = (selectedMonth) =>
    {
        let data = ServerRequests.getAllCoursesStatisticsOfSelectedMonth(selectedMonth);
        let state = ServerRequests.getPieChartParams(data);
       
        state.series = ServerRequests.getCoursesCountsOfCurrentMonth(data);
        return state
    }      
    static getCoursesNamesOfCurrentMonth = (selectedMonthCourses)=>{return selectedMonthCourses.map((course)=>course.courseName);}
    static getCoursesCountsOfCurrentMonth = (selectedMonthCourses)=>{return selectedMonthCourses.map((course)=>course.count);}
   
    static getPieChartParams = (data) =>
    {
        let params = {
            options: {
              labels:ServerRequests.getCoursesNamesOfCurrentMonth(data),
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }]
            },
            series: [44, 55, 13, 43, 22],
          };
        return params;
    }
}



export default ServerRequests;

