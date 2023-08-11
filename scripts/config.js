const config = {
    // without trailing slash
    discoveryProviders: ['https://discovery-us-01.audius.openplayer.org'],
    // base name, shouldnt be changed
    clientName: "static-audius-frontend",
    // better to add a nick
    clientNick: "",
    // true if you want dates to be in your local timezone, false for utc-0
    localDate: false,
    // NumeralJS number format string
    numberFormat: '0,0a'
}

window._config = config