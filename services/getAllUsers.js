import fetch from 'node-fetch';
import dotenv from 'dotenv';
import db from './db1.js';
dotenv.config();

let index = 0;
let going = false;
async function getAllUsersLol() {
    if (going == false) {
        index = db.keys().length + 1030;
        console.log(db.keys().length);
    }
    going = true;
    try {
        return await fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/user_profiles?select=%2A&sequence_id=gt.${index}&apikey=${process.env.API_KEY}&limit=1000`)
            .then(response => response.json())
            .then(async data => {
                let time = new Date();
                console.log(data.length);
                if (data.length === 0) {
                    index = data[0].sequence_id;
                    going = false;
                    return {
                        "success": true,
                        "code": 200
                    };
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

export { getAllUsersLol };