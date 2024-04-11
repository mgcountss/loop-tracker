import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import db from '../services/db1.js';
const router = express.Router();
dotenv.config();

async function getUser(ids) {
    try {
        ids = ids.join(',');
        return await fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/user_profiles?select=%2A&user_id=in.(${ids})&apikey=${process.env.API_KEY}`)
            .then(response => response.json())
            .then(async data => {
                let time = new Date();
                let users = [];
                if (data.length === 0) {
                    return {
                        "error": "user not found",
                        "success": false,
                        "code": 404
                    };
                }
                for (let i = 0; i < data.length; i++) {
                    let user = data[i];
                    let daily = {};
                    if (db.get(user.user_id)) {
                        daily = db.get(user.user_id).daily;
                    }
                    daily[time.toISOString().split('T')[0]] = {
                        "post_count": user.post_count,
                        "follower_count": user.follower_count,
                        "following_count": user.following_count
                    };
                    const json = {
                        "id": user.user_id,
                        "created_at": user.created_at,
                        "username": user.username,
                        "display_name": user.display_name,
                        "profile_picture_url": user.profile_picture_url,
                        "bio": user.bio,
                        "is_banned": user.is_banned,
                        "post_count": user.post_count,
                        "follower_count": user.follower_count,
                        "following_count": user.following_count,
                        "joined_rank": user.sequence_id,
                        "daily": daily
                    }
                    users.push(json);
                    db.overset(user.user_id, json);
                }
                return {
                    "users": users,
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
    if (!req.body.ids) {
        return res.status(400).send({
            "error": "missing ids",
            "success": false
        });
    }
    await getUser(req.body.ids).then(data => {
        let code = data.code;
        delete data.code;
        res.status(code).send(data);
    });
});



export default router;
export { getUser };