var onAuthorize = function() {
    Trello.members.get("me", function(member) {
        $("#fullName").text(member.fullName);
    });
    $('#success').show();
    $('#loggedout').hide();
    $('#loggedin').show();
};

var logout = function() {
    Trello.deauthorize();
    $('#loggedin').hide();
    $('#success').hide();
    $('#loggedout').show();
};

function init() {
    Trello.authorize({
        'name': "Bug 2 Trello",
        'expiration': "never",
        'scope': {
            'write': true,
            'read': true
        },
        'success': onAuthorize,
        'error': function () {
            $('#error').show();
        }
    });
}

window.addEventListener('load', init);

$(document).ready(function(){ 
    $("#disconnect").click(logout);
    $("#connect").click(init);
});
