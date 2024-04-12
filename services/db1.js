import fs from "fs";
import { start } from "repl";
let db = {};

if (!fs.existsSync("./database")) {
    fs.mkdirSync("./database");
    fs.mkdirSync("./database/backups1");
    fs.writeFileSync("./database/db1.json", "{}");
    db = JSON.parse(fs.readFileSync("./database/db1.json", "utf8"));
} else {
    db = JSON.parse(fs.readFileSync("./database/db1.json", "utf8"));
}

const get = (id) => {
    return db[id];
};

const del = (id) => {
    delete db[id];
};

const set = (id, value, path) => {
    if (path) {
        db[id][path] = value;
    } else {
        db[id] = value;
    }
};

const overset = (id, value) => {
    db[id] = value;
};

const has = (id) => {
    return !!db[id];
};

const sortData = (key, order, start, end) => {
    try {
        let newDB = Object.entries(db);
        if (key == "username" || key == "display_name") {
            let newData = newDB.sort((a, b) => {
                if (order === "asc") {
                    return a[1][key].localeCompare(b[1][key]);
                } else {
                    return b[1][key].localeCompare(a[1][key]);
                }
            }).slice(start, end);
            return newData;
        } else if (key == "follower_gain_7" || key == "post_gain_7" || key == "following_gain_7" || key == "follower_gain_24" || key == "post_gain_24" || key == "following_gain_24") {
            let newDB = JSON.parse(JSON.stringify(db));
            let date = new Date();
            date.setDate(date.getDate() - 1);
            if (key.includes("7")) {
                date.setDate(date.getDate() - 6);
            }
            let dateStr = date.toISOString().split("T")[0];
            let todayDateStr = new Date().toISOString().split("T")[0];

            for (let key in newDB) {
                let user = newDB[key];
                let daily = user.daily;
                let today = daily[todayDateStr];
                if (!today) {
                    let keys = Object.keys(daily);
                    today = daily[keys[keys.length - 1]];
                }
                let daysAgo = daily[dateStr];
                if (!daysAgo) {
                    let keys = Object.keys(daily);
                    daysAgo = daily[keys[0]];
                }
                user.gained = {
                    post_count: today.post_count - daysAgo.post_count,
                    follower_count: today.follower_count - daysAgo.follower_count,
                    following_count: today.following_count - daysAgo.following_count
                };
            };
            let users = Object.entries(newDB);
            let sorted;

            if (key.includes("follower")) {
                sorted = users.sort((a, b) => {
                    return b[1].gained.follower_count - a[1].gained.follower_count;
                });
            } else if (key.includes("post")) {
                sorted = users.sort((a, b) => {
                    return b[1].gained.post_count - a[1].gained.post_count;
                });
            } else if (key.includes("following")) {
                sorted = users.sort((a, b) => {
                    return b[1].gained.following_count - a[1].gained.following_count;
                });
            }
            let data = sorted.slice(start, end);
            return data;
        } else {
            let newData = newDB.sort((a, b) => {
                if (order === "asc") {
                    return parseInt(a[1][key]) - parseInt(b[1][key]);
                } else {
                    return parseInt(b[1][key]) - parseInt(a[1][key]);
                }
            }).slice(start, end);
            return newData;
        }
    } catch (error) {
        console.log(error);
    }
};

const ensure = (id, value) => {
    if (!db[id]) {
        db[id] = value;
    } else {
        for (const key in value) {
            db[id][key] = value[key];
        }
    }
};

const keys = () => {
    const db = JSON.parse(fs.readFileSync("./database/db1.json", "utf8"));
    return Object.keys(db);
};

const all = () => {
    return db;
};

const getTheChannels = () => {
    let keys = Object.keys(db);
    let thisDB = JSON.parse(JSON.stringify(db));
    let mostFollowed = thisDB[keys[0]];
    let mostPosts = thisDB[keys[0]];
    let mostFollowing = thisDB[keys[0]];
    let newest = thisDB[keys[0]];
    let random = thisDB[keys[0]];
    let us = thisDB["e52ca022-73e0-4bb1-b093-f5de4c50c7b2"];
    for (let i = 1; i < keys.length; i++) {
        if (thisDB[keys[i]].follower_count > mostFollowed.follower_count) {
            mostFollowed = thisDB[keys[i]];
        }
        if (thisDB[keys[i]].post_count > mostPosts.post_count) {
            mostPosts = thisDB[keys[i]];
        }
        if (thisDB[keys[i]].following_count > mostFollowing.following_count) {
            mostFollowing = thisDB[keys[i]];
        }
        if (thisDB[keys[i]].created_at > newest.created_at) {
            newest = thisDB[keys[i]];
        }
    }
    const setRandom = () => {
        random = thisDB[keys[Math.floor(Math.random() * keys.length)]];
        if (random === mostFollowed || random === mostPosts || random === mostFollowing || random === newest || random === us) {
            setRandom();
        }
    };
    setRandom();
    mostFollowed.label = "Most Followed";
    mostFollowed.thing = "follower_count";
    mostFollowed.thing_label = "followers";
    random.label = "Random User";
    random.thing = "follower_count";
    random.thing_label = "followers";
    mostPosts.label = "Most Posts";
    mostPosts.thing = "post_count";
    mostPosts.thing_label = "posts";
    mostFollowing.label = "Most Following";
    mostFollowing.thing = "following_count";
    mostFollowing.thing_label = "following";
    newest.label = "Newest User";
    newest.thing = "follower_count";
    newest.thing_label = "followers";
    us.label = "Our Account"
    us.thing = "follower_count";
    us.thing_label = "followers";
    return [mostFollowed, mostPosts, mostFollowing, newest, random, us];
};

const save = () => {
    fs.writeFileSync("./database/db1.json", JSON.stringify(db, {}));
};

setInterval(() => {
    fs.writeFileSync("./database/db1.json", JSON.stringify(db, {}));
}, 1000);

setInterval(() => {
    fs.writeFileSync("./database/backups1/" + Date.now() + ".json", JSON.stringify(db, {}));
}, 1000 * 60 * 60 * 2);

export default {
    get,
    set,
    has,
    ensure,
    keys,
    delete: del,
    all,
    save,
    overset,
    sortData,
    getTheChannels
};