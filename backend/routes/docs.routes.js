import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Load OpenAPI spec
const swaggerDocument = YAML.load(path.join(__dirname, '../../docs/openapi.yaml'));

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
