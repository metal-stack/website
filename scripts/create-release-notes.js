
import axios from "axios";
const fs = require('fs');

const releaseNotesPath = "docs/docs/07-Release Notes"

const gitHubClient = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    "Accept": "application/vnd.github+json",
    "Authorization" : "Bearer " + process.env.GITHUB_TOKEN,
    "X-GitHub-Api-Version": "2022-11-28"
  }
});

function increaseHeadlineLevel(body) {
    return body.replace("# ","## ")
}

gitHubClient.get('/repos/metal-stack/releases/releases')
    .then(function(response) {
        const releases= response.data

        for(let i= 0; i< releases.length; i++ ) {

            const majorVersion = releases[i].tag_name.substr(0, releases[i].tag_name.lastIndexOf('.'));
            let filePath = releaseNotesPath + "/" + majorVersion + "/" + releases[i].tag_name + ".md"

            if (!fs.existsSync(releaseNotesPath + "/" + majorVersion)) {
                fs.mkdirSync(releaseNotesPath + "/" + majorVersion, { recursive: true });
            }

            if (!fs.existsSync(filePath)) {
                const sidebarPosition = releases.length-(releases.length-i)+1
                const frontmatter ="---\nslug: /release-notes/" + releases[i].tag_name + "\ntitle: " + releases[i].tag_name + "\nsidebar_position: " + sidebarPosition + "\n---"
                const ghLink = "See original release note at [" + releases[i].html_url + "](" + releases[i].html_url + ")"
                fs.writeFileSync(filePath, frontmatter + "\n# " + releases[i].name + "\n" + ghLink + "\n" + increaseHeadlineLevel(releases[i].body))
            }
        }
    }
)
