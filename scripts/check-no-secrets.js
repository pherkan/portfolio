#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const BINARY_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.ico', '.bmp', '.tiff',
  '.pdf', '.woff', '.woff2', '.ttf', '.otf', '.eot', '.mp3', '.mp4', '.mov',
  '.zip', '.gz', '.tgz', '.7z', '.tar', '.webm', '.avif'
]);

const SECRET_PATTERNS = [
  { name: 'Private key block', regex: /-----BEGIN (?:RSA |OPENSSH |EC |DSA |)?PRIVATE KEY-----/g },
  { name: 'GitHub token', regex: /\bghp_[A-Za-z0-9]{20,}\b/g },
  { name: 'GitHub fine-grained token', regex: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g },
  { name: 'AWS access key', regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'Google API key', regex: /\bAIza[0-9A-Za-z\-_]{35}\b/g },
  { name: 'Slack token', regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  { name: 'Stripe key', regex: /\bsk_(?:live|test)_[0-9A-Za-z]{16,}\b/g },
  { name: 'Netlify token', regex: /\bnfp_[0-9a-f]{32,}\b/gi }
];

function getTrackedFiles() {
  const output = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' });
  return output.split('\0').filter(Boolean);
}

function shouldSkipFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) return true;
  return false;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  for (const pattern of SECRET_PATTERNS) {
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(content);
    if (match) {
      issues.push({
        pattern: pattern.name,
        sample: String(match[0]).slice(0, 12) + '...'
      });
    }
  }

  return issues;
}

function main() {
  const files = getTrackedFiles();
  const findings = [];

  for (const filePath of files) {
    if (shouldSkipFile(filePath)) continue;

    let issues = [];
    try {
      issues = scanFile(filePath);
    } catch (_error) {
      continue;
    }

    for (const issue of issues) {
      findings.push({ filePath, ...issue });
    }
  }

  if (findings.length > 0) {
    console.error('Secret scan failed. Potential exposed secrets found:');
    for (const finding of findings) {
      console.error(`- ${finding.filePath}: ${finding.pattern} (${finding.sample})`);
    }
    process.exit(1);
  }

  console.log('Secret scan passed.');
}

main();
