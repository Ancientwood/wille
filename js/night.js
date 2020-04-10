if(localStorage.getItem('nightMode')){
    nightMode();
}
function nightMode() {
    var styleElement = document.getElementById('styles_js');
    if (!styleElement) {
        localStorage.setItem('nightMode','true');
        addNewStyle('body {background-color:white;filter: brightness(90%) invert(100%) hue-rotate(180deg);-webkit-font-smoothing: antialiased;}');
        addNewStyle('html {background-color:#191919;}');
        addNewStyle('picture,video,img {filter: hue-rotate(180deg) invert(100%) brightness(111.111%);}');
    } else {
        localStorage.removeItem('nightMode');
        document.getElementsByTagName('head')[0].removeChild(styleElement);
    }
}

function addNewStyle(newStyle) {
    var styleElement = document.getElementById('styles_js');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.id = 'styles_js';
        document.getElementsByTagName('head')[0].appendChild(styleElement);
    }

    styleElement.appendChild(document.createTextNode(newStyle));
}
