// ListRouter ----------------------------------------------------------------

// Express endpoints for List models.

import {Request, Response, Router} from "express";

// Internal Modules ----------------------------------------------------------

import {
    requireAdmin,
    requireRegular,
} from "../oauth/OAuthMiddleware";
import ListServices from "../services/ListServices";
import {CREATED} from "../util/HttpErrors";

// Public Objects ------------------------------------------------------------

export const ListRouter = Router({
    strict: true,
});

export default ListRouter;

// Model-Specific Routes (no listId) ---------------------------------------

// GET /:groupId/exact/:name - Find List by exact name
ListRouter.get("/:groupId/exact/:name",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await ListServices.exact(
            req.params.groupId,
            req.params.name,
            req.query
        ));
    });

// Standard CRUD Routes ------------------------------------------------------

// GET /:groupId - Find all Lists
ListRouter.get("/:groupId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await ListServices.all(
            req.params.groupId,
            req.query
        ));
    });

// POST /:groupId/ - Insert a new List
ListRouter.post("/:groupId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.status(CREATED).send(await ListServices.insert(
            req.params.groupId,
            req.body
        ));
    });

// DELETE /:groupId/:listId - Remove List by ID
ListRouter.delete("/:groupId/:listId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await ListServices.remove(
            req.params.groupId,
            req.params.listId,
        ));
    });

// GET /:groupId/:listId - Find List by ID
ListRouter.get("/:groupId/:listId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await ListServices.find(
            req.params.groupId,
            req.params.listId,
            req.query
        ));
    });

// PUT /:groupId/:listId - Update List by ID
ListRouter.put("/:groupId/:listId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await ListServices.update(
            req.params.groupId,
            req.params.listId,
            req.body
        ));
    });

