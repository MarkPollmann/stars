Small project to learn redis. Calculates total stars of all repos of a GitHub user via the GitHub API. Responses are cached with Redis for a specified amount of time (three minutes at the moment).

Could use a nice frontend.

# Usage

Run a redis server, then `$ npm start` and run queries on `localhost:5000/$(username)`