/**
 * @author bkrunic
 */
/**
 * user unique id, you can just google "find my instagram
 * @type {string}
 */
let id = 'YOUR-ID';
/**
 * personal token from chrome-devtools, it changes each time you log-in
 * @type {string}
 */
let token = 'YOUR-SESSION-TOKEN';
/**
 * dialy limit, 200 is maximum, but don't be greedy
 * @type {number}
 */
let limit = 150;

/**
 * minimum delay between requests, don't go bellow 2, the higher it is it is more secure
 * @type {number}
 */
let delay = 2;
/**
 * helps to count unfollowed users, don't change it
 * @type {number}
 */
let counter = 0;

/**
 * next line executes after given param
 * @param ms
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * calculates random delay
 * @returns {number}
 */
function calculateDelay(delay) {
    return (Math.random() + 1) * delay * 60000;
}

/**
 * function that creates a list of account ids that account is following
 * @returns
 */
function getFollow() {
    var list = [];
    var req = new XMLHttpRequest();

    req.open("GET", 'https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=%7B%22id%22%3A%22' + id + '%22%2C%22include_reel%22%3Atrue%2C%22fetch_mutual%22%3Afalse%2C%22first%22%3A50%7D', false);
    req.send(null);

    if (!(req.status === 200))
        throw new Error("HTTP status " + req.status);

    var json_obj = JSON.parse(req.responseText);
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
    var req = new XMLHttpRequest();
    req.open("GET", 'https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=%7B%22id%22%3A%22' + id + '%22%2C%22include_reel%22%3Atrue%2C%22fetch_mutual%22%3Atrue%2C%22first%22%3A50%7D', false);
    req.send(null);

    if (!(req.status === 200))
        throw new Error("HTTP status " + req.status);

    var json_obj = JSON.parse(req.responseText);
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
                ++counter;
                console.log(counter + " users have been unfollowed");
                limit--;
            } else {
                throw new Error("HTTP status " + response.status);
            }
        })
}

/**
 * removes followers from accounts the user is following
 * @returns {Promise<array[]>}
 */
async function getDifference() {
    var following, followers = null;

    following = new Set(getFollow());
    following = new Set(following);
    await sleep(calculateDelay(delay));
    followers = new Set(getFollowed());
    followers = new Set(followers);
    difference = new Set([...following].filter(x => !followers.has(x)));
    return Array.from(difference);
}

/**
 * delays executing of requests for randomized interval, limits it to declared limit,it's not recomended to execute more than once a day
 * @returns {Promise<void>}
 */
async function dialyUnfollow() {
    while (limit > 1) {
        diff = Array.from(await getDifference());
        for (let i = 0; i < diff.length; i++) {
            if (limit <= 1) break;
            await sleep(calculateDelay(delay));
            unFollow(diff[i]);
        }

    }
    alert("Successfully unfollowed " + counter - 1 + " accounts");
    console.log("Successfully unfollowed " + counter - 1 + " accounts");
}

dialyUnfollow();


