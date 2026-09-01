import { ESLint } from 'eslint';

async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(['src/**/*.js', 'src/**/*.jsx']);
  
  const ruleCounts = {};
  for (const result of results) {
    for (const msg of result.messages) {
      if (msg.severity === 2) {
        ruleCounts[msg.ruleId] = (ruleCounts[msg.ruleId] || 0) + 1;
      }
    }
  }
  
  console.log('Error Rule Counts:', ruleCounts);
}

main().catch(console.error);
