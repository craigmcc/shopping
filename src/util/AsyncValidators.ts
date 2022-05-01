// AsyncValidators -----------------------------------------------------------

// Custom (to this application) validation methods that can only be used by
// server side applications, because they interact directly with the database.
// A "true" return value means that the validation was successful,
// while "false" means it was not.  If a field is required, that must be
// validated separately.

// External Modules ----------------------------------------------------------

import {Op} from "sequelize";

// Internal Modules ----------------------------------------------------------

import AccessToken from "../models/AccessToken";
import RefreshToken from "../models/RefreshToken";
import Group from "../models/Group";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

export const validateAccessTokenTokenUnique
    = async (accessToken: AccessToken): Promise<boolean> =>
{
    if (accessToken && accessToken.token) {
        let options: any = {
            where: {
                token: accessToken.token,
            }
        }
        if (accessToken.id) {
            options.where.id = { [Op.ne]: accessToken.id }
        }
        const results = await AccessToken.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateGroupNameUnique
    = async (group: Group): Promise<boolean> =>
{
    if (group && group.name) {
        let options = {};
        if (group.id) {
            options = {
                where: {
                    id: {[Op.ne]: group.id},
                    name: group.name
                }
            }
        } else {
            options = {
                where: {
                    name: group.name
                }
            }
        }
        let results = await Group.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateGroupScopeUnique
    = async (group: Group): Promise<boolean> =>
{
    if (group && group.scope) {
        let options = {};
        if (group.id) {
            options = {
                where: {
                    id: {[Op.ne]: group.id},
                    scope: group.scope
                }
            }
        } else {
            options = {
                where: {
                    scope: group.scope
                }
            }
        }
        let results = await Group.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateRefreshTokenTokenUnique
    = async (refreshToken: RefreshToken): Promise<boolean> =>
{
    if (refreshToken && refreshToken.token) {
        let options: any = {
            where: {
                token: refreshToken.token,
            }
        }
        if (refreshToken.id) {
            options.where.id = { [Op.ne]: refreshToken.id }
        }
        const results = await RefreshToken.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateUserUsernameUnique
    = async (user: User): Promise<boolean> =>
{
    if (user && user.username) {
        let options = {};
        if (user.id) {
            options = {
                where: {
                    id: {[Op.ne]: user.id},
                    username: user.username
                }
            }
        } else {
            options = {
                where: {
                    username: user.username
                }
            }
        }
        let results = await User.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

