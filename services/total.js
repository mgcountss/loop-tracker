import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
const router = express.Router();
dotenv.config();

async function getTotal() {
    try {
        return await fetch(`https://iimlchgzyhltrqkbtaqx.supabase.co/rest/v1/user_profiles?select=%2A&sequence_id=lt.100000&apikey=${process.env.API_KEY}&limit=1&order=sequence_id.desc`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.API_KEY
            }
        }).then(response => response.json())
            .then(async data => {
                if (data.length === 0) {
                    return {
                        "error": "user not found",
                        "success": false,
                        "code": 404
                    };
                }
                return {
                    "total": data[0].sequence_id-1031,
                    "time": new Date().getTime(),
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
        console.log(error);
        return {
            "error": "internal server error",
            "success": false,
            "code": 500
        };
    };
}

router.post('/', async (req, res) => {
    await getTotal().then(data => {
        let code = data.code;
        delete data.code;
        res.status(code).send(data);
    });
});



export default router;
export { getTotal };