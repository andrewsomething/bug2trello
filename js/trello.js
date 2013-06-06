var hideExisiting = function() {
    Trello.boards.get("4f1e5db3ff37bfac6b001867/cards/all", function(cards) {
        for (contact in cards) {
            var lp_id = cards[contact].name
            $("[data-lp_id='" + lp_id.split(" ")[0] + "']").hide();
        }
    });
};

var addCard = function(lp_id) {
    Trello.post("cards", {
        name: lp_id,
        desc: "http://launchpad.net/~" + lp_id,
        idList: "4f1e5db3ff37bfac6b00186b"
    });
};

function onAuthorize() {
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

function closePopup() {
    // Close popup and open auth tab
    setTimeout(function() {
        window.close();
        chrome.tabs.create({url: chrome.extension.getURL('settings.html')});
    }, 100);
}

function init() {
    if(!localStorage.trello_token) {
        closePopup();
        return;
    }
    else {
        Trello.authorize({
            interactive:false,
            success: onAuthorize
        });
    }
}

window.addEventListener('load', init);

document.addEventListener('DOMContentLoaded', function () {
    $("#disconnect").click(logout);
    $("#connect").click(init);
});
