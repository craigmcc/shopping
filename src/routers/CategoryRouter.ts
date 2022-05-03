// CategoryRouter ----------------------------------------------------------------

// Express endpoints for Category models.

import {Request, Response, Router} from "express";

// Internal Modules ----------------------------------------------------------

import {
    requireAdmin,
    requireRegular,
} from "../oauth/OAuthMiddleware";
import CategoryServices from "../services/CategoryServices";
import {CREATED} from "../util/HttpErrors";

// Public Objects ------------------------------------------------------------

export const CategoryRouter = Router({
    strict: true,
});

export default CategoryRouter;

// Model-Specific Routes (no categoryId) ---------------------------------------

// GET /:groupId/exact/:name - Find Category by exact name
CategoryRouter.get("/:groupId/exact/:name",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await CategoryServices.exact(
            req.params.groupId,
            req.params.name,
            req.query
        ));
    });

// Standard CRUD Routes ------------------------------------------------------

// GET /:groupId - Find all Categories
CategoryRouter.get("/:groupId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await CategoryServices.all(
            req.params.groupId,
            req.query
        ));
    });

// POST /:groupId/ - Insert a new Category
CategoryRouter.post("/:groupId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.status(CREATED).send(await CategoryServices.insert(
            req.params.groupId,
            req.body
        ));
    });

// DELETE /:groupId/:categoryId - Remove Category by ID
CategoryRouter.delete("/:groupId/:categoryId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await CategoryServices.remove(
            req.params.groupId,
            req.params.categoryId,
        ));
    });

// GET /:groupId/:categoryId - Find Category by ID
CategoryRouter.get("/:groupId/:categoryId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await CategoryServices.find(
            req.params.groupId,
            req.params.categoryId,
            req.query
        ));
    });

// PUT /:groupId/:categoryId - Update Category by ID
CategoryRouter.put("/:groupId/:categoryId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await CategoryServices.update(
            req.params.groupId,
            req.params.categoryId,
            req.body
        ));
    });

