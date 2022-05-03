// ItemRouter ----------------------------------------------------------------

// Express endpoints for Item models.

import {Request, Response, Router} from "express";

// Internal Modules ----------------------------------------------------------

import {
    requireAdmin,
    requireRegular,
} from "../oauth/OAuthMiddleware";
import ItemServices from "../services/ItemServices";
import {CREATED} from "../util/HttpErrors";

// Public Objects ------------------------------------------------------------

export const ItemRouter = Router({
    strict: true,
});

export default ItemRouter;

// Model-Specific Routes (no itemId) ---------------------------------------

// GET /:groupId/exact/:name - Find Item by exact name
ItemRouter.get("/:groupId/exact/:name",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await ItemServices.exact(
            req.params.groupId,
            req.params.name,
            req.query
        ));
    });

// Standard CRUD Routes ------------------------------------------------------

// GET /:groupId - Find all Items
ItemRouter.get("/:groupId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await ItemServices.all(
            req.params.groupId,
            req.query
        ));
    });

// POST /:groupId/ - Insert a new Item
ItemRouter.post("/:groupId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.status(CREATED).send(await ItemServices.insert(
            req.params.groupId,
            req.body
        ));
    });

// DELETE /:groupId/:itemId - Remove Item by ID
ItemRouter.delete("/:groupId/:itemId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await ItemServices.remove(
            req.params.groupId,
            req.params.itemId,
        ));
    });

// GET /:groupId/:itemId - Find Item by ID
ItemRouter.get("/:groupId/:itemId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await ItemServices.find(
            req.params.groupId,
            req.params.itemId,
            req.query
        ));
    });

// PUT /:groupId/:itemId - Update Item by ID
ItemRouter.put("/:groupId/:itemId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await ItemServices.update(
            req.params.groupId,
            req.params.itemId,
            req.body
        ));
    });

