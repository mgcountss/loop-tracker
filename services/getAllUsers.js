import fetch from 'node-fetch';
import dotenv from 'dotenv';
import db from './db1.js';
dotenv.config();

let index = 0;
let going = false;
async function getAllUsersLol() {
    if (going == false) {
        index = db.keys().length + 1030;
    }
    going = true;
    try {
        return await fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/user_profiles?select=%2A&sequence_id=gt.${index}&apikey=${process.env.API_KEY}&limit=1000`)
            .then(response => response.json())
            .then(async data => {
                let time = new Date();
                if (data.length === 0) {
                    index = data[0].sequence_id;
                    going = false;
                    part2Lol();
                }
                for (let i = 0; i < data.length; i++) {
                    let daily = {};
                    if (db.get(data[i].user_id)) {
                        daily = db.get(data[i].user_id).daily;
                    }
                    daily[time.toISOString().split('T')[0]] = {
                        "post_count": data[i].post_count,
                        "follower_count": data[i].follower_count,
                        "following_count": data[i].following_count
                    };
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
                    //console.log("Adding user " + data[i].username + " to database")
                    db.overset(data[i].user_id, json);
                }
                index += data.length;
                return getAllUsersLol();
            }).catch(error => {
                return {
                    "error": "internal server error",
                    "success": false,
                    "code": 500
                };
            });
    } catch (error) {
        return {
            "error": "internal server error",
            "success": false,
            "code": 500
        };
    };
}

function part2Lol() {
    let list = db1.keys();
    let numbers = [];
    for (let i = 0; i < list.length; i++) {
        let user = db1.get(list[i]);
        numbers.push(user.joined_rank);
    }

    let missing = [];
    for (let i = 1; i < Math.max(...numbers); i++) {
        if (!numbers.includes(i)) {
            missing.push(i);
        }
    }
    console.log('Missing: ' + missing.length);
    let batches = [];
    for (let i = 0; i < missing.length; i += 100) {
        batches.push(missing.slice(i, i + 100));
    }
    let time = new Date();
    for (let i = 0; i < batches.length; i++) {
        console.log(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/user_profiles?select=%2A&sequence_id=in.(${batches[i].join(',')})&apikey=${process.env.API_KEY}`);
        fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/user_profiles?select=%2A&sequence_id=in.(${batches[i].join(',')})&apikey=${process.env.API_KEY}`)
            .then(response => response.json())
            .then(data => {
                for (let j = 0; j < data.length; j++) {
                    let daily = {};
                    if (db1.get(data[j].user_id)) {
                        daily = db1.get(data[j].user_id).daily;
                    }
                    daily[time.toISOString().split('T')[0]] = {
                        "post_count": data[j].post_count,
                        "follower_count": data[j].follower_count,
                        "following_count": data[j].following_count
                    };
                    const json = {
                        "id": data[j].user_id,
                        "created_at": data[j].created_at,
                        "username": data[j].username,
                        "display_name": data[j].display_name,
                        "profile_picture_url": data[j].profile_picture_url,
                        "bio": data[j].bio,
                        "is_banned": data[j].is_banned,
                        "post_count": data[j].post_count,
                        "follower_count": data[j].follower_count,
                        "following_count": data[j].following_count,
                        "joined_rank": data[j].sequence_id,
                        "daily": daily
                    }
                    //console.log("Adding user " + data[j].username + " to database")
                    db1.overset(data[j].user_id, json);
                }
            });
    }
}

export { getAllUsersLol };