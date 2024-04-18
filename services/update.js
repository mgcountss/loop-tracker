import fetch from 'node-fetch';
import dotenv from 'dotenv';
import db from './db1.js';
import db2 from './db2.js';
import { getNewAccessToken, access_token } from '../services/auth.js';
dotenv.config();

const update = async () => {
    console.log('Updating database...');
    const ids = db.keys();
    let groups = [];
    for (let i = 0; i < ids.length; i += 100) {
        groups.push(ids.slice(i, i + 100));
    }
    for (let i = 0; i < groups.length; i++) {
        await updateProfiles(groups[i]);
    }
    updateDailyForAllUploads();
}

async function updateProfiles(ids) {
    return await fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/user_profiles?select=%2A&user_id=in.(${ids.join(',')})&apikey=${process.env.API_KEY}`)
        .then(response => response.json())
        .then(async data => {
            for (let i = 0; i < data.length; i++) {
                let date = new Date();
                let daily = db.get(data[i].user_id).daily;
                if (!daily) {
                    daily = {};
                }
                daily[date.toISOString().split('T')[0]] = {
                    "post_count": data[i].post_count,
                    "follower_count": data[i].follower_count,
                    "following_count": data[i].following_count
                };
                delete daily["undefined"];
                const json = {
                    "id": data[i].user_id,
                    "created_at": data[i].created_at,
                    "username": data[i].username,
                    "display_name": data[i].display_name,
                    "profile_picture_url": data[i].profile_picture_url,
                    "bio": data[i].bio,
                    "is_banned": data[i].is_banned,
                    "post_count": data[i].post_count,
                    "follower_count": data[i].follower_count,
                    "following_count": data[i].following_count,
                    "joined_rank": data[i].sequence_id,
                    "daily": daily
                }
                db.overset(data[i].user_id, json);
                console.log(`Updated ${data[i].username}`);
            }
            return;
        }).catch(error => {
            console.log(error);
            return updateProfiles(ids);
        });
}

async function updateDailyForAllUploads() {
    let users = db.keys();
    for (let i = 0; i < users.length; i++) {
        await updateVideos(users[i])
    }
}

async function updateVideos(id) {
    let uploadCount = db.get(id).post_count;
    let uploadIds = [];
    let uploads = db2.get(id);
    if (!uploads) {
        uploads = [];
    }
    for (let j = 0; j < uploadCount; j++) {
        if (uploads[j]) {
            uploadIds.push(uploads[j].post_id);
        }
    }
    console.log(`Updating ${id}'s uploads...`);
    return await fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/feed_posts?select=%2A&user_id=eq.${id}&order=sequence_id.desc.nullslast&limit=${uploadCount}&apikey=${process.env.API_KEY}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => response.json())
        .then(posts => {
            let time = new Date();
            console.log(posts);
            for (let k = 0; k < posts.length; k++) {
                if (uploadIds.includes(posts[k].post_id)) {
                    let post = db2.get(id).find(post => post.post_id == posts[k].post_id);
                    post.daily[time.toISOString().split('T')[0]] = {
                        "loop_count": posts[k].loop_count,
                        "like_count": posts[k].like_count,
                        "comment_count": posts[k].comment_count
                    };
                    console.log(post.daily)
                    db2.overset(id, uploads);
                } else {
                    let daily = {};
                    daily[time.toISOString().split('T')[0]] = {
                        "loop_count": posts[k].loop_count,
                        "like_count": posts[k].like_count,
                        "comment_count": posts[k].comment_count
                    };
                    console.log(daily)
                    uploads.push({
                        "post_id": posts[k].post_id,
                        "user_id": posts[k].user_id,
                        "created_at": posts[k].created_at,
                        "caption": posts[k].caption,
                        "thumbnail_url": posts[k].thumbnail_url,
                        "aspect_ratio": posts[k].aspect_ratio,
                        "sequence_id": posts[k].sequence_id,
                        "loop_count": posts[k].loop_count,
                        "like_count": posts[k].like_count,
                        "comment_count": posts[k].comment_count,
                        "hashtags": posts[k].hashtags,
                        "username": posts[k].username,
                        "profile_picture_url": posts[k].profile_picture_url,
                        "daily": daily
                    });
                    db2.overset(id, uploads);
                }
            }
            return;
        }).catch(error => {
            console.error(error);
            return updateVideos(i);
        });
}

//update();
//updateDailyForAllUploads();

export default update;