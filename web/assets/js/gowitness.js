// Make clicked links purple
$(document).on("mouseup", "a", (event) => {
    // Check if the URL has not been visited already
    if (!$(event.target).hasClass("url-visited")) {
        // Check if left click (0) or middle click (1) was used
        if (event.button == 0 || event.button == 1) {
            var id = $(event.target).attr("data-visit-id");
            // Check if the URL has the data-visit-id attribute
            if (typeof id !== 'undefined') {
                // Set URL as visited using the api
                fetch('/api/visited/' + id, {
                    method: 'POST',
                    body: JSON.stringify({visited: true})
                });

                // Turn the link purple
                $(event.target).removeClass('url');
                $(event.target).addClass('url-visited');
            }
        }
    }
});