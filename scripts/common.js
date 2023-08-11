// common listeners and stuff used by the pages

const colors = ['gold', 'silver', '#cd7f32']

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
function init() {
    followConfig()
    initListeners()
}