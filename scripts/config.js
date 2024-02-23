const config = {
    // without trailing slash
    discoveryProviders: ['https://audius-dp.singapore.creatorseed.com'],
    // base name, shouldnt be changed
    clientName: "static-audius-frontend",
    // better to add a nick
    clientNick: "development",
    // true if you want dates to be in your local timezone, false for utc-0
    localDate: false,
    // NumeralJS number format string
    numberFormat: '0,0a',
    // color theme
    theme: 'audyus'
}

window._config = config