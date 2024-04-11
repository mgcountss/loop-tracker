import fs from "fs";
let db = {};

if (!fs.existsSync("./database")) {
    fs.mkdirSync("./database");
    fs.mkdirSync("./database/backups2");
    fs.writeFileSync("./database/db2.json", "{}");
    db = JSON.parse(fs.readFileSync("./database/db2.json", "utf8"));
} else {
    db = JSON.parse(fs.readFileSync("./database/db2.json", "utf8"));
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
    let newDB = [];
    for (let key in db) {
        for (let key2 in db[key]) {
            newDB.push(db[key][key2]);
        }
    }
    if (key == "username" || key == "caption") {
        let newData = newDB.sort((a, b) => {
            if (order == "asc") {
                return a[key].localeCompare(b[key]);
            } else {
                return b[key].localeCompare(a[key]);
            }
        }).slice(start, end);
        return newData;
    } else if (key == "hashtags") {
        let newData = newDB.sort((a, b) => {
            if (order == "asc") {
                return a[key].length - b[key].length;
            } else {
                return b[key].length - a[key].length;
            }
        }).slice(start, end);
        return newData;
    } else {
        let newData = newDB.sort((a, b) => {
            if (order == "asc") {
                return a[key] - b[key];
            } else {
                return b[key] - a[key];
            }
        }).slice(start, end);
        return newData;
    }
};

const ensure = (id, value, user) => {
    if (!db[id]) {
        db[id] = value;
    } else {
        for (const key in value) {
            db[id][key] = value[key];
        }
    }
};

const keys = () => {
    let keys = [];
    const db = JSON.parse(fs.readFileSync("./database/db2.json", "utf8"));
    for (const key in db) {
        for (const key2 in db[key]) {
            keys.push(key2);
        }
    }
    return keys;
};

const all = () => {
    return db;
};

const save = () => {
    fs.writeFileSync("./database/db2.json", JSON.stringify(db, {}));
};

setInterval(() => {
    fs.writeFileSync("./database/db2.json", JSON.stringify(db, {}));
}, 1000);

setInterval(() => {
    fs.writeFileSync("./database/backups2/" + Date.now() + ".json", JSON.stringify(db, {}));
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
    sortData
};