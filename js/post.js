let baseUrl = "https://api.github.com/repos/Ancientwood/wille/contents";
let pathName = window.location.pathname;

//main
var hashTag = location.hash ? location.hash.split('#/')[1] : false;
if(!hashTag){
    //url to catalog

    var path = baseUrl + pathName;
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
    if(isCata)
        dataType = "json";

    $.ajax({
        url: path ,
        type: "GET",
        dataType: dataType,
        async: false,
        headers: {
            'Accept':"application/vnd.github.v3.html"
        },
        success:function(res,code,xhr) {
            localStorage[key] = xhr.getResponseHeader("Last-Modified");
            if(isCata){
                localStorage[value] = getCata(res);
            } else{
                localStorage[value] = res;
            }
        }
    })
}

//get catalog data
function getCata(res) {
    var data = jsonSort(res,"name",false);

    var arr = [];
    data.forEach(item => {
        if(item.name !== "index.html" && item.name !== "list.md"){
            arr.push(item.name.split(".md")[0]);
        }
    });

    return arr;
}

//in catalog page
function inCatalog(arr) {
    arr.split(",").forEach(item => {
        var tag_a= document.createElement("a");
        var url = pathName + "#/" + item;

        tag_a.setAttribute("href", url);
        tag_a.innerText = item;
        $(".markdown-body").append(tag_a);
        $(".markdown-body").append("<br/>");
    })
}

//in post page
function inPost(hashTag){
    var path = baseUrl + pathName + hashTag + ".md";
    var postTag = "post_" + hashTag;

    if(judgeModify(hashTag,path) || !localStorage[postTag])
        generate(hashTag,postTag,path);

    $("div.markdown-body").html(localStorage[postTag]);

    $(".back").attr("href",pathName);
    var paths = pathName.split("/");
    var cataTag = "cata_" + paths[paths.length-2];
    var keyTag = paths[paths.length-2];

    //if not, do get catalog
    if(!localStorage[cataTag]){
        path = baseUrl + pathName;
        generate(keyTag,cataTag,path,true);
    }

    var arr = localStorage[cataTag].split(",");
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
                if(localStorage[key] !== xhr.getResponseHeader("Last-Modified"))
                    return true;
            }
        })

    } else return true;

    return false;
}

//sort
function jsonSort(array, field, reverse) {
    if(array.length < 2 || !field || typeof array[0] !== "object") return array;
    if(typeof array[0][field] === "number") {
        array.sort(function(x, y) { return x[field] - y[field]});
    }
    if(typeof array[0][field] === "string") {
        array.sort(function(x, y) { return x[field].localeCompare(y[field])});
    }
    if(reverse) {
        array.reverse();
    }
    return array;
}
