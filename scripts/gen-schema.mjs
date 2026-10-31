// Erzeugt variants/_schema.json aus dem Zod-Schema (Autovervollständigung in VS Code).
import { writeFileSync } from 'node:fs';
import { z } from 'zod';
import { siteConfigSchema } from '../variants/_schema.ts';

const json = z.toJSONSchema(siteConfigSchema, { io: 'input', target: 'draft-7', unrepresentable: 'any' });
json.title = 'Handwerker-Template · Varianten-Konfiguration';
writeFileSync(new URL('../variants/_schema.json', import.meta.url), JSON.stringify(json, null, 2) + '\n');
console.log('✔ variants/_schema.json aktualisiert');
