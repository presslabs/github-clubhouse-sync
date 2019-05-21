#!/usr/bin/env node -r esm

import { map, join, isNumber } from 'lodash'
import { githubIssueToClubhouseStory } from 'github-clubhouse'
import { format, subMinutes } from 'date-fns'

const PROJECT_MAPPING = {
    'presslabs/stack'          : 'Stack',
    'presslabs/dashboard'      : 'Dashboard',
    'presslabs/mysql-operator' : 'MySQL Operator',
    'presslabs/o3'             : 'Oxygen',
    'presslabs/oxygen'         : 'Oxygen'
}

if (!process.env.GITHUB_TOKEN) {
    console.log('Missing GITHUB_TOKEN env variable')
    process.exit(1)
}

if (!process.env.CLUBHOUSE_TOKEN) {
    console.log('Missing CLUBHOUSE_TOKEN env variable')
    process.exit(1)
}

function importIssuesFromRepo({ repo, project, query }) {
    return githubIssueToClubhouseStory({
        githubToken      : process.env.GITHUB_TOKEN,
        clubhouseToken   : process.env.CLUBHOUSE_TOKEN,
        clubhouseProject : project,
        githubRepo       : repo,
        query            : query,
        dryRun           : false,
        userMap          : "{}"
    })
}

async function importAllIssues(syncInterval) {
    const query = join([
      'state:open',
      createDateFilter(syncInterval)
    ], ' ')

    await Promise.all(map(PROJECT_MAPPING, async (project, repo) => (
        await importIssuesFromRepo({ repo, project, query })
    )))

    console.log('\nSynced.')
}

function createDateFilter(intervalInMinutes) {
    if (!isNumber(parseInt(intervalInMinutes))) {
        return null
    }
    const createDateLimit = subMinutes(Date.now(), parseInt(intervalInMinutes))
    return `created:>${format(createDateLimit, "yyyy-MM-dd'T'HH:mm:ssxxx")}`
}

importAllIssues(process.env.SYNC_INTERVAL)
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
