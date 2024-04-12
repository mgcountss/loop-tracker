let start = 0;
let end = 15;
let searching = false;

async function getNextBatch() {
    await fetch('/api/list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "start": start,
            "end": end,
            "sort": document.getElementById("sort").value,
            "order": document.getElementById("order").value,
            "type": type
        })
    }).then(response => response.json())
        .then(data => {
            if (start == 0) {
                document.getElementById("results").innerHTML = "";
            }
            if (data.success && type == 'users') {
                for (let i = 0; i < data.data.length; i++) {
                    let user = data.data[i];
                    let channel = user[1];
                    let div = document.createElement("div");
                    div.className = "result";
                    div.onclick = () => {
                        window.location.href = `/user/${channel.id}`
                    };
                    let rank = start + i + 1;
                    let gainMaybe = `<h2 class="overlay-label">${ channel.follower_count.toLocaleString('en-us') } followers | ${ channel.post_count.toLocaleString('en-us') } posts | ${ channel.following_count.toLocaleString('en-us') } following</h2>`;
                    if (channel.gained) {
                        gainMaybe = `<h2 class="overlay-label">Followers +${ channel.gained.follower_count.toLocaleString('en-us') } | Posts +${ channel.gained.post_count.toLocaleString('en-us') } | Following +${ channel.gained.following_count.toLocaleString('en-us') }</h2>`;
                    }
                    div.innerHTML = `
                <div class="background-image" style="background: url('${ channel.profile_picture_url }') no-repeat center center; background-size: cover;"></div>
                <div class="overlay">
                <img src="${channel.profile_picture_url}" alt="Profile Picture" class="profile-picture">
                  <h3 class="overlay-label">#${rank} ${ channel.display_name }</h3>
                  <h6 class="overlay-label">@${channel.username}</h6>
                  ${gainMaybe}
                  <hr><h5 class="overlay-label">Joined: ${ moment(channel.created_at).format('MMMM Do, YYYY') } (#${ channel.joined_rank.toLocaleString('en-us') })</h5>
                  <h4 class="overlay-label">${ channel.bio }</h4>
                </div>`;
                    document.getElementById("results").appendChild(div);
                    searching = false;
                }
            } else if (data.success && type == 'posts') {
                for (let i = 0; i < data.data.length; i++) {
                    let post = data.data[i];
                    let postData = post;
                    let div = document.createElement("div");
                    div.className = "result post";
                    div.onclick = () => {
                        window.location.href = `/uploads/${postData.user_id}`
                    };
                    let rank = start + i + 1;
                    div.innerHTML = `
                <div class="background-image" style="background: url('${ postData.thumbnail_url }') no-repeat center center; background-size: cover;"></div>
                <div class="overlay">
                <img src="${postData.thumbnail_url}" alt="Thumbnail" class="thumbnail">
                    <h3 class="overlay-label">#${rank} ${ postData.caption }</h3>
                    <h4 class="overlay-label">@${ postData.username }</h4>
                    <hr><h5 class="overlay-label">Loops: ${ postData.loop_count.toLocaleString('en-us') } | Likes: ${ postData.like_count.toLocaleString('en-us') } | Comments: ${ postData.comment_count.toLocaleString('en-us') } | Uploaded Rank: ${ postData.sequence_id.toLocaleString('en-us') }</h5>
                    <h6 class="overlay-label">${ moment(postData.created_at).format('MMMM Do, YYYY') }</h6>
                </div>`;
                    document.getElementById("results").appendChild(div);
                    searching = false;
                }
            }
            start = end;
            end += 10;
        }).catch(error => {
            console.log(error);
            console.log("Internal server error");
        });
}

getNextBatch();

document.addEventListener('scroll', () => {
    if (searching == false) {
        if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 50) {
            searching = true;
            getNextBatch();
        }
    }
});

function getUsers() {
    start = 0;
    end = 10;
    getNextBatch();
}