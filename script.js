/**
 * @author bkrunic
 */
/**
 * user unique id, you can just google "find my instagram , used to get a list of ghost-followers
 * @type {string}
 */
let id = 'YOUR-ID';
/**
 * personal token from chrome-devtools, it changes each time you log-in
 * @type {string}
 */
let token = 'TOKEN';
/**
 * minimum delay between requests, don't go bellow 1 minute
 * @type {number}
 */
let delay = calculateDelay(1);

/**
 * calculates random delay
 * @returns {number}
 */
function calculateDelay(delay) {
    return (Math.random() + delay) * 60000;
}


/**
 * function that creates a list of account ids that account is following
 * @returns
 */
function getFollow() {
    var list = [];
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET", 'https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=%7B%22id%22%3A%22' + id + '%22%2C%22include_reel%22%3Atrue%2C%22fetch_mutual%22%3Afalse%2C%22first%22%3A50%7D', false);
    Httpreq.send(null);
    var json_obj = JSON.parse(Httpreq.responseText);
    for (var node of json_obj.data.user.edge_follow.edges) {
        list.push(String(node.node.id));
    }

    return list;
}

/**
 * function that creates a list with followers ids
 * @returns {[]}
 */
function getFollowed() {
    var list = [];
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET", 'https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=%7B%22id%22%3A%22' + id + '%22%2C%22include_reel%22%3Atrue%2C%22fetch_mutual%22%3Atrue%2C%22first%22%3A50%7D', false);
    Httpreq.send(null);
    var json_obj = JSON.parse(Httpreq.responseText);
    for (var node of json_obj.data.user.edge_followed_by.edges) {
        list.push(String(node.node.id));

    }


    return list;

}

/**
 * unfollows specific user
 * @param toUnfollowId
 */
function unFollow(toUnfollowId) {
    window.fetch('/web/friendships/' + toUnfollowId + '/unfollow/', {
        method: 'POST',
        headers: {
            'Host': 'www.instagram.com',
            'Connection': 'keep-alive',
            'Content-Length': '0',
            'Origin': 'https://www.instagram.com',
            'X-Instagram-AJAX': '243d43ec8a79',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36',
            'X-CSRFToken': token,
            'X-IG-App-ID': '936619743392459',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9,hr;q=0.8,sr;q=0.7',
        }


    })
        .then(function (response) {
            if (response.ok) {
                console.log("Unfollowed");
            } else {
                throw new Error("HTTP status " + response.status);
            }
        })
}

var following, followers = null;

following = new Set(getFollow());
following = new Set(following);

followers = new Set(getFollowed());
followers = new Set(followers);
difference = new Set([...following].filter(x => !followers.has(x)));
array = Array.from(difference);
console.log(array.length + " users will be unfollowed");
for (let i = 0; i < array.length; i++) {
    setTimeout(function () {
        unFollow(array[i]);
    }, delay * (i + 1));
}

