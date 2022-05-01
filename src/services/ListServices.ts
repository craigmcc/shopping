// ListServices --------------------------------------------------------------

// Services implementation for List models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op} from "sequelize";

// Internal Modules ----------------------------------------------------------

import BaseChildServices from "./BaseChildServices";
import Group from "../models/Group";
import List from "../models/List";
import {NotFound} from "../util/HttpErrors";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrder";

// Public Classes ------------------------------------------------------------

class ListServices extends BaseChildServices<List, Group> {

    constructor () {
        super(Group, List, SortOrder.LISTS, [
            "active",
            "groupId",
            "name",
            "notes",
            "theme",
        ]);
    }

    // Model-Specific Methods ------------------------------------------------

    public async exact(groupId: string, name: string, query?: any): Promise<List> {
        let options: FindOptions = this.appendIncludeOptions({
            where: {
                groupId: groupId,
                name: name,
            }
        }, query);
        const result = await List.findOne(options);
        if (result) {
            return result;
        } else {
            throw new NotFound(
                `name: Missing List '${name}'`,
                "ListServices.exact");
        }
    }

    // Public Helpers --------------------------------------------------------

    /**
     * Supported include query parameters:
     * * withGroup                      Include parent Group
     */
    public appendIncludeOptions(options: FindOptions, query?: any): FindOptions {
        if (!query) {
            return options;
        }
        options = appendPaginationOptions(options, query);
        const include: any = options.include ? options.include : [];
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
     * * active                         Select active Lists
     * * name={wildcard}                Select Lists with name matching {wildcard}
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

export default new ListServices();
