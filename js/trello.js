function closeOnSuccess() {
    setTimeout(function() {
            window.close();
            }, 100);
}

var addCard = function(num, title, bdesc, link) {
    var list = $('#lists_list :selected').val();
    var name = num + " - " + title;
    var desc = link + '\n\n' + bdesc;
    Trello.post("cards", {
        name: name,
        desc: desc,
        idList: list,
        success: closeOnSuccess
    });
}

var getBoards = function(){
    Trello.get("/members/me/boards/", function(boards) {
        $.each(boards, function(ix, boards) {
            $(new Option(boards.name, boards.id)).appendTo("#board_list");
        });
    });
}

function boardSelected(){
    var board = $('#board_list :selected').val();
    var boardLink = "https://trello.com/board/" + board
    $('#trello-link a').prop('href', boardLink)
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
}

function cardSelected(){ 
    var list = $('#lists_list :selected').val();
    if (list == "Select a list") {
        $("#add-bug").removeClass("btn-primary");
        $("#add-bug").addClass("disabled");
    }
    else {
        $("#add-bug").addClass("btn-primary");
        $("#add-bug").removeClass("disabled");
        $("i").addClass("icon-white");
    }
}

function onAuthorize() {
    Trello.members.get("me", function(member) {
        $("#fullName").text(member.fullName);
    });
    $('#loggedout').hide();
    $('#loggedin').show();
    getBoards();
}

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
}

function addGithub(url) {
    path = url.pathname.split('/');
    bugNum = path[path.length - 1];
    bugOwner = path[1];
    bugRepo = path[2];
    bugUrl = "https://api.github.com/repos/" + bugOwner + "/" + bugRepo + "/" + "issues/" + bugNum
    bugJson = $.ajax({
        type: "Get",
        url: bugUrl,
        dataType: "json",
        success: function (data) {
            var num = "GH: #" + data.number
            addCard(num, data.title ,data.body, data.html_url)
        },
        error:  function () {
            $('#error').show();
            }
    });
}

function addLaunchpad(url) {
    var path = url.pathname.split('+bug/').slice(-1)[0];
    var bugNum = path.split('/')[0];
    var bugUrl = "https://api.launchpad.net/1.0/bugs/" + bugNum
    var bugJson = $.ajax({
        type: "Get",
        url: bugUrl,
        crossDomain: true,
        dataType: "json",
        success: function (data) {
            var num = "LP: #" + data.id
            addCard(num, data.title ,data.description, data.web_link)
        },
        error:  function () {
            $('#error').show();
            }
    });
}

function addSourceforge(url) {
    var path = url.pathname.split('/');
    var bugNum = path[4];
    var bugType = path[3];
    var bugProject = path[2];
    var bugUrl = "https://sourceforge.net/rest/p/" + bugProject + "/" + bugType + "/"+ bugNum
    var bugJson = $.ajax({
        type: "Get",
        url: bugUrl,
        crossDomain: true,
        dataType: "json",
        success: function (data) {
            var num = "SF: #" + data.ticket.ticket_num
            var url = "https://sourceforge.net/p/" + bugProject + "/" + bugType + "/"+ bugNum
            addCard(num, data.ticket.summary ,data.ticket.description, url)
        },
        error:  function () {
            $('#error').show();
            }
    });
}

function parseLink(tablink) {
    var parser = document.createElement('a');
    parser.href = tablink;
    if(parser.hostname == 'bugs.launchpad.net') {
        addLaunchpad(parser);
    }
    else if(parser.hostname == 'github.com' && (parser.pathname.indexOf('issues') > -1)) {
        addGithub(parser);
    }
    if(parser.hostname == 'sourceforge.net' && (parser.pathname.indexOf('bugs') > -1 || parser.pathname.indexOf('feature-requests') > -1)) {
        addSourceforge(parser);
    }
    else {
        $('#error').show();
    }
}

function addClicked() {
    chrome.tabs.getSelected(null,function(tab) {
        var tablink = tab.url;
        parseLink(tablink)
    });
}

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
    $("#board_list").change(boardSelected);
    $("#lists_list").change(cardSelected);
    $("#add-bug").click(addClicked);
});
