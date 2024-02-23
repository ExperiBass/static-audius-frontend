// common listeners and stuff used by the pages

const colors = ['gold', 'silver', '#cd7f32']
const urlMatchingRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ig

function loadTheme() {
    const head = document.getElementsByTagName('head')[0]
    const themecss = document.getElementById('themecss') || document.createElement('link')
    if (!themecss?.id) {
        themecss.rel = 'stylesheet'
        themecss.id = 'themecss'
        themecss.type = 'text/css'
    }
    themecss.href = `/css/themes/${window._config.theme}.css`
    head.appendChild(themecss)
}

function initListeners() {
    window.onclick = (ev) => {
        //ev.preventDefault()
        // for later
    }
}
function followConfig() {
    if (!window._config.numberFormat) {
        numeral.defaultFormat('0a')
        return
    }
    numeral.defaultFormat(window._config.numberFormat)
}

// bundle everything in a neat bow
async function init() {
    // setup page
    loadTheme()
    document.body.innerHTML += await requestHTML('basepage')
    followConfig()
    initListeners()
}