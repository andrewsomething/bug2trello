var onAuthorize = function() {
    Trello.members.get("me", function(member) {
        $("#fullName").text(member.fullName);
    });
    $('#loggedout').hide();
    $('#loggedin').show();
};

var logout = function() {
    Trello.deauthorize();
    $('#loggedin').hide();
    $('#loggedout').show();
};

function init() {
    Trello.authorize({
        'name': "Bugs 2 Trello",
        'expiration': "never",
        'success': onAuthorize
    });
}

window.addEventListener('load', init);

$(document).ready(function(){ 
    $("#disconnect").click(logout);
    $("#connect").click(init);
});
