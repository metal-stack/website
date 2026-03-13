import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useColorMode } from "@docusaurus/theme-common";
import { useEffect, useState } from "react";
import versions from "../../versions.json";
import YAML from "yaml";
import * as semver from "semver";

export default function Api() {
  const query = new URLSearchParams(window.location.search);
  const version = query.get("version");
  const { colorMode } = useColorMode();
  const [spec, setSpec] = useState("");

  useEffect(() => {
    const metalApiUrl =
      "https://raw.githubusercontent.com/metal-stack/metal-api/refs/tags";

    getReleaseVectorYaml(version)
      .then(
        (releaseVector) =>
          releaseVector["docker-images"]["metal-stack"]["control-plane"][
            "metal-api"
          ]["tag"],
      )
      .then((metalApiVersion) =>
        fetch(`${metalApiUrl}/${metalApiVersion}/spec/metal-api.json`),
      )
      .then((res) => res.text())
      .then(setSpec);
  }, []);

  useEffect(() => {
    const href = `${location.origin}${location.pathname}${location.search}`;
    if (location.href != href) location.href = href;
  }, [colorMode]);

  return (
    <div key={colorMode}>
      {spec && (
        <ApiReferenceReact
          configuration={{
            content: spec,
            theme: "alternate",
            forceDarkModeState: colorMode,
            hideDarkModeToggle: true,
          }}
        />
      )}
    </div>
  );
}

async function getReleaseVectorYaml(version: string) {
  if (!version) return;

  let releaseVectorPath =
    "https://raw.githubusercontent.com/metal-stack/releases/refs/";

  switch (version) {
    case "next":
      releaseVectorPath += "heads/master/release.yaml";
      break;
    case "latest":
      releaseVectorPath += `tags/${getLatestRelease()}/release.yaml`;
      break;
    default:
      releaseVectorPath += `tags/${normalizedVersion(version)}/release.yaml`;
  }

  const response = await fetch(releaseVectorPath);
  const yamlString = await response.text();
  return YAML.parse(yamlString);
}

function getLatestRelease(): string {
  let latest = "0.0.0";
  for (let version of versions) {
    const v = normalizedVersion(version);
    if (semver.gt(v, latest)) latest = v;
  }
  return normalizedVersion(latest);
}

function normalizedVersion(version: string): string {
    const match = version.match(/^v?\d+\.\d+$/g);
    if (match != null) {
      return version + ".0";
    }

    return version;
}
