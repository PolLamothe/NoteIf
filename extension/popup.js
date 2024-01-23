$('#button').on('click', function() {
    chrome.cookies.get({"url":"https://notes.iut-nantes.univ-nantes.fr/","name":"PHPSESSID"}, function(cookie) {
        console.log(cookie.value)
    })})

$('#notif').on('click', function() {
    let notif = new Notification('Vous avez une nouvelle note !', {
        body: "Nouvelle note dans la matière R101",
    });
})