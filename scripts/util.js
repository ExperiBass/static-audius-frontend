async function makeAudiusRequest(endpoint, additionalQueries) {
    const res = await (await makeRequest(endpoint, additionalQueries)).json()

    return res.data ? res.data : res
}
async function requestHTML(snippet) {
    const res = await (await fetch(`/html/${snippet}.html`)).text()

    return cleanHTML(res) || null
}

async function makeRequest(endpoint, additionalQueries, fetchOptions) {
    let res;
    const query = {
        ...additionalQueries,
        app_name: `${window._config.clientName}${window._config.clientNick
            ? `-${window._config.clientNick}`
            : ""}`
    }
    const querystr = new URLSearchParams(query).toString()

    fetchLoop:
    for (const provider of window._config.discoveryProviders) {
        try {
            // TODO: use browser cache
            // browser cache api doesnt respect caching headers tho???
            res = await fetch(`${provider}/v1/${endpoint}?${querystr}`, fetchOptions)
            //res = await fetch('/json/response.json')
            window._provider = provider
            break fetchLoop
        } catch (e) {
            console.error(`Request to "${provider}" failed: ${e.stack}`)
        }
    }
    return res
}
async function getStreamURL(track) {
    const req = await makeRequest(`tracks/${track}/stream`, { redirect: 'follow' })
    return req.url
}

function nToBr(str) {
    return str.replace(/\n/gi, '<br>')
}

function sanitizeInput(str) {
    return str?.replace(/ /g, '+')
    .replace(/[^a-z0-9_+-]/gi, '').trim()
}


/**
 * https://audiusproject.github.io/api-docs/#tocS_Track
 * Track.tags
 * @param {string} tags comma-separated strings.
 * @returns {string} tags wrapped up in neat little bows.
 */
function buildTags(tags) {
    let res = ""
    for (const tag of tags.split(',')) {
        res += `<span class="stats tag">${tag}</span>`
    }
    return res
}

/**
 * https://audiusproject.github.io/api-docs/#tocS_Track
 * Track.duration
 * @param {number} time time in seconds.
 * @returns {string} a pretty time.
 */
function buildTimestamp(time) {
    const mins = Math.floor(time / 60)
    const secs = (time % 60).toString().padStart(2, "0")
    return `${mins}:${secs}`
}

function reformatDate(datestr) {
    const date = new Date(datestr)
    date.setHours(0, 0, 0)

    let preres;

    if (window._config.localDate) {
        preres = date.toLocaleString()
    } else {
        preres = date.toUTCString()
    }

    return preres.split(' ').slice(0, 4).join(' ')
}
// remove newlines and spaces
function cleanHTML(html) {
    return html?.replace(/(\n| {2,})/g, '')
}

function readCookie(name) {
    const cookie = document.cookie.split('; ').find(v => v.split('=')[0] === name)
    return cookie?.split('=')[1] || null
}
function getQuery(location) {
    return (new URLSearchParams(location.search))
}

// builders

