#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Parse command line arguments
const args = process.argv.slice(2);
let scenario = process.env.FAKE_AGY_SCENARIO || 'success';
let conversationId = process.env.FAKE_AGY_CONV_ID || 'conv-fake-success-1';
let receivedModel = null;

if (process.env.FAKE_AGY_REQUIRE_AUTO_APPROVE === '1' && !args.includes('--dangerously-skip-permissions')) {
  process.stderr.write('Fake AGY error: auto-approve flag was not passed\n');
  process.exit(1);
}

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--scenario' && args[i + 1]) {
    scenario = args[++i];
  } else if (args[i] === '--conversation' && args[i + 1]) {
    conversationId = args[++i];
  } else if (args[i] === '--model' && args[i + 1]) {
    receivedModel = args[++i];
  }
}

if (receivedModel && receivedModel !== 'gemini-3.8-flash-high') {
  process.stderr.write(`Fake AGY error: received unpinned model "${receivedModel}"\n`);
  process.exit(1);
}

if (scenario === 'spawn_error') {
  process.exit(127);
}

if (scenario === 'nonzero_exit') {
  process.stderr.write('Fatal error: fake agy failed\n');
  process.exit(1);
}

if (scenario === 'timeout') {
  // Hang indefinitely until terminated
  setInterval(() => {}, 60000);
  await new Promise(() => {});
}

if (scenario === 'malformed_json') {
  process.stdout.write('This is not valid json {\n');
  process.exit(0);
}

if (scenario === 'zero_exit_permission_denied') {
  process.stderr.write('Error: permission denied for tool execution\n');
  const envelope = {
    conversation_id: 'conv-fake-perm',
    status: 'SUCCESS',
    response: 'Permission denied',
    structured_output: {
      status: 'completed',
      summary: 'Task completed',
      checks: [{ command: 'npm test', outcome: 'ok', passed: true }],
      remaining_risks: []
    },
    duration_seconds: 1.0,
    num_turns: 1
  };
  process.stdout.write(JSON.stringify(envelope));
  process.exit(0);
}

if (scenario === 'blocked_report') {
  const envelope = {
    conversation_id: 'conv-fake-blocked',
    status: 'SUCCESS',
    structured_output: {
      status: 'blocked',
      summary: 'Task blocked due to missing dependency',
      checks: [],
      remaining_risks: ['Needs API key']
    },
    duration_seconds: 1.0,
    num_turns: 1
  };
  process.stdout.write(JSON.stringify(envelope));
  process.exit(0);
}

if (scenario === 'failing_check') {
  const envelope = {
    conversation_id: 'conv-fake-fail-check',
    status: 'SUCCESS',
    structured_output: {
      status: 'completed',
      summary: 'Finished work but test failed',
      checks: [
        { command: process.env.FAKE_AGY_CHECK_CMD || 'npm run test', outcome: '1 failed', passed: false }
      ],
      remaining_risks: ['Failing test']
    },
    duration_seconds: 1.2,
    num_turns: 1
  };
  process.stdout.write(JSON.stringify(envelope));
  process.exit(0);
}

if (scenario === 'missing_check') {
  const envelope = {
    conversation_id: 'conv-fake-missing-check',
    status: 'SUCCESS',
    structured_output: {
      status: 'completed',
      summary: 'Finished without running checks',
      checks: [],
      remaining_risks: []
    },
    duration_seconds: 0.8,
    num_turns: 1
  };
  process.stdout.write(JSON.stringify(envelope));
  process.exit(0);
}

if (scenario === 'scope_violation') {
  // Write to an unlisted file
  fs.writeFileSync('unlisted-file.txt', 'illegal write');
  const envelope = {
    conversation_id: 'conv-fake-scope',
    status: 'SUCCESS',
    structured_output: {
      status: 'completed',
      summary: 'Wrote unlisted file',
      checks: [{ command: process.env.FAKE_AGY_CHECK_CMD || 'npm run test', outcome: 'ok', passed: true }],
      remaining_risks: []
    },
    duration_seconds: 1.0,
    num_turns: 1
  };
  process.stdout.write(JSON.stringify(envelope));
  process.exit(0);
}

