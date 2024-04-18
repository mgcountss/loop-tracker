import express from 'express';
import fetch from 'node-fetch';
import db from '../services/db2.js';
import dotenv from 'dotenv';
import validator from 'validator';
import { getNewAccessToken, access_token } from '../services/auth.js';
const router = express.Router();
dotenv.config();

async function getUploads(id, limit) {
    try {
        let uploads = await db.get(id);
        if (!uploads || uploads.length == 0) {
            db.set(id, []);
            let data = await updateUploads(id, limit, [], []);
            return data;
        }
        let uploadIds = [];
        let uploadCount = uploads.length;
        for (let i = 0; i < uploads.length; i++) {
            if (uploads[i]) {
                uploadIds.push(uploads[i].post_id);
            }
        }
        if (uploadCount == limit) {
            updateUploads(id, limit, uploads, uploadIds);
            return {
                "uploads": uploads,
                "success": true,
                "code": 200
            };
        } else if (uploadCount >= limit) {
            limit = uploadCount - limit;
        }
        return await updateUploads(id, limit, uploads, uploadIds);
    } catch (error) {
        console.error(error);
        return {
            "error": "internal server error",
            "success": false,
            "code": 500
        };
    };
}

async function updateUploads(id, limit, uploads, uploadIds) {
    return await fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/feed_posts?select=%2A&user_id=eq.${id}&order=sequence_id.desc.nullslast&limit=${limit}&apikey=${process.env.API_KEY}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.API_KEY,
            'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => response.json())
        .then(async posts => {
            if (posts.code == "PGRST301") {
                const tokens = await getNewAccessToken();
                if ((tokens.access_token)) {
                    return await updateUploads(id, limit, uploads, uploadIds);
                }
            }
            let time = new Date();
            if (posts.length == 0) {
                return {
                    "error": "This user has 0 uploads",
                    "success": false,
                    "code": 404,
                    "novids": true
                };
            }
            for (let i = 0; i < posts.length; i++) {
                if (!uploadIds.includes(posts[i].post_id)) {
                    let daily = {};
                    daily[time.toISOString().split('T')[0]] = {
                        "loop_count": posts[i].loop_count,
                        "like_count": posts[i].like_count,
                        "comment_count": posts[i].comment_count
                    };
                    uploads.push({
                        "post_id": posts[i].post_id,
                        "user_id": posts[i].user_id,
                        "created_at": posts[i].created_at,
                        "caption": posts[i].caption,
                        "thumbnail_url": posts[i].thumbnail_url,
                        "aspect_ratio": posts[i].aspect_ratio,
                        "sequence_id": posts[i].sequence_id,
                        "loop_count": posts[i].loop_count,
                        "like_count": posts[i].like_count,
                        "comment_count": posts[i].comment_count,
                        "hashtags": posts[i].hashtags,
                        "username": posts[i].username,
                        "profile_picture_url": posts[i].profile_picture_url,
                        "daily": daily
                    });
                } else {
                    for (let j = 0; j < uploads.length; j++) {
                        if (uploads[j].post_id == posts[i].post_id) {
                            uploads[j].loop_count = posts[i].loop_count;
                            uploads[j].like_count = posts[i].like_count;
                            uploads[j].comment_count = posts[i].comment_count;
                            uploads[j].daily[posts[i].created_at.split('T')[0]] = {
                                "loop_count": posts[i].loop_count,
                                "like_count": posts[i].like_count,
                                "comment_count": posts[i].comment_count
                            };
                        }
                    }
                }
            }
            db.overset(id, uploads);
            return {
                "uploads": uploads,
                "success": true,
                "code": 200
            };
        }).catch(error => {
            console.error(error);
            return {
                "error": "internal server error",
                "success": false,
                "code": 500
            };
        });
}

router.post('/', async (req, res) => {
    try {
        if (req.body.uploadID) {
            if (!validator.isUUID(req.body.uploadID)) {
                return res.status(400).send({
                    "error": "uploadID must be a UUID",
                    "success": false
                });
            } else {
                let uploads = await db.get(req.body.id);
                if (!uploads || uploads.length == 0) {
                    return res.status(404).send({
                        "error": "This user has 0 uploads",
                        "success": false,
                        "novids": true
                    });
                }
                for (let i = 0; i < uploads.length; i++) {
                    if (uploads[i].post_id == req.body.uploadID) {
                        return res.status(200).send({
                            "upload": uploads[i],
                            "success": true
                        });
                    }
                }
                return res.status(404).send({
                    "error": "upload not found",
                    "success": false
                });
            }
        } else {
            if (!req.body.id) {
                return res.status(400).send({
                    "error": "missing id",
                    "success": false
                });
            } else if (!req.body.limit) {
                return res.status(400).send({
                    "error": "missing limit",
                    "success": false
                });
            }
            if (!validator.isInt(req.body.limit.toString())) {
                return res.status(400).send({
                    "error": "limit must be an integer",
                    "success": false
                });
            }
            if (!validator.isUUID(req.body.id)) {
                return res.status(400).send({
                    "error": "id must be a UUID",
                    "success": false
                });
            }
            return await getUploads(req.body.id, req.body.limit).then(data => {
                let code = data.code;
                delete data.code;
                return res.status(code).send(data);
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            "error": "internal server error",
            "success": false
        });
    };
});

export default router;
export { getUploads };