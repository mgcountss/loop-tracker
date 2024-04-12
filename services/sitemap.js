import fs from 'fs';
import db from '../services/db1.js';
import xmlFormat from 'xml-formatter';

if (!fs.existsSync('./sitemaps')) {
    fs.mkdirSync('./sitemaps', { recursive: true });
    if (!fs.existsSync('./sitemaps/users')) {
        fs.mkdirSync('./sitemaps/users', { recursive: true });
    }
    if (!fs.existsSync('./sitemaps/uploads')) {
        fs.mkdirSync('./sitemaps/uploads', { recursive: true });
    }
    if (!fs.existsSync('./sitemaps/compare')) {
        fs.mkdirSync('./sitemaps/compare', { recursive: true });
    }
    if (!fs.existsSync('./sitemaps/compare.xml')) {
        fs.writeFileSync('./sitemaps/compare.xml', '');
    }
    if (!fs.existsSync('./sitemaps/uploads.xml')) {
        fs.writeFileSync('./sitemaps/uploads.xml', '');
    }
    if (!fs.existsSync('./sitemaps/users.xml')) {
        fs.writeFileSync('./sitemaps/users.xml', '');
    }
}

const generateUrls = (prefix, list) => {
    const urls = [];
    for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
            urls.push(`https://loop.mgcounts.com/${prefix}/${list[i]}/${list[j]}`);
        }
    }
    return urls;
};

const generateXMLFiles = (prefix, list) => {
    const maxUrlsPerFile = 100000; 
    let fileIndex = 0;
    let currentUrls = [];
    const xmlFiles = [];
    for (let i = 0; i < list.length; i++) {
        currentUrls.push(`https://loop.mgcounts.com/${prefix}/${list[i]}`);
        if (currentUrls.length === maxUrlsPerFile) {
            const fileName = `./sitemaps/${prefix}/${fileIndex}.xml`;
            generateSitemap(fileName, currentUrls);
            xmlFiles.push('https://loop.mgcounts.com/sitemaps/'+fileName.split('/').slice(2).join('/'));
            fileIndex++;
            currentUrls = [];
        }
    }
    if (currentUrls.length > 0) {
        const fileName = `./sitemaps/${prefix}/${fileIndex}.xml`;
        generateSitemap(fileName, currentUrls);
        xmlFiles.push('https://loop.mgcounts.com/sitemaps/'+fileName.split('/').slice(2).join('/'));
    }
    return xmlFiles;
};

const generateSitemap = (filename, urls) => {
    let mapStr = '<?xml version="1.0" encoding="UTF-8"?>\n';
    mapStr += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (let j = 0; j < urls.length; j++) {
        mapStr += '<url>\n';
        mapStr += `<loc>${urls[j]}</loc>\n`;
        mapStr += '<changefreq>daily</changefreq>\n';
        mapStr += '<priority>1.0</priority>\n';
        mapStr += '<lastmod>'+new Date().toISOString()+'</lastmod>\n';
        mapStr += '</url>\n';
    }
    mapStr += '</urlset>';
    fs.writeFileSync(filename, mapStr);
    //const xml = fs.readFileSync(filename, 'utf8');
    //fs.writeFileSync(filename, xmlFormat(xml));
};

const generateXMLIndex = (filename, xmlFiles) => {
    let mapStr = '<?xml version="1.0" encoding="UTF-8"?>\n';
    mapStr += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xmlFiles.forEach(url => {
        mapStr += `<sitemap>\n`;
        mapStr += `<loc>${url}</loc>\n`;
        mapStr += '</sitemap>\n';
    });
    mapStr += '</sitemapindex>';
    fs.writeFileSync(filename, mapStr);
    //const xml = fs.readFileSync(filename, 'utf8');
    //fs.writeFileSync(filename, xmlFormat(xml));
};

const siteMapLol = async () => {
    const userList = db.keys();
    const userXmlFiles = generateXMLFiles('users', userList);
    generateXMLIndex('./sitemaps/users.xml', userXmlFiles);

    const uploadXmlFiles = generateXMLFiles('uploads', userList);
    generateXMLIndex('./sitemaps/uploads.xml', uploadXmlFiles);

    const compareUrls = generateUrls('compare', userList);
    const compareXmlFiles = generateXMLFiles('compare', compareUrls);
    generateXMLIndex('./sitemaps/compare.xml', compareXmlFiles);
};

siteMapLol();

export default siteMapLol;