if (scenario === 'index_tamper') {
  // Tamper with Git index (resolving via git plumbing if nested in parent repository)
  let indexPath = null;
  if (fs.existsSync('.git/index')) {
    indexPath = path.resolve('.git/index');
  } else {
    try {
      const res = spawnSync('git', ['rev-parse', '--git-path', 'index'], {
        shell: false,
        windowsHide: true,
        timeout: 3000,
        stdio: ['ignore', 'pipe', 'ignore'],
        encoding: 'utf8'
      });
      if (res.status === 0 && res.stdout && res.stdout.trim()) {
        indexPath = path.resolve(res.stdout.trim());
      }
    } catch {}
  }

  if (indexPath && fs.existsSync(indexPath)) {
    fs.appendFileSync(indexPath, 'tampered');
  }

  const envelope = {
    conversation_id: 'conv-fake-index',
    status: 'SUCCESS',
    structured_output: {
      status: 'completed',
      summary: 'Tampered index',
      checks: [{ command: process.env.FAKE_AGY_CHECK_CMD || 'npm run test', outcome: 'ok', passed: true }],
      remaining_risks: []
    },
    duration_seconds: 1.0,
    num_turns: 1
  };
  process.stdout.write(JSON.stringify(envelope));
  process.exit(0);
}

if (scenario === 'credentials_in_free_text') {
  // Build credential-shaped values at runtime so the fixture can exercise
  // redaction without tripping repository hygiene's static secret scanner.
  const fakeSupabaseSecret = ['sb', 'secret', 'N3v3rExpos3Th1sS3cr3tK3y'].join('_');
  const fakeProjectKey = ['sk', 'proj', '1234567890abcdef123456'].join('-');
  const fakePassword = ['mySuperSecretPassword', '123'].join('');
  const envelope = {
    conversation_id: conversationId,
    status: 'SUCCESS',
    structured_output: {
      status: 'completed',
      summary: process.env.FAKE_AGY_SUMMARY || `Task completed with ${fakeSupabaseSecret} and ${fakeProjectKey}`,
      checks: [
        {
          command: process.env.FAKE_AGY_CHECK_CMD || 'npm run test',
          outcome: process.env.FAKE_AGY_OUTCOME || 'Passed with Bearer ya29.testtoken12345 and eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHclw_c_pQ4Lw_pQ4Lw',
          passed: true
        }
      ],
      remaining_risks: process.env.FAKE_AGY_RISKS
        ? JSON.parse(process.env.FAKE_AGY_RISKS)
        : [`Risk: password="${fakePassword}" exposed in config`]
    },
    duration_seconds: 1.0,
    num_turns: 1
  };
  process.stdout.write(JSON.stringify(envelope));
  process.exit(0);
}

// Default success scenario
if (process.env.FAKE_AGY_WRITE_FILE && process.env.FAKE_AGY_WRITE_CONTENT) {
  const target = process.env.FAKE_AGY_WRITE_FILE;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, process.env.FAKE_AGY_WRITE_CONTENT);
}

const envelope = {
  conversation_id: conversationId,
  status: 'SUCCESS',
  structured_output: {
    status: 'completed',
    summary: 'Successfully implemented task within bounds',
    checks: [
      { command: process.env.FAKE_AGY_CHECK_CMD || 'npm run test', outcome: 'All tests passed', passed: true }
    ],
    remaining_risks: []
  },
  usage: {
    input_tokens: 120,
    output_tokens: 45
  },
  duration_seconds: 2.5,
  num_turns: 1
};

process.stdout.write(JSON.stringify(envelope));
process.exit(0);
