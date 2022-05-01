// SortOrder -----------------------------------------------------------------

// Standard "order" values for each defined Model

// External Modules ----------------------------------------------------------

import {Order} from "sequelize";

// Public Objects ------------------------------------------------------------

export const ACCESS_TOKENS: Order = [
    [ "userId", "ASC" ],
    [ "expires", "DESC" ],
];

export const GROUPS: Order = [
    ["name", "ASC" ],
];

export const REFRESH_TOKENS: Order = [
    [ "userId", "ASC" ],
    [ "expires", "DESC" ],
];

export const USERS: Order = [
    [ "username", "ASC" ],
];

