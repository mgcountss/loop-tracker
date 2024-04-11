let dataget = "";
let id1 = document.URL.split('/compare/')[1].split('/')[0];
let id2 = document.URL.split('/compare/')[1].split('/')[1];
if (id2.includes('?')) {
    id2 = id2.split('?')[0];
}
let name1 = document.getElementById('title1').innerHTML;
let name2 = document.getElementById('title2').innerHTML;
let updateInterval;

let chart1 = new Highcharts.Chart({
    chart: {
        renderTo: 'chart1',
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    xAxis: {
        visible: false,
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: ''
        },
        visible: false
    },
    title: {
        text: ' '
    },
    credits: {
        enabled: false,
    },
    plotOptions: {
        series: {
            threshold: null,
            fillOpacity: 0.25
        },
        area: {
            fillOpacity: 0.05
        }
    },
    series: [{
        showInLegend: false,
        name: '',
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#FFF',
        lineWidth: 5
    }]
});
let chart2 = new Highcharts.Chart({
    chart: {
        renderTo: 'chart2',
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    xAxis: {
        visible: false,
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: ''
        },
        visible: false
    },
    title: {
        text: ' '
    },
    credits: {
        enabled: false,
    },
    plotOptions: {
        series: {
            threshold: null,
            fillOpacity: 0.25
        },
        area: {
            fillOpacity: 0.05
        }
    },
    series: [{
        showInLegend: false,
        name: '',
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#FFF',
        lineWidth: 5
    }]
});

let stats_chart1 = new Highcharts.Chart({
    chart: {
        renderTo: 'stats_chart1',
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    xAxis: {
        visible: false,
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: ''
        },
        visible: false
    },
    title: {
        text: ' '
    },
    credits: {
        enabled: true,
        text: 'Loop Tracker',
        href: 'https://loop.mgcounts.com'
    },
    plotOptions: {
        series: {
            threshold: null,
            fillOpacity: 0.25
        },
        area: {
            fillOpacity: 0.05
        }
    },
    series: [{
        showInLegend: true,
        name: name1+"'s followers",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#46e4a2',
        lineWidth: 5
    }, {
        showInLegend: true,
        name: name2+"'s followers",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#f44336',
        lineWidth: 5
    }],
});
let stats_chart2 = new Highcharts.Chart({
    chart: {
        renderTo: 'stats_chart2',
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    xAxis: {
        visible: false,
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: ''
        },
        visible: false
    },
    title: {
        text: ' '
    },
    credits: {
        enabled: true,
        text: 'Loop Tracker',
        href: 'https://loop.mgcounts.com'
    },
    plotOptions: {
        series: {
            threshold: null,
            fillOpacity: 0.25
        },
        area: {
            fillOpacity: 0.05
        }
    },
    series: [{
        showInLegend: true,
        name: name1+"'s posts",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#46e4a2',
        lineWidth: 5
    },{
        showInLegend: true,
        name: name2+"'s posts",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#f44336',
        lineWidth: 5
    }],
});
let stats_chart3 = new Highcharts.Chart({
    chart: {
        renderTo: 'stats_chart3',
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    xAxis: {
        visible: false,
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: ''
        },
        visible: false
    },
    title: {
        text: ' '
    },
    credits: {
        enabled: true,
        text: 'Loop Tracker',
        href: 'https://loop.mgcounts.com'
    },
    plotOptions: {
        series: {
            threshold: null,
            fillOpacity: 0.25
        },
        area: {
            fillOpacity: 0.05
        }
    },
    series: [{
        showInLegend: true,
        name: name1+"'s following",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#46e4a2',
        lineWidth: 5
    }, {
        showInLegend: true,
        name: name2+"'s following",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#f44336',
        lineWidth: 5
    }],
});

for (let i = 0; i < Object.keys(daily_stats1).length; i++) {
    let date = Date.parse(Object.keys(daily_stats1)[i]);
    stats_chart1.series[0].addPoint([date, daily_stats1[Object.keys(daily_stats1)[i]].follower_count]);
    stats_chart2.series[0].addPoint([date, daily_stats1[Object.keys(daily_stats1)[i]].post_count]);
    stats_chart3.series[0].addPoint([date, daily_stats1[Object.keys(daily_stats1)[i]].following_count]);
}

for (let i = 0; i < Object.keys(daily_stats2).length; i++) {
    let date = Date.parse(Object.keys(daily_stats2)[i]);
    stats_chart1.series[1].addPoint([date, daily_stats2[Object.keys(daily_stats2)[i]].follower_count]);
    stats_chart2.series[1].addPoint([date, daily_stats2[Object.keys(daily_stats2)[i]].post_count]);
    stats_chart3.series[1].addPoint([date, daily_stats2[Object.keys(daily_stats2)[i]].following_count]);
}

if (document.URL.includes('?live=followers')) {
    document.getElementById('live_label1').innerText = 'Followers';
    document.getElementById('live_label2').innerText = 'Followers';
    dataget = 'follower_count';
    updateInterval = setInterval(updateLive, 2000);
    updateLive();
    chart1.yAxis[0].update({
        title: {
            text: 'Followers'
        }
    });
    chart1.series[0].update({
        name: 'Followers'
    });
    chart2.yAxis[0].update({
        title: {
            text: 'Followers'
        }
    });
    chart2.series[0].update({
        name: 'Followers'
    });
    document.getElementById('liveCounter1').style.display = 'block';
    document.getElementById('liveCounter2').style.display = 'block';
} else if (document.URL.includes('?live=following')) {
    document.getElementById('live_label1').innerText = 'Following';
    document.getElementById('live_label2').innerText = 'Following';
    dataget = 'following_count';
    updateInterval = setInterval(updateLive, 2000);
    updateLive();
    chart1.yAxis[0].update({
        title: {
            text: 'Following'
        }
    });
    chart1.series[0].update({
        name: 'Following'
    });
    chart2.yAxis[0].update({
        title: {
            text: 'Following'
        }
    });
    chart2.series[0].update({
        name: 'Following'
    });
    document.getElementById('liveCounter1').style.display = 'block';
    document.getElementById('liveCounter2').style.display = 'block';
} else if (document.URL.includes('?live=posts')) {
    document.getElementById('live_label1').innerText = 'Posts';
    document.getElementById('live_label2').innerText = 'Posts';
    dataget = 'post_count';
    updateInterval = setInterval(updateLive, 2000);
    updateLive();
    chart1.yAxis[0].update({
        title: {
            text: 'Posts'
        }
    });
    chart1.series[0].update({
        name: 'Posts'
    });
    chart2.yAxis[0].update({
        title: {
            text: 'Posts'
        }
    });
    chart2.series[0].update({
        name: 'Posts'
    });
    document.getElementById('liveCounter1').style.display = 'block';
    document.getElementById('liveCounter2').style.display = 'block';
}

function updateLive() {
    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'ids': [id1, id2]
        })
    }).then(response => response.json())
        .then(data => {
            document.getElementById('live_name1').innerText = data.users[0].display_name;
            document.getElementById('live_count1').innerText = data.users[0][dataget];
            chart1.series[0].addPoint([Date.now(), data.users[0][dataget]])
            document.getElementById('live_name2').innerText = data.users[1].display_name;
            document.getElementById('live_count2').innerText = data.users[1][dataget];
            chart2.series[0].addPoint([Date.now(), data.users[1][dataget]])
        });
}

function toggleLive() {
    window.location.href = '/compare/' + id1 + '/' + id2;
}