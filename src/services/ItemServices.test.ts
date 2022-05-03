// ItemServices.test ---------------------------------------------------------

// Functional tests for ItemServices.

// External Modules ----------------------------------------------------------

import chai from "chai";
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import ItemServices from "./ItemServices";
import Item from "../models/Item";
import * as SeedData from "../test/SeedData";
import ServicesUtils from "../test/ServicesUtils";
import {BadRequest, NotFound} from "../util/HttpErrors";

const UTILS = new ServicesUtils();
const INVALID_ID = UTILS.invalidId();

// Test Specifications -------------------------------------------------------

describe("ItemServices Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await UTILS.loadData({
            withCategories: true,
            withGroups: true,
            withItems: true,
        });
    });

    // Test Methods ----------------------------------------------------------

    describe("ItemServices.all()", () => {

        it("should pass on active Items", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const ITEMS = await ItemServices.all(GROUP.id, {
                active: "",
            });

            expect(ITEMS.length).to.be.lessThanOrEqual(SeedData.ITEMS.length);
            ITEMS.forEach(ITEM => {
                expect(ITEM.active).to.be.true;
                expect(ITEM.groupId).to.equal(GROUP.id);
            });

        });

        it("should pass on all Items", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const ITEMS = await ItemServices.all(GROUP.id);

            expect(ITEMS.length).to.equal(SeedData.ITEMS.length);
            ITEMS.forEach(ITEM => {
                expect(ITEM.groupId).to.equal(GROUP.id);
            });

        });

        it("should pass on included parents", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const ITEMS = await ItemServices.all(GROUP.id, {
                withCategory: "",
                withGroup: "",
            });

            expect(ITEMS.length).to.equal(SeedData.ITEMS.length);
            ITEMS.forEach(ITEM => {
                expect(ITEM.category).to.exist;
                expect(ITEM.category.groupId).to.equal(GROUP.id);
                expect(ITEM.group).to.exist;
                expect(ITEM.group.id).to.equal(GROUP.id);
            });

        });

        it("should pass on named Items", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const PATTERN = "Ir"; // Should match "Third";
            const INPUTS = await ItemServices.all(GROUP.id, { name: PATTERN });

            expect(INPUTS.length).to.be.greaterThan(0);
            INPUTS.forEach(INPUT => {
                expect(INPUT.name.toLowerCase()).to.include(PATTERN.toLowerCase());
            });

        });

        it("should pass on paginated Items", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const LIMIT = 99;
            const OFFSET = 1;
            const INPUTS = await ItemServices.all(GROUP.id);
            const OUTPUTS = await ItemServices.all(GROUP.id, {
                limit: LIMIT,
                offset: OFFSET,
            });

            expect(OUTPUTS.length).to.be.lessThanOrEqual(LIMIT);
            expect(OUTPUTS.length).to.equal(SeedData.ITEMS.length - OFFSET);
            OUTPUTS.forEach((OUTPUT, index) => {
                compareItemOld(OUTPUT, INPUTS[index + OFFSET]);
            });

        });


    });

    describe("ItemServices.exact()", () => {

        it("should fail on invalid name", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INVALID_NAME = "Invalid Item Name";

            try {
                await ItemServices.exact(GROUP.id, INVALID_NAME);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(`name: Missing Item '${INVALID_NAME}'`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on included parents", async () => {

            const GROUP= await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUTS = await ItemServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const name = INPUT.name ? INPUT.name : "foo";
                const result = await ItemServices.exact(GROUP.id, name, {
                    withCategory: "",
                    withGroup: "",
                });
                expect(result.category).to.exist;
                expect(result.category.groupId).to.equal(GROUP.id);
                expect(result.group).to.exist;
                expect(result.group.id).to.equal(GROUP.id);
            });

        });

        it("should pass on valid names", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const INPUTS = await ItemServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const name = INPUT.name ? INPUT.name : "foo";
                const result = await ItemServices.exact(GROUP.id, name);
                expect(result.name).to.equal(INPUT.name);
            });

        });

    });

    describe("ItemServices.find()", () => {

        it("should fail on invalid ID", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);

            try {
                await ItemServices.find(GROUP.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`itemId: Missing Item ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on included parents", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUTS = await ItemServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await ItemServices.find(GROUP.id, INPUT.id, {
                    withCategory: "",
                    withGroup: "",
                });
                expect(OUTPUT.category).to.exist;
                expect(OUTPUT.category.groupId).to.equal(GROUP.id);
                expect(OUTPUT.group).to.exist;
                expect(OUTPUT.group.id).to.equal(GROUP.id);
            });

        });

        it("should pass on valid IDs", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const INPUTS = await ItemServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await ItemServices.find(GROUP.id, INPUT.id);
                compareItemOld(OUTPUT, INPUT);
            });

        });

    });

    describe("ItemServices.insert()", () => {

        it("should fail on duplicate data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INPUTS = await ItemServices.all(GROUP.id);
            const INPUT = {
                name: INPUTS[0].name,
            };

            try {
                await ItemServices.insert(GROUP.id, INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(`name: Name '${INPUT.name}' is already in use`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should fail on missing data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUT = {};

            try {
                await ItemServices.insert(GROUP.id, INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include("name: Is required");
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on valid data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const CATEGORY = await UTILS.lookupCategory(GROUP, SeedData.CATEGORY_NAME_FIRST);
            const INPUT = {
                active: false,
                categoryId: CATEGORY.id,
                name: "Valid Name",
                notes: "This is a note",
            }

            const OUTPUT = await ItemServices.insert(GROUP.id, INPUT);
            compareItemNew(OUTPUT, INPUT);

        });

    });

    describe("ItemServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);

            try {
                await ItemServices.remove(GROUP.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`itemId: Missing Item ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on valid ID", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const ITEMS = await ItemServices.all(GROUP.id);
            const VALID_ID = ITEMS[0].id;

            const OUTPUT = await ItemServices.remove(GROUP.id, VALID_ID);
            expect(OUTPUT.id).to.equal(VALID_ID);

            try {
                await ItemServices.remove(GROUP.id, VALID_ID);
                expect.fail("Should have thrown NotFound after remove");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`itemId: Missing Item ${VALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

    });

    describe("ItemServices.update()", () => {

        it("should fail on duplicate data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const ITEMS = await ItemServices.all(GROUP.id);
            const INPUT = {
                name: ITEMS[0].name,
            }

            try {
                await ItemServices.update(GROUP.id, ITEMS[1].id, INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include(`name: Name '${INPUT.name}' is already in use`);
                } else {
                    expect.fail(`Should not have thrown ${error}'`);
                }
            }

        });

        it("should fail on invalid ID", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUT = {};

            try {
                await ItemServices.update(GROUP.id, INVALID_ID, INPUT);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`itemId: Missing Item ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on no changes data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const ITEMS = await ItemServices.all(GROUP.id);
            const INPUT = ITEMS[0];

            const OUTPUT = await ItemServices.update(GROUP.id, INPUT.id, INPUT);
            compareItemOld(OUTPUT, INPUT);
            const UPDATED = await ItemServices.find(GROUP.id, INPUT.id);
            compareItemOld(UPDATED, OUTPUT);

        });

        it("should pass on no updates data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const ITEMS = await ItemServices.all(GROUP.id);
            const INPUT = { };
            const VALID_ID = ITEMS[0].id;

            const OUTPUT = await ItemServices.update(GROUP.id, VALID_ID, INPUT);
            compareItemOld(OUTPUT, INPUT);
            const UPDATED = await ItemServices.find(GROUP.id, VALID_ID);
            compareItemOld(UPDATED, OUTPUT);

        });

        it("should pass on valid updates data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const ITEMS = await ItemServices.all(GROUP.id);
            const INPUT = {
                name: "New Name",
                notes: "New Notes",
                theme: "orange",
            }
            const VALID_ID = ITEMS[0].id;

            const OUTPUT = await ItemServices.update(GROUP.id, VALID_ID, INPUT);
            compareItemOld(OUTPUT, INPUT);
            const UPDATED = await ItemServices.find(GROUP.id, VALID_ID);
            compareItemOld(UPDATED, OUTPUT);

        });

    });

});

// Helper Objects ------------------------------------------------------------

export function compareItemNew(OUTPUT: Partial<Item>, INPUT: Partial<Item>) {
    expect(OUTPUT.id).to.exist;
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.categoryId).to.equal(INPUT.categoryId ? INPUT.categoryId : OUTPUT.categoryId);
    expect(OUTPUT.groupId).to.equal(INPUT.groupId ? INPUT.groupId : OUTPUT.groupId);
    expect(OUTPUT.name).to.equal(INPUT.name);
    expect(OUTPUT.notes).to.equal(INPUT.notes ? INPUT.notes : null);
    expect(OUTPUT.theme).to.equal(INPUT.theme ? INPUT.theme : null);
}

export function compareItemOld(OUTPUT: Partial<Item>, INPUT: Partial<Item>) {
    expect(OUTPUT.id).to.equal(INPUT.id ? INPUT.id : OUTPUT.id);
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.categoryId).to.equal(INPUT.categoryId ? INPUT.categoryId : OUTPUT.categoryId);
    expect(OUTPUT.groupId).to.equal(INPUT.groupId ? INPUT.groupId : OUTPUT.groupId);
    expect(OUTPUT.name).to.equal(INPUT.name ? INPUT.name : OUTPUT.name);
    expect(OUTPUT.notes).to.equal(INPUT.notes ? INPUT.notes : OUTPUT.notes);
    expect(OUTPUT.theme).to.equal(INPUT.theme ? INPUT.theme : OUTPUT.theme);
}
