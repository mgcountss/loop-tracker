import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import update from './services/update.js';
import moment from 'moment';
import validator from 'validator';
import db1 from './services/db1.js';
import db2 from './services/db2.js';
import { getTotal } from './services/total.js';
import { getAllUsersLol } from './services/getAllUsers.js';
import { url } from 'inspector';
dotenv.config();
const app = express();
const __dirname = path.resolve();
app.use(bodyParser.json());
app.set('view engine', 'ejs');
let userFunctions = {};

setInterval(() => {
    getAllUsersLol();
}, (86400000 / 2));
getAllUsersLol();

app.use((req, res, next) => {
    if (process.env.NODE_ENV == 'production') {
        if (req.protocol == "http") {
            return res.redirect(301, `https://${req.headers.host}${req.url}`);
        } else if (req.headers.host != process.env.DOMAIN) {
            return res.redirect(301, `https://${process.env.DOMAIN}${req.url}`);
        }
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

fs.readdirSync('./api/').forEach(async (file) => {
    const route = await import(`./api/${file}`);
    app.use('/api/' + file.split('.')[0], route.default);
    eval(`userFunctions.${file.split('.')[0]} = Object.values(route)[1]`);
});

app.get('/images/*', (req, res) => {
    res.sendFile(__dirname + req.url);
});

app.get('/', async (req, res) => {
    let channels = db1.getTheChannels();
    let channelCount = db1.keys();
    let postCount = db2.keys();
    res.render('index', {
        channels: channels,
        channelCount: channelCount.length,
        postCount: postCount.length,
        moment: moment,
        url: "index"
    });
});

app.get('/user/:id', async (req, res) => {
    if (!validator.isUUID(req.params.id)) return res.render('error', { error: 'Invalid user id' });
    try {
        const user = await userFunctions.user(req.params.id);
        const history = await userFunctions.history(user.user.id);
        if (user.success) {
            res.render('user', {
                user: user.user,
                history: history.history,
                moment: moment,
                url: "user/" + req.params.id
            });
        } else {
            res.render('error', {
                error: user.error,
                url: "error"
            });
        }
    } catch (error) {
        res.render('error', {
            error: error,
            url: "error"
        });
    }
});

app.get('/compare/:id1/:id2', async (req, res) => {
    if (!validator.isUUID(req.params.id1) || !validator.isUUID(req.params.id2)) return res.render('error', { error: 'Invalid user id' });
    try {
        const user1 = await userFunctions.user(req.params.id1);
        const user2 = await userFunctions.user(req.params.id2);
        if (user1.success && user2.success) {
            res.render('compare', {
                user1: user1.user,
                user2: user2.user,
                history1: user1.user.daily,
                history2: user2.user.daily,
                moment: moment,
                url: "compare/" + req.params.id1 + "/" + req.params.id2
            });
        } else {
            res.render('error', {
                error: user1.error || user2.error,
                url: "error"
            });
        }
    } catch (error) {
        res.render('error', {
            error: error,
            url: "error"
        });
    }
});

app.get('/compare/search', async (req, res) => {
    res.render('compare_search', {
        url: "compare_search"
    });
});

app.get('/uploads/:id', async (req, res) => {
    try {
        if (!validator.isUUID(req.params.id)) return res.render('error', { error: 'Invalid user id' });
        const user = await userFunctions.user(req.params.id, true);
        const uploads = await userFunctions.uploads(req.params.id, user.user.post_count);
        if (uploads.novids && uploads.novids == true) {
            res.render('uploads', {
                user: user.user,
                uploads: [],
                moment: moment,
                novids: true,
                url: "uploads/" + req.params.id
            });
        } else {
            if (uploads.success) {
                res.render('uploads', {
                    user: user.user,
                    uploads: uploads.uploads,
                    moment: moment,
                    url: "uploads/" + req.params.id
                });
            } else {
                res.render('error', {
                    error: uploads.error,
                    url: "error"
                });
            }
        }
    } catch (error) {
        res.render('error', {
            error: error,
            url: "error"
        });
    }
});

app.get('/lists/:type', (req, res) => {
    if (req.params.type == 'users') {
        let total = db1.keys().length;
        res.render('list', {
            total: total,
            type: 'Users',
            options: [
                { "name": "Followers", "value": "follower_count" },
                { "name": "Posts", "value": "post_count" },
                { "name": "Following", "value": "following_count" },
                { "name": "Follower Gain (1D)", "value": "follower_gain_24" },
                { "name": "Post Gain (1D)", "value": "post_gain_24" },
                { "name": "Following Gain (1D)", "value": "following_gain_24" },
                { "name": "Follower Gain (7D)", "value": "follower_gain_7" },
                { "name": "Post Gain (7D)", "value": "post_gain_7" },
                { "name": "Following Gain (7D)", "value": "following_gain_7" },
                { "name": "Display Name", "value": "display_name" },
                { "name": "Handle", "value": "username" },
                { "name": "Date Joined", "value": "joined_rank" }],
            url: "lists/users"
        });
    } else if (req.params.type == 'posts') {
        let total = db2.keys().length;
        res.render('list', {
            total: total,
            type: 'Posts',
            options: [
                { "name": "Loops", "value": "loop_count" },
                { "name": "Likes", "value": "like_count" },
                { "name": "Comments", "value": "comment_count" },
                { "name": "Date Uploaded", "value": "sequence_id" },
                { "name": "Uploaded By", "value": "username" },
                { "name": "Caption", "value": "caption" },
                { "name": "Hashtags", "value": "hashtags" }],
            url: "lists/posts"
        });
    } else {
        res.render('error', {
            error: 'Invalid list type',
            url: "error"
        });
    }
});

app.get('/css/*', (req, res) => {
    if (req.url.includes('?')) {
        req.url = req.url.split('?')[0];
    }
    res.sendFile(__dirname + '/views/css/' + req.url.split('/')[2]);
});

app.get('/js/*', (req, res) => {
    if (req.url.includes('?')) {
        req.url = req.url.split('?')[0];
    }
    res.sendFile(__dirname + '/views/js/' + req.url.split('/')[2]);
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/images/favicon.ico');
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(__dirname + '/views/assets/robots.txt');
});

app.get('/sitemap.xml', (req, res) => {
    res.sendFile(__dirname + '/views/assets/sitemap.xml');
});

app.get('*', (req, res) => {
    res.render('error', {
        error: '404 Not Found'
    });
});

console.log('Total Loop Users: ' + (await getTotal()).total.toLocaleString());

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

setInterval(() => {
    let time = new Date();
    let hours = time.getHours();
    let minutes = time.getMinutes();
    if (hours === 0 || hours === 12) {
        if (minutes === 0) {
            update();
        }
    }
}, 60000);