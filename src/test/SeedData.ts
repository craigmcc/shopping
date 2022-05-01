// SeedData ------------------------------------------------------------------

// Seed data for tests.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import AccessToken from "../models/AccessToken";
import Group from "../models/Group";
import List from "../models/List";
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

export const GROUP_NAME_FIRST = "First Group";
export const GROUP_NAME_SECOND = "Second Group";
export const GROUP_NAME_THIRD = "Third Group";
export const GROUP_SCOPE_FIRST = "scope1";
export const GROUP_SCOPE_SECOND = "scope2";
export const GROUP_SCOPE_THIRD = "scope3";

export const GROUPS: Partial<Group>[] = [
    {
        name: GROUP_NAME_FIRST,
        scope: GROUP_SCOPE_FIRST,
    },
    {
        active: false,
        name: GROUP_NAME_SECOND,
        scope: GROUP_SCOPE_SECOND,
    },
    {
        name: GROUP_NAME_THIRD,
        scope: GROUP_SCOPE_THIRD,
    },
];

// *** Lists ***

export const LIST_NAME_FIRST = "First List";
export const LIST_NAME_SECOND = "Second List";
export const LIST_NAME_THIRD = "Third List";

export const LISTS: Partial<List>[] = [
    {
        name: LIST_NAME_FIRST,
    },
    {
        active: false,
        name: LIST_NAME_SECOND,
        notes: "This is the second list",
        theme: "aqua",
    },
    {
        name: LIST_NAME_THIRD,
    },
];


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
export const USER_SCOPE_THIRD_ADMIN = `${GROUP_SCOPE_THIRD}:admin`;
export const USER_SCOPE_THIRD_REGULAR = `${GROUP_SCOPE_THIRD}:regular`;

export const USER_USERNAME_SUPERUSER = "superuser";
export const USER_USERNAME_FIRST_ADMIN = "firstadmin";
export const USER_USERNAME_FIRST_REGULAR = "firstregular";
export const USER_USERNAME_SECOND_ADMIN = "secondadmin";
export const USER_USERNAME_SECOND_REGULAR = "secondregular";
export const USER_USERNAME_THIRD_ADMIN = "thirdadmin";
export const USER_USERNAME_THIRD_REGULAR = "thirdregular";

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
        name: "Third Admin User",
        scope: USER_SCOPE_THIRD_ADMIN,
        username: USER_USERNAME_THIRD_ADMIN,
    },
    {
        active: true,
        name: "Third Regular User",
        scope: USER_SCOPE_THIRD_REGULAR,
        username: USER_USERNAME_THIRD_REGULAR,
    },
    {
        active: true,
        name: "Superuser User",
        scope: USER_SCOPE_SUPERUSER,
        username: USER_USERNAME_SUPERUSER,
    }
];

