import fetch from 'node-fetch';
import dotenv from 'dotenv';
import db from './db1.js';
import db2 from './db2.js';
dotenv.config();

const update = async () => {
    console.log('Updating database...');
    const ids = db.keys();
    for (let i = 0; i < ids.length; i++) {
        fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/user_profiles?select=%2A&user_id=eq.${ids[i]}&apikey=${process.env.API_KEY}`)
            .then(response => response.json())
            .then(async data => {
                let date = new Date();
                let daily = db.get(ids[i]).daily;
                daily[date.toISOString().split('T')[0]] = {
                    "post_count": data[0].post_count,
                    "follower_count": data[0].follower_count,
                    "following_count": data[0].following_count
                };
                const json = {
                    "id": data[0].user_id,
                    "created_at": data[0].created_at,
                    "username": data[0].username,
                    "display_name": data[0].display_name,
                    "profile_picture_url": data[0].profile_picture_url,
                    "bio": data[0].bio,
                    "is_banned": data[0].is_banned,
                    "post_count": data[0].post_count,
                    "follower_count": data[0].follower_count,
                    "following_count": data[0].following_count,
                    "joined_rank": data[0].sequence_id,
                    "daily": daily
                }
                db.overset(data[0].user_id, json);
                console.log(`Updated ${data[0].username}`);
            }).catch(error => {
                console.log(error);
            });
    }
    updateDailyForAllUploads();
}

async function updateDailyForAllUploads() {
    let users = db.keys();
    for (let i = 0; i < users.length; i++) {
        let uploadCount = db.get(users[i]).post_count;
        let uploadIds = [];
        let uploads = db2.get(users[i]);
        if (!uploads) {
            uploads = [];
        }
        for (let j = 0; j < uploadCount; j++) {
            if (uploads[j]) {
                uploadIds.push(uploads[j].post_id);
            }
        }
        console.log(`Updating ${users[i]}'s uploads...`);
        await fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/feed_posts?select=%2A&user_id=eq.${users[i]}&order=sequence_id.desc.nullslast&limit=${uploadCount}&apikey=${process.env.API_KEY}`)
            .then(response => response.json())
            .then(posts => {
                let time = new Date();
                for (let k = 0; k < posts.length; k++) {
                    if (uploadIds.includes(posts[k].post_id)) {
                        let post = db2.get(users[i]).find(post => post.post_id == posts[k].post_id);
                        post.daily[time.toISOString().split('T')[0]] = {
                            "loop_count": posts[k].loop_count,
                            "like_count": posts[k].like_count,
                            "comment_count": posts[k].comment_count
                        };
                    } else {
                        let daily = {};
                        daily[time.toISOString().split('T')[0]] = {
                            "loop_count": posts[k].loop_count,
                            "like_count": posts[k].like_count,
                            "comment_count": posts[k].comment_count
                        };
                        delete daily[posts[k].created_at.split('T')[0]];
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
                    }
                }
                db2.overset(users[i], uploads);
            }).catch(error => {
                console.error(error);
            });
    }
}

export default update;