// ItemServices --------------------------------------------------------------

// Services implementation for Item models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op} from "sequelize";

// Internal Modules ----------------------------------------------------------

import BaseChildServices from "./BaseChildServices";
import Category from "../models/Category";
import Group from "../models/Group";
import Item from "../models/Item";
import {NotFound} from "../util/HttpErrors";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrder";

// Public Classes ------------------------------------------------------------

class ItemServices extends BaseChildServices<Item, Group> {

    constructor () {
        super(Group, Item, SortOrder.ITEMS, [
            "active",
            "categoryId",
            "groupId",
            "name",
            "notes",
            "theme",
        ]);
    }

    // Model-Specific Methods ------------------------------------------------

    public async exact(groupId: string, name: string, query?: any): Promise<Item> {
        let options: FindOptions = this.appendIncludeOptions({
            where: {
                groupId: groupId,
                name: name,
            }
        }, query);
        const result = await Item.findOne(options);
        if (result) {
            return result;
        } else {
            throw new NotFound(
                `name: Missing Item '${name}'`,
                "ItemServices.exact");
        }
    }

    // Public Helpers --------------------------------------------------------

    /**
     * Supported include query parameters:
     * * withCategory                   Include owning Category
     * * withGroup                      Include parent Group
     */
    public appendIncludeOptions(options: FindOptions, query?: any): FindOptions {
        if (!query) {
            return options;
        }
        options = appendPaginationOptions(options, query);
        const include: any = options.include ? options.include : [];
        if ("" === query.withCategory) {
            include.push(Category);
        }
        if ("" === query.withGroup) {
            include.push(Group);
        }
        if (include.length > 0) {
            options.include = include;
        }
        return options;
    }

    /**
     * Supported match query parameters:
     * * active                         Select active Items
     * * name={wildcard}                Select Items with name matching {wildcard}
     */
    public appendMatchOptions(options: FindOptions, query?: any): FindOptions {
        options = this.appendIncludeOptions(options, query);
        if (!query) {
            return options;
        }
        const where: any = options.where ? options.where : {};
        if ("" === query.active) {
            where.active = true;
        }
        if (query.name) {
            where.name = { [Op.iLike]: `%${query.name}%` };
        }
        if (Object.keys(where).length > 0) {
            options.where = where;
        }
        return options;
    }

}

export default new ItemServices();
