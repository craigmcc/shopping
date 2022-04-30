// SeedData ------------------------------------------------------------------

// Seed data for tests.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import AccessToken from "../models/AccessToken";
import RefreshToken from "../models/RefreshToken";
import User from "../models/User";

// Seed Data -----------------------------------------------------------------

// *** Access Tokens ***

const ONE_DAY = 24 * 60 * 60 * 1000;    // One day (milliseconds)

export const ACCESS_TOKENS_SUPERUSER: Partial<AccessToken>[] = [
    {
        expires: new Date(new Date().getTime() + ONE_DAY),
        scope: "superuser",
        token: "superuser_access_1",
        // userId must be seeded
    },
    {
        expires: new Date(new Date().getTime() - ONE_DAY),
        scope: "superuser",
        token: "superuser_access_2",
        // userId must be seeded
    },
];

// *** Groups ***

export const GROUP_SCOPE_FIRST = "scope1";
export const GROUP_SCOPE_SECOND = "scope2";


// *** Refresh Tokens ***

export const REFRESH_TOKENS_SUPERUSER: Partial<RefreshToken>[] = [
    {
        accessToken: "superuser_access_1",
        expires: new Date(new Date().getTime() + ONE_DAY),
        token: "superuser_refresh_1",
        // userId must be seeded
    },
    {
        accessToken: "superuser_access_2",
        expires: new Date(new Date().getTime() - ONE_DAY),
        token: "superuser_refresh_2",
        // userId must be seeded
    },
];

// ***** Users *****

export const USER_SCOPE_SUPERUSER = "superuser";
export const USER_SCOPE_FIRST_ADMIN = `${GROUP_SCOPE_FIRST}:admin`;
export const USER_SCOPE_FIRST_REGULAR = `${GROUP_SCOPE_FIRST}:regular`;
export const USER_SCOPE_SECOND_ADMIN = `${GROUP_SCOPE_SECOND}:admin`;
export const USER_SCOPE_SECOND_REGULAR = `${GROUP_SCOPE_SECOND}:regular`;

export const USER_USERNAME_SUPERUSER = "superuser";
export const USER_USERNAME_FIRST_ADMIN = "firstadmin";
export const USER_USERNAME_FIRST_REGULAR = "firstregular";
export const USER_USERNAME_SECOND_ADMIN = "secondadmin";
export const USER_USERNAME_SECOND_REGULAR = "secondregular";

export const USERS: Partial<User>[] = [
    {
        active: true,
        name: "First Admin User",
        scope: USER_SCOPE_FIRST_ADMIN,
        username: USER_USERNAME_FIRST_ADMIN,
    },
    {
        active: true,
        name: "First Regular User",
        scope: USER_SCOPE_FIRST_REGULAR,
        username: USER_USERNAME_FIRST_REGULAR,
    },
    {
        active: false,
        name: "Second Admin User",
        scope: USER_SCOPE_SECOND_ADMIN,
        username: USER_USERNAME_SECOND_ADMIN,
    },
    {
        active: false,
        name: "Second Regular User",
        scope: USER_SCOPE_SECOND_REGULAR,
        username: USER_USERNAME_SECOND_REGULAR,
    },
    {
        active: true,
        name: "Superuser User",
        scope: USER_SCOPE_SUPERUSER,
        username: USER_USERNAME_SUPERUSER,
    }
];

