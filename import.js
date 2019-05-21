import { map, join, isInteger } from 'lodash'
import { githubIssueToClubhouseStory } from 'github-clubhouse'
import { format, subMinutes } from 'date-fns'
import fs from 'fs'

if (!process.env.GITHUB_TOKEN) {
    console.log('Missing GITHUB_TOKEN env variable')
    process.exit(1)
}

if (!process.env.CLUBHOUSE_TOKEN) {
    console.log('Missing CLUBHOUSE_TOKEN env variable')
    process.exit(1)
}

if (!process.env.PROJECT_MAPPING_PATH) {
    console.log('Missing PROJECT_MAPPING_PATH env variable')
    process.exit(1)
}

const mappingFile = fs.readFileSync(process.env.PROJECT_MAPPING_PATH)
const projectMapping = JSON.parse(mappingFile)

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

    await Promise.all(map(projectMapping, async (project, repo) => (
        await importIssuesFromRepo({ repo, project, query })
    )))

    console.log('\nSynced.')
}

function createDateFilter(intervalInMinutes) {
    if (!isInteger(parseInt(intervalInMinutes))) {
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
