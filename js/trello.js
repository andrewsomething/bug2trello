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
    $('#lists_list').find('option').remove();
    $('#lists_list').append('<option>Select a list</option>');
    $("#add-bug").removeClass("btn-primary");
    $("#add-bug").addClass("disabled");
    $("i").removeClass("icon-white");
    Trello.get("boards/" + board + "/lists", function(lists) {
        $.each(lists, function(ix, lists) {
            $(new Option(lists.name, lists.id)).appendTo("#lists_list");
        });
    });
};

function cardSelected(){ 
    $("#add-bug").addClass("btn-primary");
    $("#add-bug").removeClass("disabled");
    $("i").addClass("icon-white");
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
    $('#lists_list').find('option').remove();
    $('#lists_list').append('<option>Select a list</option>');
    $('#board_list').find('option').remove();
    $('#board_list').append('<option>Select a board</option>');
    $("#add-bug").removeClass("btn-primary");
    $("#add-bug").addClass("disabled");
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
    $("#board_list").change(getlists);
    $("#lists_list").change(cardSelected);
});
