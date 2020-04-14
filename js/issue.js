let baseUrl = "https://api.github.com/repos/Ancientwood/wille/issues";
let pathName = window.location.pathname;

//main
var hashTag = location.hash ? location.hash.split('#/')[1] : false;
if(!hashTag){
    //url to catalog

    var path = baseUrl;
    var paths = pathName.split("/");
    var keyTag = paths[paths.length-2];
    var cataTag = "cata_" + paths[paths.length-2];

    if(judgeModify(keyTag,path) || !localStorage[cataTag])
        generate(keyTag,cataTag,path,true);

    inCatalog(localStorage[cataTag]);
    $(".back").attr("href","/");
    $(".prev").hide();
    $(".next").hide();

} else {
    //url to hash
    inPost(hashTag);
}

//hash change event
window.addEventListener("hashchange", function() {
    var hashTag = location.hash ? location.hash.split('#/')[1] : false;
    if(hashTag){
        inPost(hashTag);
    }
});

//generate markdown body include post & catalog
function generate(key,value,path,isCata = false,isComment = false) {
    var dataType = "text";
    var header = {
        'Accept':"application/vnd.github.v3.html"
    };
    if(isCata){
        dataType = "json";
        header = null;
    }
    if(isComment){
        dataType = "json";
    }

    $.ajax({
        url: path ,
        type: "GET",
        dataType: dataType,
        async: false,
        headers:header,
        success:function(res,code,xhr) {
            localStorage[key] = xhr.getResponseHeader("etag");
            var arr = [];
            if(isCata){
                localStorage.setItem(value,JSON.stringify(getCata(res)));
            } else if(isComment){
                localStorage.setItem(value,JSON.stringify(getComment(res)));
            } else {
                localStorage[value] = JSON.parse(res).body_html;
            }
        }
    })
}

//get catalog data
function getCata(res) {
    var data = res;
    var arr = [];
    data.forEach(item => {
        var dt = {id:item.number,title:item.title,user:item.user.login,avatar:item.user.avatar_url};
        arr.push(dt);
    });

    return arr;
}

//get catalog data
function getComment(res) {
    var data = res;
    var arr = [];
    data.forEach(item => {
        var dt = {body:item.body_html,user:item.user.login,avatar:item.user.avatar_url};
        arr.push(dt);
    });

    return arr;
}

//in catalog page
function inCatalog(arr) {
    JSON.parse(arr).forEach(item => {
        var tag_a= document.createElement("a");
        var url = pathName + "#/" + item.id;

        tag_a.setAttribute("href", url);
        tag_a.innerText = item.title;
        $(".markdown-body").append(tag_a);
        $(".markdown-body").append("<br/>");
    })
}

//in post page
function inPost(hashTag){
    var paths = pathName.split("/");
    var cataTag = "cata_" + paths[paths.length-2];

    var path = baseUrl + "/"+ hashTag;
    var postTag = "post_" + paths[paths.length-2] + "_" +  hashTag;
    var keyTag = paths[paths.length-2] + "_" + hashTag;

    if(judgeModify(keyTag,path) || !localStorage[postTag])
        generate(keyTag,postTag,path);

    $("div.markdown-body").html(localStorage[postTag]);

    //append comment
    path = baseUrl + "/"+ hashTag+ "/comments";
    postTag = "post_comments" + paths[paths.length-2] + "_" +  hashTag;
    keyTag = paths[paths.length-2] + "_comments" + hashTag;

    if(judgeModify(keyTag,path) || !localStorage[postTag])
        generate(keyTag,postTag,path,false,true);

    JSON.parse(localStorage[postTag]).forEach(item => {
        $("div.markdown-body").append("<hr/>");
        //TODO:add author and avatar
        $("div.markdown-body").append(item.body);
    });


    $(".back").attr("href",pathName);

    keyTag = paths[paths.length-2];

    //if not, do get catalog
    if(!localStorage[cataTag]){
        path = baseUrl;
        generate(keyTag,cataTag,path,true);
    }

    var arr  =JSON.parse(localStorage[cataTag]);
    for(var i=0;i<arr.length;i++){
        if(parseInt(hashTag) === arr[i].id){
            if(i === 0){
                $(".prev").hide();
                $(".next").show();
                $(".next").attr("href",pathName + "#/" + arr[i+1].id);
                break;
            } else if(i === arr.length - 1){
                $(".next").hide();
                $(".prev").show();
                $(".prev").attr("href",pathName + "#/" + arr[i-1].id);
                break;
            } else {
                $(".next").show();
                $(".prev").show();
                $(".next").attr("href",pathName + "#/" + arr[i+1].id);
                $(".prev").attr("href",pathName + "#/" + arr[i-1].id);
                break;
            }
        }
    }
}

//conditional requests
function judgeModify(key,path) {
    if(localStorage[key]) {
        $.ajax({
            url: path,
            type:"head",
            async: false,
            success:function(res,code,xhr) {
                if(localStorage[key] !== xhr.getResponseHeader("etag"))
                    return true;
            }
        })

    } else return true;

    return false;
}

