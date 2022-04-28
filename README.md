# everyone-team
Simple CLI tool to maintain a GitHub team with all the organization's members

Based on https://github.com/helaili/everyone.app , but it doesn't need to be deployed as an app.

## Configuration

1) [Create a GitHub Access Token](https://github.com/settings/tokens/new) and grant it `admin:org` scope.
2) Set the `GITHUB_TOKEN` value in `.env` (or the shell environment).

## Usage

`node index.js <org-name>`
