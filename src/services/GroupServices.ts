// GroupServices -------------------------------------------------------------

// Services implementation for Group models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op} from "sequelize";

// Internal Modules ----------------------------------------------------------

import BaseParentServices from "./BaseParentServices";
import Category from "../models/Category";
import Group from "../models/Group";
import Item from "../models/Item";
import List from "../models/List";
import CategoryServices from "../services/CategoryServices";
import ItemServices from "../services/ItemServices";
import ListServices from "../services/ListServices";
import {NotFound} from "../util/HttpErrors";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrder";

// Public Classes ------------------------------------------------------------

class GroupServices extends BaseParentServices<Group> {

    constructor () {
        super(Group, SortOrder.GROUPS, [
            "active",
            "email",
            "name",
            "notes",
            "scope",
        ]);
    }

    // Model-Specific Methods ------------------------------------------------

    public async categories(groupId: string, query?: any): Promise<Category[]> {
        const group = await this.read("GroupServices.categories", groupId);
        const options: FindOptions = CategoryServices.appendMatchOptions({
            order: SortOrder.CATEGORIES,
        }, query);
        return group.$get("categories", options);
    }

    public async exact(name: string, query?: any): Promise<Group> {
        let options: FindOptions = this.appendIncludeOptions({
            where: { name: name }
        }, query);
        const results = await Group.findAll(options);
        if (results.length !== 1) {
            throw new NotFound(
                `name: Missing Group '${name}'`,
                "GroupServices.exact");
        }
        return results[0];
    }

    public async items(groupId: string, query?: any): Promise<Item[]> {
        const group = await this.read("GroupServices.items", groupId);
        const options: FindOptions = ItemServices.appendMatchOptions({
            order: SortOrder.ITEMS,
        }, query);
        return group.$get("items", options);
    }

    public async lists(groupId: string, query?: any): Promise<List[]> {
        const group = await this.read("GroupServices.lists", groupId);
        const options: FindOptions = ListServices.appendMatchOptions({
            order: SortOrder.LISTS,
        }, query);
        return group.$get("lists", options);
    }

    // Public Helpers --------------------------------------------------------

    /**
     * Supported include query parameters:
     * * withCategories                 Include child Categories
     * * withItems                      Include child Items
     * * withLists                      Include child Lists
     */
    public appendIncludeOptions(options: FindOptions, query?: any): FindOptions {
        if (!query) {
            return options;
        }
        options = appendPaginationOptions(options, query);
        const include: any = options.include ? options.include : [];
/*
        if ("" === query.withCategories) {
            include.push(Category);
        }
*/
/*
        if ("" === query.withItems) {
            include.push(Item);
        }
*/
        if ("" === query.withLists) {
            include.push(List);
        }
        if (include.length > 0) {
            options.include = include;
        }
        return options;
    }

    /**
     * Supported match query parameters:
     * * active                         Select active Groups
     * * name={wildcard}                Select Groups with name matching {wildcard}
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

export default new GroupServices();
