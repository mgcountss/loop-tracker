import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { getNewAccessToken, access_token } from '../services/auth.js';
import db from '../services/db1.js';
import { getUser } from './user.js';
const router = express.Router();
dotenv.config();

async function searchUser(search_text) {
    try {
        return await fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/rpc/search_by_username?select=%2A`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Apikey': process.env.API_KEY,
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                "search_text": search_text
            })
        }).then(response => response.json())
            .then(async data => {
                if (data.code == "PGRST301") {
                    const tokens = await getNewAccessToken();
                    console.log(tokens);
                    if ((tokens.access_token)) {
                        return await searchUser(search_text);
                    }
                }
                let results = [];
                for (let i = 0; i < data.length; i++) {
                    let user = db.get(data[i].user_id);
                    if (!user) {
                        user = await getUser(data[i].user_id);
                    }
                    results.push({
                        "id": data[i].user_id,
                        "username": data[i].username,
                        "profile_picture_url": data[i].profile_picture_url,
                        "follower_count": user.follower_count,
                        "created_at": user.created_at,
                        "display_name": user.display_name,
                        "joined_rank": user.joined_rank
                    })
                }
                return {
                    "results": results,
                    "success": true,
                    "code": 200
                };
            }).catch(error => {
                console.log(error);
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
    if (!req.body.search_text) {
        return res.status(400).send({
            "error": "missing search_text",
            "success": false
        });
    }
    await searchUser(req.body.search_text).then(data => {
        let code = data.code;
        delete data.code;
        res.status(code).send(data);
    });
});

export default router;
export { searchUser };