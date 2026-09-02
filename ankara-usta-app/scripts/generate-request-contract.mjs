// Generate the SQL snapshot from the same static definitions used by the UI.
// Pass a NEW, CLI-created migration path. Never regenerate an applied migration.
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
const source = ts.createSourceFile('definitions.ts', readFileSync('app/data/wizardDefinitions.ts','utf8'), ts.ScriptTarget.Latest, true);
let literal;
for (const statement of source.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (declaration.name.getText(source) === 'customWizardDefinitions') literal = declaration.initializer.getText(source);
  }
}
if (!literal) throw new Error('Wizard definitions not found');
const definitions = vm.runInNewContext(`(${literal})`, {}, {timeout:1000});
const target = resolve(process.argv[2] || '');
if (!target.startsWith(resolve('supabase/migrations') + '/') && !target.startsWith(resolve('supabase/migrations') + '\\')) throw new Error('Use a migration path');
const template = readFileSync('scripts/request-contract.sql','utf8');
writeFileSync(target, template.replace('__DEFINITIONS__', JSON.stringify(definitions)));
