// GroupServices -------------------------------------------------------------

// Services implementation for Group models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op} from "sequelize";

// Internal Modules ----------------------------------------------------------

import BaseParentServices from "./BaseParentServices";
import Group from "../models/Group";
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

/*
    public async accessTokens(userId: string, query?: any): Promise<AccessToken[]> {
        const user = await this.read("GroupServices.accessTokens", userId);
        const options: FindOptions = AccessTokenServices.appendMatchOptions({
            order: SortOrder.ACCESS_TOKENS,
        }, query);
        return user.$get("accessTokens", options);
    }
*/

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

/*
    public async refreshTokens(userId: string, query?: any): Promise<RefreshToken[]> {
        const user = await this.read("GroupServices.refreshTokens", userId);
        const options: FindOptions = RefreshTokenServices.appendMatchOptions({
            order: SortOrder.REFRESH_TOKENS,
        }, query);
        return user.$get("refreshTokens", options);
    }
*/

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
/*
        if ("" === query.withLists) {
            include.push(List);
        }
*/
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
