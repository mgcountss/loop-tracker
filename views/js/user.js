let dataget = "";
let id = document.URL.split('/user/')[1].split('?')[0];
let updateInterval;

let chart = new Highcharts.Chart({
    chart: {
        renderTo: 'chart',
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
        name: 'Followers',
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#46e4a2',
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
        name: 'Posts',
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#46e4a2',
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
        name: 'Following',
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#46e4a2',
        lineWidth: 5
    }],
});

for (let i = 0; i < Object.keys(daily_stats).length; i++) {
    let date = Date.parse(Object.keys(daily_stats)[i]);
    stats_chart1.series[0].addPoint([date, daily_stats[Object.keys(daily_stats)[i]].follower_count]);
    stats_chart2.series[0].addPoint([date, daily_stats[Object.keys(daily_stats)[i]].post_count]);
    stats_chart3.series[0].addPoint([date, daily_stats[Object.keys(daily_stats)[i]].following_count]);
}

if (document.URL.includes('?live=followers')) {
    document.getElementById('live_label').innerText = 'Followers';
    dataget = 'follower_count';
    updateInterval = setInterval(updateLive, 2000);
    updateLive();
    chart.yAxis[0].update({
        title: {
            text: 'Followers'
        }
    });
    chart.series[0].update({
        name: 'Followers'
    });
    document.getElementById('liveCounter').style.display = 'block';
} else if (document.URL.includes('?live=following')) {
    document.getElementById('live_label').innerText = 'Following';
    dataget = 'following_count';
    updateInterval = setInterval(updateLive, 2000);
    updateLive();
    chart.yAxis[0].update({
        title: {
            text: 'Following'
        }
    });
    chart.series[0].update({
        name: 'Following'
    });
    document.getElementById('liveCounter').style.display = 'block';
} else if (document.URL.includes('?live=posts')) {
    document.getElementById('live_label').innerText = 'Posts';
    dataget = 'post_count';
    updateInterval = setInterval(updateLive, 2000);
    updateLive();
    chart.yAxis[0].update({
        title: {
            text: 'Posts'
        }
    });
    chart.series[0].update({
        name: 'Posts'
    });
    document.getElementById('liveCounter').style.display = 'block';
}

function updateLive() {
    fetch('/api/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'id': id
        })
    }).then(response => response.json())
        .then(data => {
            document.getElementById('live_name').innerText = data.user.display_name;
            document.getElementById('live_count').innerText = data.user[dataget];
            chart.series[0].addPoint([Date.now(), data.user[dataget]])
        });
}

function toggleLive() {
    window.location.href = '/user/' + id;
}