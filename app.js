const app = require('express')();
const responseTime = require('response-time')
const axios = require('axios');
const redis = require('redis');

const client = redis.createClient();

client.on_connect('error', function(err) {
    console.log("ERROR: ", err)
})

app.set('port', process.env.PORT || 5000);

app.use(responseTime())

app.get('/api/:username', function(req, res) {
    const username = req.params.username;
    client.get(username, function(err, result){
        if(result){
            res.send({"totalStars": result, "source": "redis cache"})
        } else {
            getUserRespositories(username)
                .then(computeTotalStars)
                .then(function(totalStars){
                    client.setex(username, 180, totalStars);
                    res.send({"totalStars": totalStars, "source": "github API"})
                })
                .catch(function(response){
                    if (response.status === 404){
                        res.send('The GitHub username could not be found. Try "octocat" as an example!');
                    } else {
                        res.send(response);
                    }
                })
        }
    })
})

app.listen(app.get('port'), function() {
    console.log('server listening on ', app.get('port'))
})

function getUserRespositories(user) {
    const githubEndpoint = 'https://api.github.com/users/' + user + '/repos' + '?per_page=100';
    return axios.get(githubEndpoint)
}

function computeTotalStars(repositories){
    return repositories.data.reduce(function(prev, curr) {
        return prev + curr.stargazers_count
    }, 0)
}