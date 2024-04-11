function setError(error) {
    document.getElementById('error').innerText = error;
    document.getElementById('error').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
}

function search() {
    document.getElementById('results').innerHTML = '';
    document.getElementById('loading').style.display = 'block';
    fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            search_text: document.getElementById('searchBar').value
        })
    })
        .then(response => response.json())
        .then(data => {
            if ((data.error) || (data.results == 0)) {
                setError('No results found!');
            } else {
                for (let i = 0; i < data.results.length; i++) {
                    let channel = data.results[i];
                    let div = document.createElement('div');
                    div.className = 'result';
                    div.innerHTML = `<div class="result" onclick="window.location.href = '/user/${channel.id }'">
                    <div class="background-image" style="background: url('${channel.profile_picture_url }') no-repeat center center; background-size: cover;"></div>
                    <div class="overlay">
                      <h1 class="overlay-label">${channel.display_name}</h1><hr>
                      <h2 class="overlay-label">${channel.follower_count.toLocaleString('en-us')} followers</h2>
                      <h3 class="overlay-label">Joined: ${moment(channel.created_at).format('MMMM Do, YYYY') } (#${channel.joined_rank.toLocaleString('en-us')})</h3>
                      <h4 class="overlay-label">@${channel.username}</h4>
                    </div>
                  </div>`;
                    div.onclick = function () {
                        window.location.href = '/user/' + data.results[i].id;
                    }
                    document.getElementById('results').appendChild(div);
                }
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'none';
            }
        });
}

function getUserId() {
    document.getElementById('results').innerHTML = '';
    document.getElementById('loading').style.display = 'block';
    fetch('/api/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: document.getElementById('searchBar').value.substring(1)
        })
    }).then(response => response.json())
        .then(data => {
            if (data.error) {
                setError('User not found!');
            } else {
                window.location.href = '/user/' + data.user.id;
                document.getElementById('loading').style.display = 'none';
            }
        });

}

document.getElementById('searchBar').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
        if (document.getElementById('searchBar').value.startsWith('@')) {
            getUserId();
        } else {
            search();
        }
    }
});

document.getElementById('searchButton').addEventListener('click', function () {
    if (document.getElementById('searchBar').value.startsWith('@')) {
        getUserId();
    } else {
        search();
    }
});

document.getElementById('holder').addEventListener('click', function () {
    document.getElementById('searchBar').focus();
});

document.getElementById('searchBar').addEventListener('focus', function () {
    document.getElementById('holder').style.display = 'none';
});

document.getElementById('searchBar').addEventListener('blur', function () {
    if (document.getElementById('searchBar').value === '') {
        document.getElementById('holder').style.display = 'block';
    }
});