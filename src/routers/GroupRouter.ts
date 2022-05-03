// GroupRouter ---------------------------------------------------------------

// Express endpoints for Group models.

// External Modules ----------------------------------------------------------

import {Request, Response, Router} from "express";

// Internal Modules ----------------------------------------------------------

import {
    requireAdmin,
    requireAny,
    requireRegular,
    requireSuperuser,
} from "../oauth/OAuthMiddleware";
import GroupServices from "../services/GroupServices";
import {CREATED} from "../util/HttpErrors";

// Public Objects ------------------------------------------------------------

export const GroupRouter = Router({
    strict: true,
});

export default GroupRouter;

// Model-Specific Routes (no groupId) --------------------------------------

// GET /exact/:name - Find Group by exact name
GroupRouter.get("/exact/:name",
    requireAny,
    async (req: Request, res: Response) => {
        res.send(await GroupServices.exact(
            req.params.name,
            req.query
        ));
    });

// Standard CRUD Routes ------------------------------------------------------

// GET / - Find all matching Groups
GroupRouter.get("/",
    async (req: Request, res: Response) => {
        res.send(await GroupServices.all(
            req.query
        ));
    });

// POST / - Insert a new Group
GroupRouter.post("/",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.status(CREATED).send(await GroupServices.insert(req.body));
    });

// DELETE /:groupId - Remove Group by ID
GroupRouter.delete("/:groupId",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await GroupServices.remove(req.params.groupId));
    });

// GET /:groupId - Find Group by ID
GroupRouter.get("/:groupId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await GroupServices.find(req.params.groupId, req.query));
    });

// PUT /:groupId - Update Group by ID
GroupRouter.put("/:groupId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await GroupServices.update(req.params.groupId, req.body));
    });

// Child Lookup Routes -------------------------------------------------------

// GET /:groupId/categories - Find matching Categories for this Group
GroupRouter.get("/:groupId/categories",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await GroupServices.categories(
            req.params.groupId,
            req.query
        ));
    });

// GET /:groupId/items - Find matching Items for this Group
GroupRouter.get("/:groupId/items",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await GroupServices.items(
            req.params.groupId,
            req.query
        ));
    });

// GET /:groupId/lists - Find matching Lists for this Group
GroupRouter.get("/:groupId/lists",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await GroupServices.lists(
            req.params.groupId,
            req.query
        ));
    });