function buildTrackList(tracks, options = {
    artworkSize: '480x480',
    display: {
        artistName: true,
        stats: true,
        extendedStats: true,
        tags: true,
        position: false,
        ranking: false
    }
}) {

    // why js?
    if (!options.artworkSize) {
        options.artworkSize = '480x480'
    }

    let elmstr = ""

    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i]
        let trackCard = `
        <div class="card" ${options.display.ranking ? `${colors[i] ? `style="border-color: ${colors[i]}"` : ""}` : ""}>
            <div class="artworkcontainer">
                <img class="artwork" src="${track.artwork[options.artworkSize]}" />
            </div>
            <div class="cardcontent">
                <div class="contenttitle">
                    <a class="title" href="./track.html?track=${track.id}">
                        ${track.title}
                    </a>
                    ${options.display.artistName !== false
                ? `
                            <a class="artistname" href="./artist.html?artist=${track.user.handle}">
                                ${track.user.name}
                            </a>
                          `
                : ""}
                </div>
        `

        if (options.display.stats !== false) {
            trackCard += `
                <div class="contentstats">
                    <span class="stats duration">${buildTimestamp(track.duration)}</span>
                    <span class="stats playcount">${numeral(track.play_count).format()} plays</span>
                    <span class="stats favoritecount">${numeral(track.favorite_count).format()} favorites</span>
                    <span class="stats repostcount">${numeral(track.repost_count).format()} reposts</span>
                </div>
            `

        }
        if (options.display.extendedStats !== false) {
            trackCard += `
                <div class="contentstats">
                    <span>
                        <span class="statstitle">Released</span>
                        <span class="stats releasedate">${track.release_date ? `${reformatDate(track.release_date)}` :
                    "No Release Date"}</span>
                        </span>
                    <span>
                        <span class="statstitle">Genre</span>
                        <span class="stats genre">${track.genre ? track.genre : "No Genre"}</span>
                        </span>
                    <span>
                        <span class="statstitle">Mood</span>
                        <span class="stats mood">${track.mood ? track.mood : "No Mood"}</span>
                        </span>
                </div>
            `
        }
        if (options.display.tags !== false) {
            trackCard += `
                <div class="contentstats tags">
                    ${track.tags ? buildTags(track.tags) : buildTags("No Tags")}
                </div>
            `
        }
        if (options.display.position) {
            let coloring = ""
            if (options.display.ranking) {
                coloring = colors[i] ? `style="font-weight:bold;color: ${colors[i]}"` : ""
            }
            trackCard += `
                </div>
                <div class="position">
                    <span ${coloring}>#${i + 1}</span>
                </div>
            </div>
            `
        } else {
            trackCard += `
                </div>
            </div>
            `
        }

        elmstr += trackCard
    }
    return cleanHTML(elmstr)
}

class Pageinator5000 {
    #containerElm = null
    #prevButton = null
    #nextButton = null
    #offset = null
    #endpoint = null
    #limit = null
    #end = null
    #contentFunction = null
    #cache = {}
    constructor({
        containerElm,
        prevButton,
        nextButton,
        initialOffset = 0,
        limit = 10,
        max,
        endpoint,
        contentFunction
    }) {
        this.#containerElm = containerElm
        this.#prevButton = prevButton
        this.#nextButton = nextButton
        this.#offset = initialOffset
        this.#endpoint = endpoint
        this.#end = max
        this.#limit = limit
        this.#contentFunction = contentFunction
    }
    // disable and enable buttons based on position
    #lockButtons() {
        if (!this.#offset) {
            this.#prevButton.disabled = true
            this.#nextButton.disabled = false
            return
        }
        if ((this.#offset + this.#limit) >= this.#end) {
            this.#prevButton.disabled = false
            this.#nextButton.disabled = true
            return
        }
        this.#prevButton.disabled = false
        this.#nextButton.disabled = false
    }
    async #request() {
        return await makeAudiusRequest(this.#endpoint, { offset: this.#offset, limit: this.#limit, sort_method: 'release_date', sort_direction: 'desc' })
    }
    async start() {
        const data = await this.#request()

        if (!data) {
            return
        }
        const res = this.#contentFunction(data)
        this.#containerElm.innerHTML = res
        this.#cache[this.#offset] = res
        this.#lockButtons()
    }
    async next() {
        this.#offset = Math.min(this.#end, this.#offset + this.#limit)
        this.#lockButtons()
        if (this.#cache[this.#offset]) {
            this.#containerElm.innerHTML = this.#cache[this.#offset]
            return
        }
        const data = await this.#request()
        if (!data || !data[0]) {
            return
        }
        const res = this.#contentFunction(data)
        this.#containerElm.innerHTML = res
        this.#cache[this.#offset] = res
    }
    async prev() {
        this.#offset = Math.max(0, this.#offset - this.#limit)
        this.#lockButtons()
        if (this.#cache[this.#offset]) {
            this.#containerElm.innerHTML = this.#cache[this.#offset]
            return
        }
        // negatives arent allowed
        const data = await this.#request()
        if (!data || !data[0]) {
            return
        }
        const res = this.#contentFunction(data)
        this.#containerElm.innerHTML = res
        this.#cache[this.#offset] = res
    }
    get prevButton () {
        return this.#offset
    }
}