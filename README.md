# github-clubhouse-sync
Sync Github Issues with Clubhouse stories.

### Run
This tool it was design to sync multiple github repositories to multiple Clubhouse projects.
In order to achieve that, we need a way to define this mapping.
For now, we have `PROJECT_MAPPING_PATH` which represents the path to a json file, which describe the following mapping
```json
{
   "githubOrg/repo": "Project"
}
```
You'll also need a Github personal access token and a Clubhouse token.

The Github token can be obtained from `Github` > `Settings` > `Developer settings` > `Personal access tokens` > `Generate new token` 

For the Clubhouse token, you'll need to go `Clubhouse` > `Settings` > `API Tokens` > `Generate new token`.

##### Docker
```bash
docker run -v ./mapping.json:/opt/github-clubhouse-sync/project-mapping \
           -e GITHUB_TOKEN='personal token' \
           -e CLUBHOUSE_TOKEN='clubhouse token' \
           -e PROJECT_MAPPING_PATH='/opt/github-clubhouse-sync/project-mapping' quay.io/presslabs/github-clubhouse-sync
```

##### K8s
We're using this tool as a cronjob in our K8s cluster. In order to store the mapping, we have a configmap in `chart/templates/configmap.yaml` and the secrets are defined in `values.yaml`.
You can store them via `helm secrets`, or refactor the chart a little bit and use k8s secrets.


```
helm install --name github-clubhouse-sync .
```
