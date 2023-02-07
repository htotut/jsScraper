(function(){
    async function start() {
        var t = document.querySelector("h1.pgs-sinfo-title").textContent
        title = t.match(/Сериал (.+)\/(.+)(?:\s{1,2}\d{1,2} сезон) онлайн/)[2]

        var seasons = Array.prototype.map.call(document.querySelector("div.pgs-seaslist").querySelectorAll("a"), function(item) { return item.href })

        var content = '';

        for (season in seasons) {
            if (seasons[season] == document.URL) {
                var playlist = await getPlaylists(document);
                content = makePLaylist(content, playlist)
            } else {
                var dom = await getDom(seasons[season]);
                var playlist = await getPlaylists(dom);
                content = makePLaylist(content, playlist)
            }
        }

        save(`${title.trim()}.m3u`, content)
    }

    function makePLaylist(conainer, playlist) {
        for (episode in playlist) {
            conainer += `#EXTINF:0,${parseInt(episode) + 1} серия\n`
            conainer += `#EXTGRP:${parseInt(season) + 1} сезон\n`
            conainer += `${playlist[episode]}\n`
        }
        return conainer
    }

    async function getDom(url) {
        var response = await makeRequest(url)
        var parser = new DOMParser();
        var doc = parser.parseFromString(response, "text/html");
        return doc
    }

    async function getPlaylists(doc) {
        var mark = doc.querySelector('div.pgs-player').textContent.match(/secureMark\': \'([^\']+)\',/)[1]
        var info = doc.querySelector('div.pgs-sinfo')

        var url = 'http://seasonvar.ru/playls2/' + mark + '/trans/' + info.getAttribute('data-id-season') + '/bepl.txt'

        const value = await makeRequest(url)
        json = JSON.parse(value)
        return [...json].map(function(v) {
            return atob(v['file'].substring(2).replace(/(\/\/.*?=)/, ''))
        })
    }

    function makeRequest(url) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = function() {
                resolve(xhr.response)
            }
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
            xhr.send()
        });
    }

    function save(filename, data) {
        const blob = new Blob([data], { type: 'text/csv' });
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, filename);
        } else {
            const elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        }
    }

    start()
})();
