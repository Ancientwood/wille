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
function generate(key,value,path,isCata = false) {
    var dataType = "text";
    var header = {
        'Accept':"application/vnd.github.v3.html"
    };
    if(isCata){
        dataType = "json";
        header = null;
    }

    $.ajax({
        url: path ,
        type: "GET",
        dataType: dataType,
        async: false,
        headers:header,
        success:function(res,code,xhr) {
            localStorage[key] = xhr.getResponseHeader("etag");
            if(isCata){
                localStorage.setItem(value,JSON.stringify(getCata(res)));
            } else{
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

    $(".back").attr("href",pathName);

    keyTag = paths[paths.length-2];

    //if not, do get catalog
    if(!localStorage[cataTag]){
        path = baseUrl;
        generate(keyTag,cataTag,path,true);
    }

    // var arr = localStorage[cataTag].split(",");
    var arr  =JSON.parse(localStorage[cataTag]);
    for(var i=0;i<arr.length;i++){
        if(hashTag === arr[i]){
            if(i === 0){
                $(".prev").hide();
                $(".next").show();
                $(".next").attr("href",pathName + "#/" + arr[i+1]);
                break;
            } else if(i === arr.length - 1){
                $(".next").hide();
                $(".prev").show();
                $(".prev").attr("href",pathName + "#/" + arr[i-1]);
                break;
            } else {
                $(".next").show();
                $(".prev").show();
                $(".next").attr("href",pathName + "#/" + arr[i+1]);
                $(".prev").attr("href",pathName + "#/" + arr[i-1]);
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

