const { spawnSync } = require("child_process");

const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
const nodeArgs = [];

if (nodeMajor >= 17) {
  nodeArgs.push("--openssl-legacy-provider");
}

const ngPath = require.resolve("@angular/cli/bin/ng");
nodeArgs.push(ngPath, ...process.argv.slice(2));

const result = spawnSync(process.execPath, nodeArgs, { stdio: "inherit" });
process.exit(result.status === null ? 1 : result.status);
