// ListRouter.test -----------------------------------------------------------

// Functional tests for ListRouter.

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

// Internal Modules ----------------------------------------------------------

import app from "./ExpressApplication";
import List from "../models/List";
import RouterUtils, {AUTHORIZATION} from "../test/RouterUtils";
import * as SeedData from "../test/SeedData";
import {CREATED, FORBIDDEN, NOT_FOUND, OK} from "../util/HttpErrors";

const UTILS = new RouterUtils();

// Test Specifications -------------------------------------------------------

describe("ListRouter Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await UTILS.loadData({
            withGroups: true,
            withLists: true,
            withUsers: true,
        });
    });

    // Test Methods ----------------------------------------------------------

    describe("ListRouter GET /api/lists/:groupId/exact/:name", () => {

        const PATH = "/api/lists/:groupId/exact/:name";

        it("should fail on incorrect group user", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_ADMIN;
            const LIST_NAME = SeedData.LIST_NAME_SECOND;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", LIST_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        });

        it("should fail on invalid name", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const LIST_NAME = "Invalid Name";

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", LIST_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(NOT_FOUND);
            expect(response).to.be.json;
            expect(response.body.message).to.include(`name: Missing List '${LIST_NAME}'`);

        });

        it("should fail on unauthenticated request", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const LIST_NAME = SeedData.LIST_NAME_SECOND;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", LIST_NAME));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("No access token presented");

        });

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const LIST_NAME = SeedData.LIST_NAME_THIRD;
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_ADMIN;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", LIST_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(LIST_NAME);

        });

        it("should pass on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const LIST_NAME = SeedData.LIST_NAME_THIRD;
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_REGULAR;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", LIST_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(LIST_NAME);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const LIST_NAME = SeedData.LIST_NAME_THIRD;
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", LIST_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(LIST_NAME);

        });

    });

    describe("ListRouter GET /api/lists/:groupId", () => {

        const PATH = "/api/lists/:groupId";

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_ADMIN;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            const OUTPUTS: List[] = response.body;
            expect(OUTPUTS.length).to.equal(SeedData.LISTS.length);

        });

        it("should pass on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            const OUTPUTS: List[] = response.body;
            expect(OUTPUTS.length).to.equal(SeedData.LISTS.length);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            const OUTPUTS: List[] = response.body;
            expect(OUTPUTS.length).to.equal(SeedData.LISTS.length);

        });

    });

    describe("ListRouter POST /api/lists/:groupId", () => {

        const PATH = "/api/lists/:groupId";

        it("should fail on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const INPUT = {
                name: "Inserted List",
            }

            const response = await chai.request(app)
                .post(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME))
                .send(INPUT);
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        });

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_ADMIN;
            const INPUT = {
                name: "Inserted List",
            }

            const response = await chai.request(app)
                .post(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME))
                .send(INPUT);
            expect(response).to.have.status(CREATED);
            expect(response).to.be.json;
            expect(response.body.id).to.exist;
            expect(response.body.name).to.equal(INPUT.name);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;
            const INPUT = {
                name: "Inserted List",
            }

            const response = await chai.request(app)
                .post(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME))
                .send(INPUT);
            expect(response).to.have.status(CREATED);
            expect(response).to.be.json;
            expect(response.body.id).to.exist;
            expect(response.body.name).to.equal(INPUT.name);

        });

    });

});
