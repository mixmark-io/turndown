function tryConvertAutolink(link) {
    // https://spec.commonmark.org/0.29/#absolute-uri
    const uri = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^\s\x00-\x1f<>]*)/

    // https://spec.commonmark.org/0.29/#email-address
    const mail = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/

    if (uri.test(link) || mail.test(link)) {
        return link 
    }
    return null
}