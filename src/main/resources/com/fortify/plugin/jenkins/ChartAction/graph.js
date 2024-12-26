document.addEventListener("DOMContentLoaded", () => {
    const { urlName } = document.querySelector(".fortify-graph-data-holder").dataset;

    var stamp = new Date().getTime();
    function checkGraphUpdate() {
        fetch(`${urlName}/checkUpdates`, {
            method: 'POST',
            headers: crumb.wrap({
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
            body: new URLSearchParams({
                stamp: stamp,
            })
        }).then(function(rsp) {
            if (rsp.ok) {
                var update = rsp.headers.get('go');
                if(update == "go") {
                    stamp = new Date().getTime();
                    var image = document.getElementById('nvsGraph');
                    if(image.complete) {
                        var new_image = new Image();
                        new_image.id = "nvsGraph";
                        new_image.src = image.src + "?v=" + stamp;
                        // insert new image and remove old
                        image.parentNode.insertBefore(new_image,image);
                        image.parentNode.removeChild(image);
                    }
                }
                // next update in 10 sec
                window.setTimeout(checkGraphUpdate, 10000);
            }
        });
    }
    window.setTimeout(checkGraphUpdate, 15000);
});
