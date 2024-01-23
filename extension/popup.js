$('#button').on('click', function() {
    chrome.cookies.get({"url":"https://notes.iut-nantes.univ-nantes.fr/","name":"PHPSESSID"}, function(cookie) {
        console.log(cookie.value);
    })
})