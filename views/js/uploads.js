let id = document.URL.split('/uploads/')[1];
if (id.includes('?')) {
  id = id.split('?')[0];
}
let vidID = "";
if (document.URL.includes('&id=')) {
  vidID = document.URL.split('&id=')[1];
}
let lastSort = 'uploaded';
let lastReversed = false;
let updateInterval;
let dataget = "";

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

function resort(type) {
  fetch('/api/uploads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: id,
      limit: parseFloat(document.getElementById('total').innerHTML),
    })
  }).then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        uploads = data.uploads;
        if (type === 'likes') {
          uploads.sort((a, b) => b.like_count - a.like_count);
        } else if (type === 'comments') {
          uploads.sort((a, b) => b.comment_count - a.comment_count);
        } else if (type === 'loops') {
          uploads.sort((a, b) => b.loop_count - a.loop_count);
        } else if (type === 'date') {
          uploads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        if ((lastSort === type) && !lastReversed) {
          uploads.reverse();
          lastReversed = true;
        } else {
          lastReversed = false;
        }
        lastSort = type;
        let html = '';
        /*            <div class="upload">
              <div class="background-image"
                style="background: url('<%=uploads[q].thumbnail_url%>') no-repeat center center; background-size: cover;">
              </div>
              <div class="overlay">
                <img src="<%=uploads[q].thumbnail_url%>" alt="Thumbnail" class="thumbnail">
                <h3 class="overlay-label">
                  <%=uploads[q].caption%>
                </h3>
                <h4 class="overlay-label">@<%=uploads[q].username%>
                </h4>
                <hr>
                <div class="overlay-label flex">
                  <p onclick="window.location.href = '?live=loops&id=<%=uploads[q].post_id%>'">Loops: <%=uploads[q].loop_count.toLocaleString('en-us')%></p>
                  <p onclick="window.location.href = '?live=likes&id=<%=uploads[q].post_id%>'">Likes: <%=uploads[q].like_count.toLocaleString('en-us')%></p>
                  <p onclick="window.location.href = '?live=comments&id=<%=uploads[q].post_id%>'">Comments: <%=uploads[q].comment_count.toLocaleString('en-us')%></p>
                  <p>Upload Rank: <%=uploads[q].sequence_id.toLocaleString('en-us')%></p>
                </div>
                <h6 class="overlay-label">
                  <%=moment(uploads[q].created_at).format('MMMM Do, YYYY [at] h:mm:ss a')%>
                </h6>
              </div>
            </div>*/
        for (let q = 0; q < uploads.length; q++) {
          html += `<div class="upload">
            <div class="background-image"
              style="background: url('${uploads[q].thumbnail_url}') no-repeat center center; background-size: cover;">
            </div>
            <div class="overlay">
              <img src="${uploads[q].thumbnail_url}" alt="Thumbnail" class="thumbnail">
              <h3 class="overlay-label">
                ${uploads[q].caption}
              </h3>
              <h4 class="overlay-label">@${uploads[q].username}
              </h4>
              <hr>
              <div class="overlay-label flex">
                <p onclick="window.location.href = '?live=loops&id=${uploads[q].post_id}'">Loops: ${uploads[q].loop_count.toLocaleString('en-us')}</p>
                <p onclick="window.location.href = '?live=likes&id=${uploads[q].post_id}'">Likes: ${uploads[q].like_count.toLocaleString('en-us')}</p>
                <p onclick="window.location.href = '?live=comments&id=${uploads[q].post_id}'">Comments: ${uploads[q].comment_count.toLocaleString('en-us')}</p>
                <p>Upload Rank: ${uploads[q].sequence_id.toLocaleString('en-us')}</p>
              </div>
              <h6 class="overlay-label">
                ${moment(uploads[q].created_at).format('MMMM Do, YYYY [at] h:mm:ss a')}
              </h6>
            </div>
              </div>`
        }
        document.getElementById('uploads').innerHTML = html;
      }
    })
}

if (document.URL.includes('?live=loops')) {
  document.getElementById('live_label').innerText = 'Loops';
  dataget = "loop_count";
  updateInterval = setInterval(updateLive, 2000);
  updateLive();
  chart.yAxis[0].update({
    title: {
      text: 'Loops'
    }
  });
  chart.series[0].update({
    name: 'Loops'
  });
  document.getElementById('liveCounter').style.display = 'block';
} else if (document.URL.includes('?live=likes')) {
  document.getElementById('live_label').innerText = 'Likes';
  dataget = "like_count";
  updateInterval = setInterval(updateLive, 2000);
  updateLive();
  chart.yAxis[0].update({
    title: {
      text: 'Likes'
    }
  });
  chart.series[0].update({
    name: 'Likes'
  });
  document.getElementById('liveCounter').style.display = 'block';
} else if (document.URL.includes('?live=comments')) {
  document.getElementById('live_label').innerText = 'Comments';
  dataget = "comment_count";
  updateInterval = setInterval(updateLive, 2000);
  updateLive();
  chart.yAxis[0].update({
    title: {
      text: 'Comments'
    }
  });
  chart.series[0].update({
    name: 'Comments'
  });
  document.getElementById('liveCounter').style.display = 'block';
}

function updateLive() {
  fetch('/api/uploads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: id,
      limit: parseFloat(document.getElementById('total').innerHTML),
    })
  }).then(response => response.json())
    .then(data => {
      for (let i = 0; i < data.uploads.length; i++) {
        if (data.uploads[i].post_id === vidID) {
          document.getElementById('live_count').innerText = data.uploads[i][dataget];
          chart.series[0].addPoint([Date.now(), data.uploads[i][dataget]])
          document.getElementById('live_name').innerText = data.uploads[i].caption;
        }
      }
    });
}

function toggleLive() {
    window.location.href = '/uploads/' + id;
}