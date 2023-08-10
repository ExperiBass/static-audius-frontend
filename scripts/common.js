// common listeners and stuff used by the pages

const colors = ['gold', 'silver', '#cd7f32']

function initListeners() {
    window.onclick = (ev) => {
        //ev.preventDefault()

        // none of the a elements we care about can be directly clicked on
        if (ev.target.parentElement.nodeName === "A") {
            const node = ev.target.parentElement

            const [category, id] = node.id?.split('-')

            // write state cookie
            switch (category) {
                case 'track': {
                    //console.log('track cookie write')
                    document.cookie = `track=${id}; samesite=lax; path=/`
                    break
                }
                case 'artist': {
                    //console.log('artist cookie write')
                    document.cookie = `artist=${id}; samesite=lax; path=/`
                    break
                }
            }
        }
    }
}
function followConfig() {
    if (!window._config.fullNumbers) {
        numeral.defaultFormat('0a')
    }
}

// bundle everything in a neat bow
function init() {
    followConfig()
    initListeners()
}