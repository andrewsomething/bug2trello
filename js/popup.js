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
    var path = url.pathname.split('/');
    var bugNum = path[path.length - 1];
    var bugOwner = path[1];
    var bugRepo = path[2];
    var bugUrl = "https://api.github.com/repos/" + bugOwner + "/" + bugRepo + "/" + "issues/" + bugNum
    bugJson = $.ajax({
        type: "Get",
        url: bugUrl,
        dataType: "json",
        success: function (data) {
            var num = bugRepo + ": #" + data.number
            addCard(num, data.title ,data.body, data.html_url)
        },
        error:  function () {
            $('#error').show();
            }
    });
}

function addBitbucket(url) {
    var path = url.pathname.split('/');
    var bugNum = path[4];
    var bugOwner = path[1];
    var bugRepo = path[2];
    var bugUrl = "https://bitbucket.org/api/1.0/repositories/" + bugOwner + "/" + bugRepo + "/" + "issues/" + bugNum
    bugJson = $.ajax({
        type: "Get",
        url: bugUrl,
        dataType: "json",
        success: function (data) {
            var num = bugRepo + ": #" + data.local_id
            addCard(num, data.title ,data.content, url)
        },
        error:  function () {
            $('#error').show();
            }
    });
}

function addGoogle(url) {
    var path = url.pathname.split('/');
    var bugNum = url.search.split('id=').slice(-1)[0];
    var bugProj = path[2];
    var bugUrl = "https://code.google.com/feeds/issues/p/" + bugProj + "/issues/full?id=" + bugNum
    var bugJson = $.ajax({
        type: "Get",
        url: bugUrl,
        crossDomain: true,
        dataType: "xml",
        success: function (data) {
            desc = $(data).find('content').text()
            title = $(data).find("entry").find('title').text();
            var num = bugProj + ": #" + bugNum;
            addCard(num, title, desc, url);
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

function addBugzilla(url) {
    var bugNum = url.search.split('id=').slice(-1)[0];
    var bugOrg = url.hostname.split('.')[1]
    var bugPrefix = url.href.split('show_bug.cgi')[0]
    var bugUrl = bugPrefix + "/jsonrpc.cgi?method=Bug.get&params=[{\"ids\":[" + bugNum + "]}]"
    var bugJson = $.ajax({
        type: "Get",
        url: bugUrl,
        crossDomain: true,
        dataType: "json",
        success: function (data) {
            var bugJson = data.result.bugs["0"];
            var num = bugOrg + ": #" + bugJson.id;
            addCard(num, bugJson.summary , "", url);
            console.log(data)
        },
        error:  function () {
            $('#error').show();
            }
    });
}

function parseLink(tablink) {
    var parser = document.createElement('a');
    parser.href = tablink;
    if(parser.hostname == 'bugs.launchpad.net' && (parser.pathname.indexOf('+bug') > -1)) {
        addLaunchpad(parser);
    }
    else if(parser.hostname == 'github.com' && (parser.pathname.indexOf('issues') > -1)) {
        addGithub(parser);
    }
    else if(parser.hostname == 'bitbucket.org' && (parser.pathname.indexOf('issue') > -1)) {
        addBitbucket(parser);
    }
    else if(parser.hostname == 'sourceforge.net' && (parser.pathname.indexOf('bugs') > -1 || parser.pathname.indexOf('feature-requests') > -1)) {
        addSourceforge(parser);
    }
    else if(parser.pathname.indexOf('show_bug.cgi') > -1) {
        addBugzilla(parser);
    }
    else if(parser.hostname == 'code.google.com' && (parser.pathname.indexOf('detail') > -1)) {
        addGoogle(parser);
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
