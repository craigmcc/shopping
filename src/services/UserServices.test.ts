// UserServices.test ---------------------------------------------------------

// Functional tests for UserServices.

// External Modules ----------------------------------------------------------

import chai from "chai";
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import UserServices from "./UserServices";
import User from "../models/User";
import * as SeedData from "../test/SeedData";
import ServicesUtils from "../test/ServicesUtils";
import {BadRequest, NotFound} from "../util/HttpErrors";

const UTILS = new ServicesUtils();
const INVALID_ID = UTILS.invalidId();

// Test Specifications ------------------------------------------------------

describe("UserServices Functional Tests", () => {

    // Test Hooks -----------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await UTILS.loadData({
            withAccessTokens: true,
            withRefreshTokens: true,
            withUsers: true,
        });
    })

    // Test Methods ---------------------------------------------------------

    describe("UserServices.accessTokens()", () => {

        it("should pass on active AccessTokens", async () => {

            const NOW = new Date().getTime();
            const user = await UTILS.lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const accessTokens = await UserServices.accessTokens(user.id, {
                active: "",
            });

            expect(accessTokens.length).to.be.lessThan(SeedData.ACCESS_TOKENS_SUPERUSER.length);
            accessTokens.forEach(accessToken => {
                expect(accessToken.expires.getTime()).to.be.greaterThanOrEqual(NOW);
                expect(accessToken.userId).to.equal(user.id);
            });

        })

        it("should pass on all AccessTokens", async () => {

            const user = await UTILS.lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const accessTokens = await UserServices.accessTokens(user.id);

            expect(accessTokens.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length);
            accessTokens.forEach(accessToken => {
                expect(accessToken.userId).to.equal(user.id);
            });

        })

        it("should pass on paginated AccessTokens", async () => {

            const LIMIT = 99;
            const OFFSET = 1;
            const user = await UTILS.lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const accessTokens = await UserServices.accessTokens(user.id, {
                limit: LIMIT,
                offset: OFFSET,
            });

            expect(accessTokens.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length - OFFSET);
            accessTokens.forEach(accessToken => {
                expect(accessToken.userId).to.equal(user.id);
            });

        })

    })

    describe("UserServices.all()", () => {

        it("should pass on active Users", async () => {

            const users = await UserServices.all({ active: "" });
            users.forEach(library => {
                expect(library.active).to.be.true;
            });

        })

        it("should pass on all Users", async () => {

            const users = await UserServices.all();
            expect(users.length).to.equal(SeedData.USERS.length);

        })

        it("should pass on included children", async () => {

            const users = await UserServices.all({
                withAccessTokens: "",
                withRefreshTokens: "",
            });

            users.forEach(user => {
                expect(user.accessTokens).to.exist;
                if (user.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(user.accessTokens.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length);
                } else {
                    expect(user.accessTokens.length).to.equal(0);
                }
                user.accessTokens.forEach(accessToken => {
                    expect(accessToken.userId).to.equal(user.id);
                });
                expect(user.refreshTokens).to.exist;
                if (user.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(user.refreshTokens.length).to.equal(SeedData.REFRESH_TOKENS_SUPERUSER.length);
                } else {
                    expect(user.refreshTokens.length).to.equal(0);
                }
                user.refreshTokens.forEach(refreshToken => {
                    expect(refreshToken.userId).to.equal(user.id);
                });
            });


        })

        it("should pass on named Users", async () => {

            const PATTERN = "AdM";  // Should match on "admin"

            const users = await UserServices.all({ username: PATTERN });
            expect(users.length).to.be.greaterThan(0);
            expect(users.length).to.be.lessThan(SeedData.USERS.length);
            users.forEach(user => {
                expect(user.username.toLowerCase()).to.include(PATTERN.toLowerCase());
            })

        })

        it("should pass on paginated Users", async () => {

            const LIMIT = 99;
            const OFFSET = 1;
            const INPUTS = await UserServices.all();

            const OUTPUTS = await UserServices.all({
                limit: LIMIT,
                offset: OFFSET,
            });
            expect(OUTPUTS.length).to.be.lessThanOrEqual(LIMIT);
            expect(OUTPUTS.length).to.equal(SeedData.USERS.length - OFFSET);
            OUTPUTS.forEach((OUTPUT, index) => {
                compareUserOld(OUTPUT, INPUTS[index + OFFSET]);
            });

        })

    })

    describe("UserServices.exact()", () => {

        it("should fail on invalid username", async () => {

            const INVALID_USERNAME = "abra cadabra";

            try {
                await UserServices.exact(INVALID_USERNAME);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                    (`username: Missing User '${INVALID_USERNAME}'`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included children", async () => {

            const OUTPUTS = await UserServices.all({
                withAccessTokens: "",
                withRefreshTokens: "",
            });
            OUTPUTS.forEach(async OUTPUT => {
                const user = await UserServices.exact(OUTPUT.username);
                expect(user.accessTokens).to.exist;
                if (user.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(user.accessTokens.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length);
                } else {
                    expect(user.accessTokens.length).to.equal(0);
                }
                expect(user.refreshTokens).to.exist;
                if (user.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(user.refreshTokens.length).to.equal(SeedData.REFRESH_TOKENS_SUPERUSER.length);
                } else {
                    expect(user.refreshTokens.length).to.equal(0);
                }
            });

        })

        it("should pass on valid usernames", async () => {

            const INPUTS = await UserServices.all();

            INPUTS.forEach(async (INPUT) => {
                const OUTPUT = await UserServices.exact(INPUT.username);
                expect(OUTPUT.id).to.equal(INPUT.id);
            })

        })

    })

    describe("UserServices.find()", () => {

        it("should fail on invalid ID", async () => {

            try {
                await UserServices.find(INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                    (`userId: Missing User ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included children", async () => {

            const INPUTS = await UserServices.all({
                withAccessTokens: "",
                withRefreshTokens: "",
            });

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await UserServices.find(INPUT.id);
                expect(OUTPUT.accessTokens).to.exist;
                if (OUTPUT.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(OUTPUT.accessTokens.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length);
                } else {
                    expect(OUTPUT.accessTokens.length).to.equal(0);
                }
                expect(OUTPUT.refreshTokens).to.exist;
                if (OUTPUT.username === SeedData.USER_USERNAME_SUPERUSER) {
                    expect(OUTPUT.refreshTokens.length).to.equal(SeedData.REFRESH_TOKENS_SUPERUSER.length);
                } else {
                    expect(OUTPUT.refreshTokens.length).to.equal(0);
                }
            })

        })

        it("should pass on valid IDs", async () => {

            const INPUTS = await UserServices.all();

            INPUTS.forEach(async (INPUT) => {
                const OUTPUT = await UserServices.find(INPUT.id);
                expect(OUTPUT.id).to.equal(INPUT.id);
                expect(OUTPUT.password).to.equal("");
            })

        })

    })

    describe("UserServices.insert()", () => {

        it("should fail on duplicate username", async () => {

            const EXISTING = await UTILS.lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const INPUT = {
                name: "dummy",
                password: "dummy",
                scope: "dummy",
                username: EXISTING.username,
            };

            try {
                await UserServices.insert(INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include("is already in use");
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on invalid input data", async () => {

            const INPUT = {};

            try {
                await UserServices.insert(INPUT);
                expect.fail(`Should have thrown BadRequest`);
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include("Is required");
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid input data", async () => {

            const INPUT = {
                active: true,
                name: "Inserted User",
                password: "insertedpassword",
                scope: "superuser",
                username: "inserted",
            };

            const OUTPUT = await UserServices.insert(INPUT);
            compareUserNew(OUTPUT, INPUT);

            const FOUND = await UserServices.find(OUTPUT.id);
            compareUserOld(FOUND, OUTPUT);

        })

    })

    describe("UserServices.refreshTokens()", () => {

        it("should pass on active RefreshTokens", async () => {

            const NOW = new Date().getTime();
            const user = await UTILS.lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const refreshTokens = await UserServices.refreshTokens(user.id, {
                active: "",
            });

            expect(refreshTokens.length).to.be.lessThan(SeedData.ACCESS_TOKENS_SUPERUSER.length);
            refreshTokens.forEach(refreshToken => {
                expect(refreshToken.expires.getTime()).to.be.greaterThanOrEqual(NOW);
                expect(refreshToken.userId).to.equal(user.id);
            });

        })

        it("should pass on all RefreshTokens", async () => {

            const user = await UTILS.lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const refreshTokens = await UserServices.refreshTokens(user.id);

            expect(refreshTokens.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length);
            refreshTokens.forEach(refreshToken => {
                expect(refreshToken.userId).to.equal(user.id);
            });

        })

        it("should pass on paginated RefreshTokens", async () => {

            const LIMIT = 99;
            const OFFSET = 1;
            const user = await UTILS.lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const refreshTokens = await UserServices.refreshTokens(user.id, {
                limit: LIMIT,
                offset: OFFSET,
            });

            expect(refreshTokens.length).to.equal(SeedData.ACCESS_TOKENS_SUPERUSER.length - OFFSET);
            refreshTokens.forEach(refreshToken => {
                expect(refreshToken.userId).to.equal(user.id);
            });

        })

    })

    describe("UserServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            try {
                await UserServices.remove(INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                    (`userId: Missing User ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }
        })

        it("should pass on valid input", async () => {

            const INPUT = await UTILS.lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const OUTPUT = await UserServices.remove(INPUT.id);
            expect(OUTPUT.id).to.equal(INPUT.id);

            try {
                await UserServices.remove(INPUT.id);
                expect.fail(`Should have thrown NotFound after remove`);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`userId: Missing User ${INPUT.id}`);
                } else {
                    expect.fail(`Should have thrown NotFound`);
                }
            }

        })

    })

    describe("UserServices.update()", () => {
        it("should fail on duplicate username", async () => {

            const ORIGINAL = await UTILS.lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const INPUT = {
                active: ORIGINAL.active,
                name: ORIGINAL.name,
                scope: ORIGINAL.scope,
                username: SeedData.USER_USERNAME_FIRST_ADMIN,
            }

            try {
                await UserServices.update(ORIGINAL.id, INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include
                    (`username: Username '${INPUT.username}' is already in use`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on invalid ID", async () => {

            const ORIGINAL = await UTILS.lookupUser(SeedData.USER_USERNAME_SUPERUSER);
            const INPUT = {
                active: ORIGINAL.active,
                name: ORIGINAL.name,
            }

            try {
                await UserServices.update(INVALID_ID, INPUT);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                    (`userId: Missing User ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on on changes data", async () => {

            const INPUT = await UTILS.lookupUser(SeedData.USER_USERNAME_FIRST_REGULAR);

            const OUTPUT = await UserServices.update(INPUT.id, INPUT);
            compareUserOld(OUTPUT, INPUT);

        })

        it("should pass on no updates data", async () => {

            const ORIGINAL = await UTILS.lookupUser(SeedData.USER_USERNAME_SECOND_REGULAR);
            const INPUT: Partial<User> = {};

            const OUTPUT = await UserServices.update(ORIGINAL.id, INPUT);
            compareUserOld(OUTPUT, INPUT);
            const UPDATED = await UserServices.find(ORIGINAL.id);
            compareUserOld(UPDATED, OUTPUT);

        })

        it("should pass on valid updates data", async () => {

            const ORIGINAL = await UTILS.lookupUser(SeedData.USER_USERNAME_SECOND_ADMIN);
            const INPUT = {
                active: !ORIGINAL.active,
                scope: ORIGINAL.scope + " extra",
            }

            const OUTPUT = await UserServices.update(ORIGINAL.id, INPUT);
            compareUserOld(OUTPUT, INPUT);
            const UPDATED = await UserServices.find(ORIGINAL.id); // Pick up password redact
            compareUserOld(UPDATED, OUTPUT);

        })

    })

})

// Helper Objects ------------------------------------------------------------

export function compareUserNew(OUTPUT: Partial<User>, INPUT: Partial<User>) {
    expect(OUTPUT.id).to.exist;
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.name).to.equal(INPUT.name);
    expect(OUTPUT.password).to.equal(""); // Redacted
    expect(OUTPUT.scope).to.equal(INPUT.scope);
    expect(OUTPUT.username).to.equal(INPUT.username);
}

export function compareUserOld(OUTPUT: Partial<User>, INPUT: Partial<User>) {
    expect(OUTPUT.id).to.equal(INPUT.id ? INPUT.id : OUTPUT.id);
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : OUTPUT.active);
    expect(OUTPUT.name).to.equal(INPUT.name ? INPUT.name : OUTPUT.name);
    expect(OUTPUT.password).to.equal(""); // Redacted
    expect(OUTPUT.scope).to.equal(INPUT.scope ? INPUT.scope : OUTPUT.scope);
}
