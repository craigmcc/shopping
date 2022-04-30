// UserServices --------------------------------------------------------------

// Services implementation for User models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op} from "sequelize";

// Internal Modules ----------------------------------------------------------

import BaseParentServices from "./BaseParentServices";
import AccessToken from "../models/AccessToken";
import RefreshToken from "../models/RefreshToken";
import User from "../models/User";
import AccessTokenServices from "./AccessTokenServices";
import RefreshTokenServices from "./RefreshTokenServices";
import {hashPassword} from "../oauth/OAuthUtils";
import {BadRequest, NotFound} from "../util/HttpErrors";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrder";

// Public Classes ------------------------------------------------------------

class UserServices extends BaseParentServices<User> {

    constructor () {
        super(User, SortOrder.USERS, [
            "active",
            "email",
            "name",
            "password",
            "scope",
            "username",
        ]);
    }

    // Standard CRUD Operations ----------------------------------------------

    // NOTE: Overrides to redact password in all returned values

    public async all(query?: object): Promise<User[]> {
        const results = await super.all(query);
        results.forEach(result => {
            result.password = "";
        });
        return results;
    }

    public async find(userId: string, query?: any): Promise<User> {
        const result = await super.find(userId, query);
        result.password = "";
        return result;
    }

    public async insert(user: Partial<User>): Promise<User> {
        if (!user.password) {
            throw new BadRequest(
                `password: Is required`,
                "UserServices.insert"
            );
        }
        user.password = await hashPassword(user.password); // NOTE - leaked back to caller
        const result = await super.insert(user);
        result.password = "";
        return result;
    }

    public async remove(userId: string): Promise<User> {
        const result = await super.remove(userId);
        result.password = "";
        return result;
    }

    public async update(userId: string, user: Partial<User>): Promise<User> {
        if (user.password && (user.password.length > 0)) {
            user.password = await hashPassword(user.password); // NOTE - leaked back to caller
        } else {
            delete user.password;
        }
        const result = await super.update(userId, user);
        result.password = "";
        return result;
    }

    // Model-Specific Methods ------------------------------------------------

    public async accessTokens(userId: string, query?: any): Promise<AccessToken[]> {
        const user = await this.read("UserServices.accessTokens", userId);
        const options: FindOptions = AccessTokenServices.appendMatchOptions({
            order: SortOrder.ACCESS_TOKENS,
        }, query);
        return user.$get("accessTokens", options);
    }

    public async exact(username: string, query?: any): Promise<User> {
        let options: FindOptions = this.appendIncludeOptions({
            where: { username: username }
        }, query);
        const results = await User.findAll(options);
        if (results.length !== 1) {
            throw new NotFound(
                `username: Missing User '${username}'`,
                "UserServices.exact");
        }
        results[0].password = "";
        return results[0];
    }

    public async refreshTokens(userId: string, query?: any): Promise<RefreshToken[]> {
        const user = await this.read("UserServices.refreshTokens", userId);
        const options: FindOptions = RefreshTokenServices.appendMatchOptions({
            order: SortOrder.REFRESH_TOKENS,
        }, query);
        return user.$get("refreshTokens", options);
    }

    // Public Helpers --------------------------------------------------------

    /**
     * Supported include query parameters:
     * * withAccessTokens               Include child AccessTokens
     * * withRefreshTokens              Include child RefreshTokens
     */
    public appendIncludeOptions(options: FindOptions, query?: any): FindOptions {
        if (!query) {
            return options;
        }
        options = appendPaginationOptions(options, query);
        const include: any = options.include ? options.include : [];
        if ("" === query.withAccessTokens) {
            include.push(AccessToken);
        }
        if ("" === query.withRefreshTokens) {
            include.push(RefreshToken);
        }
        if (include.length > 0) {
            options.include = include;
        }
        return options;
    }

    /**
     * Supported match query parameters:
     * * active                         Select active users
     * * username={wildcard}            Select Users with username matching {wildcard}
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
        if (query.username) {
            where.username = { [Op.iLike]: `%${query.username}%` };
        }
        if (Object.keys(where).length > 0) {
            options.where = where;
        }
        return options;
    }

}

export default new UserServices();
