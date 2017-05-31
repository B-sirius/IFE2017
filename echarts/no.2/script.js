'use strict';
let initChart = (function() {
    let chartContainer = document.getElementById('chartContainer');
    let demoChart = echarts.init(chartContainer);

    let option = {
        title: {
            text: '蟹堡王营收统计',
            textStyle: {
                fontWeight: 'normal',
                fontFamily: ['Microsoft Yahei', 'Helvetica Neue','Helvetica','Arial'],
                fontSize: 30
            },
            subtext: '首度实现收入正增长',
            subtextStyle: {
                fontWeight: 'normal',
                fontFamily: ['Microsoft Yahei', 'Helvetica Neue','Helvetica','Arial'],
                fontSize: 20,
                color: '#565656'
            },
            itemGap: 12,
            left: 30,
            top: 30
        },
        legend: {
            data: [{
                name: '正规收入',
                icon: 'rect'
            }, {
                name: 'dark♂收入',
                icon: 'rect'
            }],
            top: 110,
            left: 30,
            itemWidth: 40,
            itemHeight: 20,
            itemGap: 20,
            textStyle: {
                fontSize: 20
            },

        },
        grid: {
            top: 170,
            left: 40,
            right: 110,
            bottom: 100
        },
        backgroundColor: '#D7E4EB',
        xAxis: {
            data: ['1月', '2月', '3月', '4月', '5月', '6月'],
            offset: 10,
            axisLabel: {
                margin: 16,
                textStyle: {
                    fontSize: 20,
                    color: '#383838'
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#EC6B66',
                    width: 2
                }
            },
            axisTick: {
                show: false
            },
        },
        yAxis: {
            position: 'right',
            inverse: true,
            axisLabel: {
                margin: 20,
                textStyle: {
                    fontSize: 20
                }
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: "#fff",
                    width: 2
                }
            }
        },
        series: [{
            name: '正规收入',
            type: 'bar',
            data: [25, 250, 150, 101, 110, 100],
            itemStyle: {
                normal: {
                    color: '#33B6E3'
                }
            },
            barWidth: 20,
            barGap: 0
        }, {
            name: 'dark♂收入',
            type: 'bar', 
            data: [124, 2502, 1504, 1055, 411, 1020],
            itemStyle: {
                normal: {
                    color: '#33748A'
                }
            },
            barWidth: 20,
        }]
    };

    demoChart.setOption(option);
})();