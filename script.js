/**
 * @author bkrunic
 */
/**
 * user unique id, you can just google "find my instagram
 * @type {string}
 */
let id = '';
/**
 * personal token from chrome-devtools, it changes each time you log-in
 * @type {string}
 */
let token = '';
/**
 * dialy limit, 200 is maximum, but don't be greedy
 * @type {number}
 */
let limit = 200;
/**
 * minimum delay coefficient between requests, don't go bellow 1, the higher it is it is more secure
 * @type {number}
 */
let delay = 1;
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
async function getFollow() {
    let totalFollow = 2;
    var followUrl = 'https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=%7B%22id%22%3A%22' + id + '%22%2C%22include_reel%22%3Atrue%2C%22fetch_mutual%22%3Afalse%2C%22first%22%3A50%7D';
    var list = [];
    var req = new XMLHttpRequest();

    while (list.length < totalFollow) {
        await sleep(calculateDelay(delay) / 22);
        req.open("GET", followUrl, false);
        req.send(null);

        if (!(req.status === 200))
            throw new Error("HTTP status " + req.status);

        var json_obj = JSON.parse(req.responseText);
        for (var node of json_obj.data.user.edge_follow.edges) {
            list.push(node.node.id);
        }
        console.log('duzina liste:' + list.length);
        if (json_obj.data.user.edge_follow.page_info.has_next_page !== true)
            break;
        totalFollow = parseInt(json_obj.data.user.edge_follow.count);
        followUrl = 'https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=%7B%22id%22%3A%22' + id + '%22%2C%22include_reel%22%3Atrue%2C%22fetch_mutual%22%3Afalse%2C%22first%22%3A50%2C%22after%22%3A%22' + json_obj.data.user.edge_follow.page_info.end_cursor + '%3D%3D%22%7D';
        followUrl = followUrl.replace('==', '');
    }
    return Array.from(list);

}

/**
 * function that creates a list with followers ids
 * @returns {[]}
 */
async function getFollowed() {
    let totalFollowed = 2;
    var followedUrl = 'https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=%7B%22id%22%3A%22' + id + '%22%2C%22include_reel%22%3Atrue%2C%22fetch_mutual%22%3Atrue%2C%22first%22%3A50%7D';
    var list = [];
    var req = new XMLHttpRequest();
    while (list.length < totalFollowed) {
        await sleep(calculateDelay(delay) / 22);

        req.open("GET", followedUrl, false);
        req.send(null);

        if (!(req.status === 200))
            throw new Error("HTTP status " + req.status);

        var json_obj = JSON.parse(req.responseText);
        for (var node of json_obj.data.user.edge_followed_by.edges) {
            list.push(node.node.id);

        }
        console.log('duzina liste:' + list.length);
        if (json_obj.data.user.edge_followed_by.page_info.has_next_page !== true)
            break;
        totalFollowed = parseInt(json_obj.data.user.edge_followed_by.count);
        followedUrl = 'https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=%7B%22id%22%3A%22' + id + '%22%2C%22include_reel%22%3Atrue%2C%22fetch_mutual%22%3Afalse%2C%22first%22%3A50%2C%22after%22%3A%22' + json_obj.data.user.edge_followed_by.page_info.end_cursor + '%3D%3D%22%7D';
        followedUrl = followedUrl.replace('==', '');

    }
    return Array.from(list);

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
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36',
            'X-CSRFToken': token,
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
    console.log("Fetching followers, this may take some time for large accounts.");
    var followed = await getFollowed();
    await sleep(calculateDelay(delay));
    console.log("Fetching accounts that you are following, this may take some time for large accounts.");
    var follow = await getFollow();
    return follow.filter(function (x) {
        return followed.indexOf(x) < 0;
    });

}

/**
 * delays executing of requests for randomized interval, limits it to declared limit,it's not recomended to execute more than once a day
 * @returns {Promise<void>}
 */
async function dialyUnfollow() {
    diff = Array.from(await getDifference());
    console.log(diff.length + " users are not following you back.");

    for (let i = 0; i < diff.length; i++) {
        if (limit === 1) break;
        await sleep(calculateDelay(delay));
        unFollow(diff[i]);
    }


}

dialyUnfollow();
