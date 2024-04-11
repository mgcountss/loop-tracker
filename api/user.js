import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import db from '../services/db1.js';
import { getNewAccessToken, access_token } from '../services/auth.js';
const router = express.Router();
dotenv.config();

async function getUser(id) {
    try {
        return await fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/user_profiles?select=%2A&user_id=eq.${id}&apikey=${process.env.API_KEY}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.API_KEY,
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(response => response.json())
            .then(async data => {
                if (data.code == "PGRST301") {
                    const tokens = await getNewAccessToken();
                    if ((tokens.access_token)) {
                        return await getUser(id);
                    }
                }
                let time = new Date();
                if (data.length === 0) {
                    return {
                        "error": "user not found",
                        "success": false,
                        "code": 404
                    };
                }
                let daily = {};
                if (db.get(data[0].user_id)) {
                    daily = db.get(data[0].user_id).daily;
                }
                daily[time.toISOString().split('T')[0]] = {
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
                return {
                    "user": json,
                    "success": true,
                    "code": 200
                };
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

async function getUserFromName(name) {
    try {
        return await fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/user_profiles?select=%2A&username=eq.${name}&apikey=${process.env.API_KEY}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.API_KEY,
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(response => response.json())
            .then(async data => {
                if (data.code == "PGRST301") {
                    const tokens = await getNewAccessToken();
                    if ((tokens.access_token)) {
                        return await getUserFromName(name);
                    }
                }
                let time = new Date();
                if (data.length === 0) {
                    return {
                        "error": "user not found",
                        "success": false,
                        "code": 404
                    };
                }
                let daily = {};
                if (db.get(data[0].user_id)) {
                    daily = db.get(data[0].user_id).daily;
                }
                daily[time.toISOString().split('T')[0]] = {
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
                return {
                    "user": json,
                    "success": true,
                    "code": 200
                };
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

router.post('/', async (req, res) => {
    if (req.body.id) {
        await getUser(req.body.id).then(data => {
            let code = data.code;
            delete data.code;
            res.status(code).send(data);
        });
    } else if (req.body.name) {
        await getUserFromName(req.body.name).then(data => {
            let code = data.code;
            delete data.code;
            res.status(code).send(data);
        });
    } else {
        res.status(400).send({
            "error": "invalid request",
            "success": false
        });
    }
});

export default router;
export { getUser };