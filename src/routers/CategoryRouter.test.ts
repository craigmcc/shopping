// CategoryRouter.test -----------------------------------------------------------

// Functional tests for CategoryRouter.

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

// Internal Modules ----------------------------------------------------------

import app from "./ExpressApplication";
import Category from "../models/Category";
import CategoryServices from "../services/CategoryServices";
import RouterUtils, {AUTHORIZATION} from "../test/RouterUtils";
import * as SeedData from "../test/SeedData";
import {CREATED, FORBIDDEN, NOT_FOUND, OK} from "../util/HttpErrors";

const UTILS = new RouterUtils();

// Test Specifications -------------------------------------------------------

describe("CategoryRouter Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await UTILS.loadData({
            withGroups: true,
            withCategories: true,
            withUsers: true,
        });
    });

    // Test Methods ----------------------------------------------------------

    describe("CategoryRouter GET /api/categories/:groupId/exact/:name", () => {

        const PATH = "/api/categories/:groupId/exact/:name";

        it("should fail on incorrect group user", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_ADMIN;
            const CATEGORY_NAME = SeedData.CATEGORY_NAME_SECOND;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", CATEGORY_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        });

        it("should fail on invalid name", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const CATEGORY_NAME = "Invalid Name";

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", CATEGORY_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(NOT_FOUND);
            expect(response).to.be.json;
            expect(response.body.message).to.include(`name: Missing Category '${CATEGORY_NAME}'`);

        });

        it("should fail on unauthenticated request", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const CATEGORY_NAME = SeedData.CATEGORY_NAME_SECOND;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", CATEGORY_NAME));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("No access token presented");

        });

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const CATEGORY_NAME = SeedData.CATEGORY_NAME_THIRD;
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_ADMIN;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", CATEGORY_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(CATEGORY_NAME);

        });

        it("should pass on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const CATEGORY_NAME = SeedData.CATEGORY_NAME_THIRD;
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_REGULAR;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", CATEGORY_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(CATEGORY_NAME);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const CATEGORY_NAME = SeedData.CATEGORY_NAME_THIRD;
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", CATEGORY_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(CATEGORY_NAME);

        });

    });

    describe("CategoryRouter GET /api/categories/:groupId", () => {

        const PATH = "/api/categories/:groupId";

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_ADMIN;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            const OUTPUTS: Category[] = response.body;
            expect(OUTPUTS.length).to.equal(SeedData.CATEGORIES.length);

        });

        it("should pass on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            const OUTPUTS: Category[] = response.body;
            expect(OUTPUTS.length).to.equal(SeedData.CATEGORIES.length);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            const OUTPUTS: Category[] = response.body;
            expect(OUTPUTS.length).to.equal(SeedData.CATEGORIES.length);

        });

    });

    describe("CategoryRouter POST /api/categories/:groupId", () => {

        const PATH = "/api/categories/:groupId";

        it("should fail on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const INPUT = {
                name: "Inserted Category",
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
                name: "Inserted Category",
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
                name: "Inserted Category",
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

    describe("CategoryRouter DELETE /api/categories/:groupId/:listId", () => {

        const PATH = "/api/categories/:groupId/:listId";

        it("should fail on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const INPUTS = await CategoryServices.all(GROUP.id);
            const CATEGORY_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .delete(PATH.replace(":groupId", GROUP.id)
                    .replace(":listId", CATEGORY_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        });

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_ADMIN;
            const INPUTS = await CategoryServices.all(GROUP.id);
            const CATEGORY_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .delete(PATH.replace(":groupId", GROUP.id)
                    .replace(":listId", CATEGORY_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(CATEGORY_ID);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;
            const INPUTS = await CategoryServices.all(GROUP.id);
            const CATEGORY_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .delete(PATH.replace(":groupId", GROUP.id)
                    .replace(":listId", CATEGORY_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(CATEGORY_ID);

        });

    });

    describe("CategoryRouter GET /api/categories/:groupId/:listId", () => {

        const PATH = "/api/categories/:groupId/:listId";

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_ADMIN;
            const INPUTS = await CategoryServices.all(GROUP.id);
            const CATEGORY_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":listId", CATEGORY_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(CATEGORY_ID);

        });

        it("should pass on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const INPUTS = await CategoryServices.all(GROUP.id);
            const CATEGORY_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":listId", CATEGORY_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(CATEGORY_ID);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;
            const INPUTS = await CategoryServices.all(GROUP.id);
            const CATEGORY_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":listId", CATEGORY_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(CATEGORY_ID);

        });

    });

    describe("CategoryRouter PUT /api/categories/:groupId/:listId", () => {

        const PATH = "/api/categories/:groupId/:listId";

        it("should fail on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const INPUTS = await CategoryServices.all(GROUP.id);
            const INPUT = INPUTS[0];
            const CATEGORY_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .put(PATH.replace(":groupId", GROUP.id)
                    .replace(":listId", CATEGORY_ID), INPUT)
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        });

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_ADMIN;
            const INPUTS = await CategoryServices.all(GROUP.id);
            const INPUT = INPUTS[0];
            const CATEGORY_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .put(PATH.replace(":groupId", GROUP.id)
                    .replace(":listId", CATEGORY_ID), INPUT)
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(CATEGORY_ID);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;
            const INPUTS = await CategoryServices.all(GROUP.id);
            const INPUT = INPUTS[0];
            const CATEGORY_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .put(PATH.replace(":groupId", GROUP.id)
                    .replace(":listId", CATEGORY_ID), INPUT)
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(CATEGORY_ID);

        });

    });

});
