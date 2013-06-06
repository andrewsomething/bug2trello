//var hideExisiting = function() {
//    Trello.boards.get("4f1e5db3ff37bfac6b001867/cards/all", function(cards) {
//        for (contact in cards) {
//            var lp_id = cards[contact].name
//            $("[data-lp_id='" + lp_id.split(" ")[0] + "']").hide();
//        }
//    });
//};

//var addCard = function(lp_id) {
//    Trello.post("cards", {
//        name: lp_id,
//        desc: "http://launchpad.net/~" + lp_id,
//        idList: "4f1e5db3ff37bfac6b00186b"
//    });
//};

var getBoards = function(){
    Trello.get("/members/me/boards/", function(boards) {
        $.each(boards, function(ix, boards) {
            $(new Option(boards.name, boards.id)).appendTo("#board_list");
        });
    });
};

function getlists(){
    var board = $('#board_list :selected').val();
    Trello.get("boards/" + board + "/lists", function(lists) {
        $.each(lists, function(ix, lists) {
            $(new Option(lists.name, lists.id)).appendTo("#lists_list");
            console.log(lists.name, lists.id);
        });
    });
};

function onAuthorize() {
    Trello.members.get("me", function(member) {
        $("#fullName").text(member.fullName);
    });
    $('#loggedout').hide();
    $('#loggedin').show();
    getBoards();
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
    $("#board_list").change(getlists)
});
