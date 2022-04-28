require('dotenv').config()
const { Octokit } = require('@octokit/rest')
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
//octokit.log.debug = octokit.log.warn

async function main() {
  let per_page = 100
  let team_name = 'everyone'

  const org = process.argv[2];
  const context = {
    'log' : octokit.log,
    'octokit' : octokit
  }

  if ( org === undefined || org == '' ) {
    console.error("Usage: node index.js <org-name>\n\nPurpose: Creates/updates a GitHub Team named \"%s\" with all Organization members", team_name)
    process.exit(1)
  }
  
  console.log("Creating/updating team \"%s\" in org \"%s\"...", team_name, org)
  return createTeam(context, org, team_name).then( ({data: team}) => {
    context.log.debug({
      team: team
    })
    return populateTeam(context, org, team, 1, per_page)
  }).catch(error => {
    context.log.error({
      org: org,
      message: error.message
    })
  })
  
}

async function createTeam(context, org, name) {
  // create requires admin:org
  return context.octokit.teams.getByName({
    org: org,
    team_slug: name
  }).then( ({data: team}) => {
    if (team.name == name) {
      context.log.debug("Updating team \"%s\" with slug \"%s\"...", team.name, name)
      return { data: team }
    }
  }).catch( err => {
    if (err.status == 404) {
      console.log("Creating team \"%s\"...", name)
      return context.octokit.teams.create({
        org: org,
        name: name
      })
    }
    throw err
  })
}

async function populateTeam(context, org, team, page = 1, per_page = 100) {
  const {data: members} = await context.octokit.orgs.listMembers({
    org: org, 
    per_page: per_page,
    page: page
  })
  
  context.log.debug({
    org: org, 
    team: team, 
    page: page, 
    per_page: per_page,
    members: members
  })

  if (members.length == per_page) {
    populateTeam(context, org, team, page+1, per_page)
  }

  for (const member of members) {
    context.log.debug("Adding member \"%s\"", member.login)
    // Adding a user to a team is idempotent, and requires admin:org
    context.octokit.teams.addOrUpdateMembershipForUserInOrg({
      org: org,
      team_slug: team.slug,
      username: member.login
    })
  } 
}

main()
