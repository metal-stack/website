
import axios from "axios";
const fs = require('fs');

const releaseNotesPath = "docs/07-Release Notes"
const latestMajorMinorsToKeep = 3

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


async function fetchReleasePage(page = 1) {
    const resp = await gitHubClient.get(`/repos/metal-stack/releases/releases?per_page=100&page=${page}`)
    if(resp.data.length == 0) {
        return resp.data;
    }

    return [...resp.data, ...(await fetchReleasePage(page+1))];
}

function sortMajorMinor(lhs, rhs) {
    // assuming format vMaj.Min[.Pat]
    const lhsMajMin = String(lhs).substring(1).split(".").map(str => Number.parseInt(str));
    const rhsMajMin = String(rhs).substring(1).split(".").map(str => Number.parseInt(str));

    for(let i = 0; i < lhsMajMin.length; i++) {
        const l = lhsMajMin[i];
        const r = rhsMajMin[i];
        if(l != r) {
            return l
        }
    }
    return 0;
};

fetchReleasePage()
    .then(function(allReleases) {
        // "vMajor.Minor" => Release[]
        const versions = new Map();

        for(const rel of allReleases) {
            const releaseGroup = rel.tag_name.substr(0, rel.tag_name.lastIndexOf('.'));
            const rels = versions.get(releaseGroup) ?? [];

            rels.push(rel);
            versions.set(releaseGroup, rels);
        }

        const groupsToSync = Array.from(versions.keys())
            .sort(sortMajorMinor)
            .slice(0, latestMajorMinorsToKeep);
        const groupsToRemove = Array.from(versions.keys())
            .sort(sortMajorMinor)
            .slice(latestMajorMinorsToKeep);
        
        for(const gr of groupsToRemove) {
            const path = releaseNotesPath + "/" + gr;

            if(fs.existsSync(path)) {
                console.log("-", gr, versions.get(gr).map(rel => rel.tag_name));
                fs.rmSync(path, { recursive: true, force: true });
            }
        }

        for (const gr of groupsToSync) {
            console.log("+", gr);
            
            const releaseGroupPath = releaseNotesPath + "/" + gr;
            if (!fs.existsSync(releaseGroupPath)) {
                console.log("+", gr);
                fs.mkdirSync(releaseGroupPath, { recursive: true });
            }

            const releases = versions.get(gr);

            for(let i = 0; i < releases.length; i++) {
                const rel = releases[i];
                let filePath = releaseGroupPath + "/" + rel.tag_name + ".md"

                if(fs.existsSync(filePath)) {
                    console.log("M", rel.tag_name);
                } else {
                    console.log("+", rel.tag_name);
                }

                const sidebarPosition = releases.length-(releases.length-i)+1
                const frontmatter = "---\nslug: /release-notes/" + rel.tag_name + "\ntitle: " + rel.tag_name + "\nsidebar_position: " + sidebarPosition + "\n---"
                const ghLink = "See original release note at [" + rel.html_url + "](" + rel.html_url + ")"
                fs.writeFileSync(filePath, frontmatter + "\n# " + rel.name + "\n" + ghLink + "\n" + increaseHeadlineLevel(rel.body))
            }
        }
    })
    .catch(function (error) {
        console.log(error?.response?.data ?? error)
    })

