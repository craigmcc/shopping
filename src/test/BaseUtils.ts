// BaseUtils -----------------------------------------------------------------

// Base utilities for functional tests.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import * as SeedData from "./SeedData";
import AccessToken from "../models/AccessToken";
import Database from "../models/Database";
import Group from "../models/Group";
import RefreshToken from "../models/RefreshToken";
import User from "../models/User";
import {clearMapping} from "../oauth/OAuthMiddleware";
import {hashPassword} from "../oauth/OAuthUtils";

// Public Objects ------------------------------------------------------------

export type OPTIONS = {
    withAccessTokens: boolean,
    withCategories: boolean,
    withGroups: boolean,
    withItems: boolean,
    withLists: boolean,
    withRefreshTokens: boolean,
    withSelecteds: boolean,
    withUsers: boolean,
};

/**
 * Base utilities for functional tests.
 */
export abstract class BaseUtils {

    /**
     * Erase current database, then load seed data for the tables selected
     * in the options parameter.
     *
     * @param options                   Flags to select tables to be loaded
     */
    public async loadData(options: Partial<OPTIONS>): Promise<void> {

        // Create tables (if necessary), and erase current contents
        await Database.sync({
            force: true,
        });

        // Clear any previous OAuth mapping for Library id -> scope
        clearMapping();

        // Load users (and tokens) if requested
        if (options.withUsers) {
            await loadUsers(SeedData.USERS);
            const userSuperuser = await User.findOne({
                where: { username: SeedData.USER_USERNAME_SUPERUSER }
            });
            if (userSuperuser) {
                if (options.withAccessTokens) {
                    await loadAccessTokens(userSuperuser, SeedData.ACCESS_TOKENS_SUPERUSER);
                }
                if (options.withRefreshTokens) {
                    await loadRefreshTokens(userSuperuser, SeedData.REFRESH_TOKENS_SUPERUSER);
                }
            }
        }

        // Load groups (and related children) if requested
        if (options.withGroups) {
            await loadGroups(SeedData.GROUPS);
        }

    }

}

export default BaseUtils;

// Private Objects -----------------------------------------------------------

const loadAccessTokens
    = async (user: User, accessTokens: Partial<AccessToken>[]): Promise<AccessToken[]> => {
    accessTokens.forEach(accessToken => {
        accessToken.userId = user.id;
    });
    let results: AccessToken[] = [];
    try {
        // @ts-ignore NOTE - did Typescript get tougher about Partial<M>?
        results = await AccessToken.bulkCreate(accessTokens);
        return results;
    } catch (error) {
        console.info(`  Reloading AccessTokens for User '${user.username}' ERROR`, error);
        throw error;
    }
}

const loadGroups
    = async (groups: Partial<Group>[]): Promise<Group[]> =>
{
    let results: Group[] = [];
    try {
        // @ts-ignore NOTE - did Typescript get tougher about Partial<M>?
        results = await Group.bulkCreate(groups);
    } catch (error) {
        console.info("  Reloading Groups ERROR", error);
        throw error;
    }
    return results;
}

const loadRefreshTokens
    = async (user: User, refreshTokens: Partial<RefreshToken>[]): Promise<RefreshToken[]> => {
    refreshTokens.forEach(refreshToken => {
        refreshToken.userId = user.id;
    });
    let results: RefreshToken[] = [];
    try {
        // @ts-ignore NOTE - did Typescript get tougher about Partial<M>?
        results = await RefreshToken.bulkCreate(refreshTokens);
        return results;
    } catch (error) {
        console.info(`  Reloading RefreshTokens for User '${user.username}' ERROR`, error);
        throw error;
    }
}

const hashedPassword = async (password: string | undefined): Promise<string> => {
    return hashPassword(password ? password : "");
}

const loadUsers = async (users: Partial<User>[]): Promise<User[]> => {
    // For tests, the unhashed password is the same as the username
    const promises = users.map(user => hashedPassword(user.username));
    const hashedPasswords: string[] = await Promise.all(promises);
    for(let i = 0; i < users.length; i++) {
        users[i].password = hashedPasswords[i];
    }
    try {
        // @ts-ignore NOTE - did Typescript get tougher about Partial<M>?
        return User.bulkCreate(users);
    } catch (error) {
        console.info("  Reloading Users ERROR", error);
        throw error;
    }
}

