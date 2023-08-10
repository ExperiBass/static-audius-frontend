const config = {
    // without trailing slash
    discoveryProviders: ['https://discovery-us-01.audius.openplayer.org'],
    // base name, shouldnt be changed
    clientName: "static-audius-frontend",
    // better to add a nick
    clientNick: "",
    // true if you want dates to be in your local timezone, false for utc-0
    localDate: false,
    // do you want numbers displayed in full (123,456, true) or shortened (123.45k, false)?
    fullNumbers: false
}

window._config = config