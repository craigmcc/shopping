// ItemRouter.test -----------------------------------------------------------

// Functional tests for ItemRouter.

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

// Internal Modules ----------------------------------------------------------

import app from "./ExpressApplication";
import Item from "../models/Item";
import ItemServices from "../services/ItemServices";
import RouterUtils, {AUTHORIZATION} from "../test/RouterUtils";
import * as SeedData from "../test/SeedData";
import {CREATED, FORBIDDEN, NOT_FOUND, OK} from "../util/HttpErrors";

const UTILS = new RouterUtils();

// Test Specifications -------------------------------------------------------

describe("ItemRouter Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await UTILS.loadData({
            withCategories: true,
            withGroups: true,
            withItems: true,
            withUsers: true,
        });
    });

    // Test Methods ----------------------------------------------------------

    describe("ItemRouter GET /api/items/:groupId/exact/:name", () => {

        const PATH = "/api/items/:groupId/exact/:name";

        it("should fail on incorrect group user", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_ADMIN;
            const ITEM_NAME = SeedData.ITEM_NAME_SECOND;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", ITEM_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        });

        it("should fail on invalid name", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const ITEM_NAME = "Invalid Name";

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", ITEM_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(NOT_FOUND);
            expect(response).to.be.json;
            expect(response.body.message).to.include(`name: Missing Item '${ITEM_NAME}'`);

        });

        it("should fail on unauthenticated request", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const ITEM_NAME = SeedData.ITEM_NAME_SECOND;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", ITEM_NAME));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("No access token presented");

        });

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const ITEM_NAME = SeedData.ITEM_NAME_THIRD;
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_ADMIN;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", ITEM_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(ITEM_NAME);

        });

        it("should pass on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const ITEM_NAME = SeedData.ITEM_NAME_THIRD;
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_REGULAR;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", ITEM_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(ITEM_NAME);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const ITEM_NAME = SeedData.ITEM_NAME_THIRD;
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":name", ITEM_NAME))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.name).to.equal(ITEM_NAME);

        });

    });

    describe("ItemRouter GET /api/items/:groupId", () => {

        const PATH = "/api/items/:groupId";

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_ADMIN;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            const OUTPUTS: Item[] = response.body;
            expect(OUTPUTS.length).to.equal(SeedData.ITEMS.length);

        });

        it("should pass on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            const OUTPUTS: Item[] = response.body;
            expect(OUTPUTS.length).to.equal(SeedData.ITEMS.length);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            const OUTPUTS: Item[] = response.body;
            expect(OUTPUTS.length).to.equal(SeedData.ITEMS.length);

        });

    });

    describe("ItemRouter POST /api/items/:groupId", () => {

        const PATH = "/api/items/:groupId";

        it("should fail on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const INPUT = {
                name: "Inserted Item",
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
            const CATEGORY = await UTILS.lookupCategory(GROUP, SeedData.CATEGORY_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_ADMIN;
            const INPUT = {
                categoryId: CATEGORY.id,
                name: "Inserted Item",
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
            const CATEGORY = await UTILS.lookupCategory(GROUP, SeedData.CATEGORY_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;
            const INPUT = {
                categoryId: CATEGORY.id,
                name: "Inserted Item",
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

    describe("ItemRouter DELETE /api/items/:groupId/:itemId", () => {

        const PATH = "/api/items/:groupId/:itemId";

        it("should fail on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const INPUTS = await ItemServices.all(GROUP.id);
            const ITEM_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .delete(PATH.replace(":groupId", GROUP.id)
                    .replace(":itemId", ITEM_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        });

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_ADMIN;
            const INPUTS = await ItemServices.all(GROUP.id);
            const ITEM_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .delete(PATH.replace(":groupId", GROUP.id)
                    .replace(":itemId", ITEM_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(ITEM_ID);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;
            const INPUTS = await ItemServices.all(GROUP.id);
            const ITEM_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .delete(PATH.replace(":groupId", GROUP.id)
                    .replace(":itemId", ITEM_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(ITEM_ID);

        });

    });

    describe("ItemRouter GET /api/items/:groupId/:itemId", () => {

        const PATH = "/api/items/:groupId/:itemId";

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_ADMIN;
            const INPUTS = await ItemServices.all(GROUP.id);
            const ITEM_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":itemId", ITEM_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(ITEM_ID);

        });

        it("should pass on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const INPUTS = await ItemServices.all(GROUP.id);
            const ITEM_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":itemId", ITEM_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(ITEM_ID);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;
            const INPUTS = await ItemServices.all(GROUP.id);
            const ITEM_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .get(PATH.replace(":groupId", GROUP.id)
                    .replace(":itemId", ITEM_ID))
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(ITEM_ID);

        });

    });

    describe("ItemRouter PUT /api/items/:groupId/:itemId", () => {

        const PATH = "/api/items/:groupId/:itemId";

        it("should fail on authenticated regular", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const USER_USERNAME = SeedData.USER_USERNAME_THIRD_REGULAR;
            const INPUTS = await ItemServices.all(GROUP.id);
            const INPUT = INPUTS[0];
            const ITEM_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .put(PATH.replace(":groupId", GROUP.id)
                    .replace(":itemId", ITEM_ID), INPUT)
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(FORBIDDEN);
            expect(response).to.be.json;
            expect(response.body.message).to.include("Required scope not authorized");

        });

        it("should pass on authenticated admin", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const USER_USERNAME = SeedData.USER_USERNAME_FIRST_ADMIN;
            const INPUTS = await ItemServices.all(GROUP.id);
            const INPUT = INPUTS[0];
            const ITEM_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .put(PATH.replace(":groupId", GROUP.id)
                    .replace(":itemId", ITEM_ID), INPUT)
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(ITEM_ID);

        });

        it("should pass on authenticated superuser", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const USER_USERNAME = SeedData.USER_USERNAME_SUPERUSER;
            const INPUTS = await ItemServices.all(GROUP.id);
            const INPUT = INPUTS[0];
            const ITEM_ID = INPUTS[0].id;

            const response = await chai.request(app)
                .put(PATH.replace(":groupId", GROUP.id)
                    .replace(":itemId", ITEM_ID), INPUT)
                .set(AUTHORIZATION, await UTILS.credentials(USER_USERNAME));
            expect(response).to.have.status(OK);
            expect(response).to.be.json;
            expect(response.body.id).to.equal(ITEM_ID);

        });

    });

});
