import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate, createUserSchema, updateUserSchema } from '../utils/validators.js';
// import { auditMiddleware } from '../middleware/audit.js'; // Will implement audit later

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Owner and Admin can manage users
router.post('/', authorize(['owner', 'admin']), auditMiddleware('CREATE_USER'), userController.createUser);
router.post('/invite', authorize(['owner', 'admin']), auditMiddleware('INVITE_USER'), userController.inviteUser);
router.get('/', authorize(['owner', 'admin']), userController.getUsers);
router.get('/:id', authorize(['owner', 'admin']), userController.getUserById);
router.put('/:id', authorize(['owner']), auditMiddleware('UPDATE_USER'), userController.updateUser);
router.delete('/:id', authorize(['owner']), auditMiddleware('DELETE_USER'), userController.deleteUser);

// Public route for accepting invite (no auth required)
// Note: This should ideally be in a separate public router or handled carefully
// For MVP, we'll keep it here but bypass the top-level auth middleware if we can, 
// OR we move it to auth routes. Let's move it to auth routes for cleaner separation?
// Actually, let's keep it here but we need to handle the auth middleware issue.
// The router uses `router.use(authenticate)` at the top.
// We should move `accept-invite` to `auth.routes.js` or make a public user route.
// Let's add it to `auth.routes.js` instead to avoid middleware complexity here.

export default router;
