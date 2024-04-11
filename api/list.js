import express from 'express';
import dotenv from 'dotenv';
import db1 from '../services/db1.js';
import db2 from '../services/db2.js';
const router = express.Router();
dotenv.config();

async function getUsers(start, end, sort, order) {
    try {
        let data = db1.sortData(sort, order, start, end);
        return {
            "data": data,
            "success": true,
            "code": 200
        };
    } catch (error) {
        console.log(error);
        return {
            "error": "internal server error",
            "success": false,
            "code": 500
        };
    };
};

async function getPosts(start, end, sort, order) {
    try {
        let data = db2.sortData(sort, order, start, end);
        return {
            "data": data,
            "success": true,
            "code": 200
        };
    } catch (error) {
        console.log(error);
        return {
            "error": "internal server error",
            "success": false,
            "code": 500
        };
    };
};

router.post('/', async (req, res) => {
    if (req.body.type == 'users') {
        ``
        if ((req.body.start || req.body.start == 0) && (req.body.end) && (req.body.sort) && (req.body.order)) {
            return await getUsers(req.body.start, req.body.end, req.body.sort, req.body.order).then(data => {
                let code = data.code;
                delete data.code;
                res.status(code).send(data);
            });
        }
    } else if (req.body.type == 'posts') {
        if ((req.body.start || req.body.start == 0) && (req.body.end) && (req.body.sort) && (req.body.order)) {
            return await getPosts(req.body.start, req.body.end, req.body.sort, req.body.order).then(data => {
                let code = data.code;
                delete data.code;
                res.status(code).send(data);
            });
        }
    }
    return res.status(400).send({
        "error": "missing start, end, sort, order, or type",
        "success": false
    });
});

export default router;
export { getUsers };