const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { execSync } = require('child_process');

const gitExe = 'C:/Users/sammy.avila/AppData/Local/GitHubDesktop/app-3.4.5/resources/app/git/cmd/git.exe';
const gitCwd = 'd:/Users/sammy.avila/Documents/GitHub/LOTM_SIMULADOR Gemini/Simulador';

const lsTreeOutput = execSync(`"${gitExe}" ls-tree -r archive/pre-purga`, { cwd: gitCwd, encoding: 'utf8' });
const gitEntries = new Map();
lsTreeOutput.trim().split('\n').forEach(line => {
  const match = line.match(/^(\d+)\s+(\w+)\s+([a-f0-9]+)\t(.+)$/);
  if (match) {
    const [, mode, type, sha, filePath] = match;
    gitEntries.set(filePath.trim().replace(/\\/g, '/'), sha);
  }
});

const manifest = JSON.parse(fs.readFileSync('reborn/data/content/manifest.json', 'utf8'));

const presentInGit = [];
const absentInGit = [];

for (const [catName, cat] of Object.entries(manifest.categories)) {
  for (const f of cat.files) {
    const candidateGitPath = 'LOTM_SIMULADOR/' + f.sourcePath.replace(/\\/g, '/');
    const blobSha = gitEntries.get(candidateGitPath);
    const destPath = path.resolve(f.destinationPath);
    const diskBuf = fs.readFileSync(destPath);
    const diskSha = crypto.createHash('sha256').update(diskBuf).digest('hex');

    if (blobSha) {
      const gitBlob = execSync(`"${gitExe}" cat-file -p ${blobSha}`, { cwd: gitCwd, maxBuffer: 10 * 1024 * 1024 });
      const gitSha = crypto.createHash('sha256').update(gitBlob).digest('hex');
      const match = diskSha === gitSha;
      presentInGit.push({
        file: f.destinationPath,
        sourcePath: f.sourcePath,
        gitPath: candidateGitPath,
        match,
        diskSize: diskBuf.length,
        gitSize: gitBlob.length,
        diskSha,
        gitSha
      });
    } else {
      absentInGit.push({
        file: f.destinationPath,
        sourcePath: f.sourcePath,
        diskSize: diskBuf.length,
        diskSha
      });
    }
  }
}

const matchingCount = presentInGit.filter(p => p.match).length;
const mismatchCount = presentInGit.filter(p => !p.match).length;

console.log('PRESENT_IN_GIT:', presentInGit.length);
console.log('MATCHING_IN_GIT:', matchingCount);
console.log('MISMATCH_IN_GIT:', mismatchCount);
console.log('ABSENT_IN_GIT (laguna de procedencia):', absentInGit.length);

fs.writeFileSync('reborn/scripts/git_crosscheck_detailed.json', JSON.stringify({
  presentCount: presentInGit.length,
  matchingCount,
  mismatchCount,
  absentCount: absentInGit.length,
  presentInGit,
  absentInGit
}, null, 2), 'utf8');

