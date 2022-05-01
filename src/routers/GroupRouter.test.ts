// GroupRouter.test ----------------------------------------------------------

// Functional tests for GroupRouter.

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

// Internal Modules ----------------------------------------------------------

import app from "./ExpressApplication";
import Group from "../models/Group";
import RouterUtils, {AUTHORIZATION} from "../test/RouterUtils";
import * as SeedData from "../test/SeedData";
import {CREATED, FORBIDDEN, NOT_FOUND, OK} from "../util/HttpErrors";

const UTILS = new RouterUtils();

// Test Specifications -------------------------------------------------------

describe("GroupRouter Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await UTILS.loadData({
            withGroups: true,
            withUsers: true,
        });
    })

    // Test Methods ----------------------------------------------------------

    describe("GroupRouter GET /api/groups/exact/:name", () => {

        const PATH = "/api/groups/exact/:name";

        it("should fail on invalid name", async () => {

            const INVALID_NAME = "Invalid Name";

            const response = await chai.request(app)
                .get(PATH.replace(":name", INVALID_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_ADMIN));
            expect(response).to.have.status(NOT_FOUND);
            expect(response).to.be.json;
            expect(response.body.message).to.include(`name: Missing Group '${INVALID_NAME}'`);

        })

        it("should fail on unauthenticated request", async () => {

            const response = await chai.request(app)
                .get(PATH.replace(":name", SeedData.GROUP_NAME_FIRST));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("No access token presented");

        })

        it("should pass on authenticated admin", async () => {

            const response = await chai.request(app)
                .get(PATH.replace(":name", SeedData.GROUP_NAME_FIRST))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_ADMIN));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(SeedData.GROUP_NAME_FIRST);

        })

        it("should pass on authenticated regular", async () => {

            const response = await chai.request(app)
                .get(PATH.replace(":name", SeedData.GROUP_NAME_SECOND))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_REGULAR));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(SeedData.GROUP_NAME_SECOND);

        })

        it("should pass on authenticated superuser", async () => {

            const response = await chai.request(app)
                .get(PATH.replace(":name", SeedData.GROUP_NAME_FIRST))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_SUPERUSER));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(SeedData.GROUP_NAME_FIRST);

        })

    })

    describe("GroupRouter GET /api/groups", async () => {

        const PATH = "/api/groups";

        it("should pass on authenticated request", async () => {

            const response = await chai.request(app)
                .get(PATH)
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_REGULAR));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            const OUTPUTS: Group[] = response.body;
            expect(OUTPUTS.length).to.equal(SeedData.GROUPS.length)

        })

        it("should pass on unauthenticated request", async () => {

            const response = await chai.request(app)
                .get(PATH);
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            const OUTPUTS: Group[] = response.body;
            expect(OUTPUTS.length).to.equal(SeedData.GROUPS.length)

        })

    })

    describe("GroupRouter POST /api/groups", () => {

        const PATH = "/api/groups";

        it("should fail on authenticated admin", async () => {

            const INPUT: Partial<Group> = {
                name: "Inserted Group",
                scope: "inserted",
            }

            const response = await chai.request(app)
                .post(PATH)
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_ADMIN))
                .send(INPUT);
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on authenticated regular", async () => {

            const INPUT: Partial<Group> = {
                name: "Inserted Group",
                scope: "inserted",
            }

            const response = await chai.request(app)
                .post(PATH)
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_REGULAR))
                .send(INPUT);
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on unauthenticated request", async () => {

            const INPUT: Partial<Group> = {
                name: "Inserted Group",
                scope: "inserted",
            }

            const response = await chai.request(app)
                .post(PATH)
                .send(INPUT);
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.equal("No access token presented");

        })

        it("should pass on authenticated superuser", async () => {

            const INPUT: Partial<Group> = {
                name: "Inserted Group",
                scope: "inserted",
            }

            const response = await chai.request(app)
                .post(PATH)
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_SUPERUSER))
                .send(INPUT);
            expect(response).to.have.status(CREATED);
            expect(response).to.be.json;
            compareLibraries(response.body, INPUT);

        })

    })

    describe("GroupRouter DELETE /api/groups/:groupId", () => {

        const PATH = "/api/groups/:groupId";

        it("should fail on authenticated admin", async () => {

            const INPUT = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);

            const response = await chai.request(app)
                .delete(PATH.replace(":groupId", "" + INPUT.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_ADMIN));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on authenticated regular", async () => {

            const INPUT = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);

            const response = await chai.request(app)
                .delete(PATH.replace(":groupId", "" + INPUT.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_ADMIN));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on unauthenticated request", async () => {

            const INPUT = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);

            const response = await chai.request(app)
                .delete(PATH.replace(":groupId", "" + INPUT.id));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.equal("No access token presented");

        })

        it("should pass on authenticated superuser", async () => {

            const INPUT = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);

            // Perform the remove
            const response1 = await chai.request(app)
                .delete(PATH.replace(":groupId", "" + INPUT.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_SUPERUSER));
            expect(response1).to.have.status(OK);
            const OUTPUT: Partial<Group> = response1.body;
            compareLibraries(OUTPUT, INPUT);

            // Verify that the remove was completed
            const response2 = await chai.request(app)
                .get(PATH.replace(":groupId", "" + INPUT.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_SUPERUSER));
            // Libraries are a special case - normally would just expect NOT_FOUND
            if ((response2.status !== FORBIDDEN) && (response2.status !== NOT_FOUND)) {
                expect.fail(`GET /api/groups/${INPUT.id} returns ${response2.status} instead of 403 or 404`);
            }

        })

    })

    describe("GroupRouter GET /api/groups/:groupId", () => {

        const PATH = "/api/groups/:groupId";

        it("should fail on the wrong admin user", async () => {

            const INPUT = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", "" + INPUT.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_ADMIN));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on the wrong regular user", async () => {

            const INPUT = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", "" + INPUT.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_REGULAR));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should pass on authenticated superuser", async () => { // TODO - SUPERUSER_SCOPE not set in tests ???

            const INPUT = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", "" + INPUT.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_SUPERUSER));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            compareLibraries(response.body, INPUT);

        })

        it("should pass on the right admin user", async () => {

            const INPUT = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", "" + INPUT.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_ADMIN));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            compareLibraries(response.body, INPUT);

        })

        it("should pass on the right regular user", async () => {

            const INPUT = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", "" + INPUT.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_REGULAR));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            compareLibraries(response.body, INPUT);

        })

    })

    describe("GroupRouter PUT /api/groups/:groupId", () => {

        const PATH = "/api/groups/:groupId";

        it("should fail on the right regular user", async () => {

            const ORIGINAL = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INPUT: Partial<Group> = {
                name: "Updated Name",
            }

            const response = await chai.request(app)
                .put(PATH.replace(":groupId", "" + ORIGINAL.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_REGULAR))
                .send(INPUT);
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on the wrong admin user", async () => {

            const ORIGINAL = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUT: Partial<Group> = {
                name: "Updated Name",
            }

            const response = await chai.request(app)
                .put(PATH.replace(":groupId", "" + ORIGINAL.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_ADMIN))
                .send(INPUT);
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should fail on the wrong regular user", async () => {

            const ORIGINAL = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUT: Partial<Group> = {
                name: "Updated Name",
            }

            const response = await chai.request(app)
                .put(PATH.replace(":groupId", "" + ORIGINAL.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_REGULAR))
                .send(INPUT);
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        })

        it("should pass on authenticated superuser", async () => { // TODO - SUPERUSER_SCOPE not set in tests ???

            const ORIGINAL = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INPUT: Partial<Group> = {
                name: "Updated Name",
            }

            const response = await chai.request(app)
                .put(PATH.replace(":groupId", "" + ORIGINAL.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_SUPERUSER))
                .send(INPUT);
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            compareLibraries(response.body, INPUT);

        })

        it("should pass on the right admin user", async () => {

            const ORIGINAL = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INPUT: Partial<Group> = {
                name: "Updated Name",
            }

            const response = await chai.request(app)
                .put(PATH.replace(":groupId", "" + ORIGINAL.id))
                .set(AUTHORIZATION, await UTILS.credentials(SeedData.USER_USERNAME_FIRST_ADMIN))
                .send(INPUT);
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            compareLibraries(response.body, INPUT);

        })

    })

/*
    describe("GroupRouter GET /api/groups/:groupId/authors", () => {
        // TODO
    })
*/

})

// Helper Methods ------------------------------------------------------------

const compareLibraries = (OUTPUT: Partial<Group>, INPUT: Partial<Group>) => {
    expect(OUTPUT.id).to.equal(INPUT.id ? INPUT.id : OUTPUT.id);
    expect(OUTPUT.active).to.equal(INPUT.active ? INPUT.active : OUTPUT.active);
    expect(OUTPUT.email).to.equal(INPUT.email ? INPUT.email : OUTPUT.email);
    expect(OUTPUT.name).to.equal(INPUT.name ? INPUT.name : OUTPUT.name);
    expect(OUTPUT.notes).to.equal(INPUT.notes ? INPUT.notes : OUTPUT.notes);
    expect(OUTPUT.scope).to.equal(INPUT.scope ? INPUT.scope : OUTPUT.scope);
}
