# Maintaining

This document covers different aspects on maintaining the project such as useful scripts, processes, guidelines etc.

<a id="release"></a>

## Release process

1. Publish a new release by running the following command

```bash
$ GH_TOKEN=xxx && curl -H "Accept: application/vnd.github.v3+json" -H "Authorization: token $GH_TOKEN" https://api.github.com/repos/ersims/varan | grep -q '"push": true' && npm run release
```
