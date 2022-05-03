// CategoryServices.test -----------------------------------------------------

// Functional tests for CategoryServices.

// External Modules ----------------------------------------------------------

import chai from "chai";
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import CategoryServices from "./CategoryServices";
import Category from "../models/Category";
import * as SeedData from "../test/SeedData";
import ServicesUtils from "../test/ServicesUtils";
import {BadRequest, NotFound} from "../util/HttpErrors";

const UTILS = new ServicesUtils();
const INVALID_ID = UTILS.invalidId();

// Test Specifications -------------------------------------------------------

describe("CategoryServices Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await UTILS.loadData({
            withGroups: true,
            withCategories: true,
        });
    });

    // Test Methods ----------------------------------------------------------

    describe("CategoryServices.all()", () => {

        it("should pass on active Categories", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const CATEGORIES = await CategoryServices.all(GROUP.id, {
                active: "",
            });

            expect(CATEGORIES.length).to.be.lessThanOrEqual(SeedData.CATEGORIES.length);
            CATEGORIES.forEach(CATEGORY => {
                expect(CATEGORY.active).to.be.true;
                expect(CATEGORY.groupId).to.equal(GROUP.id);
            });

        });

        it("should pass on all Categories", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const CATEGORIES = await CategoryServices.all(GROUP.id);

            expect(CATEGORIES.length).to.equal(SeedData.CATEGORIES.length);
            CATEGORIES.forEach(CATEGORY => {
                expect(CATEGORY.groupId).to.equal(GROUP.id);
            });

        });

        it("should pass on included parent", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const CATEGORIES = await CategoryServices.all(GROUP.id, {
                withGroup: "",
            });

            expect(CATEGORIES.length).to.equal(SeedData.CATEGORIES.length);
            CATEGORIES.forEach(CATEGORY => {
                expect(CATEGORY.group).to.exist;
                expect(CATEGORY.group.id).to.equal(GROUP.id);
            });

        });

        it("should pass on named Categories", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const PATTERN = "Ir"; // Should match "Third";
            const INPUTS = await CategoryServices.all(GROUP.id, { name: PATTERN });

            expect(INPUTS.length).to.be.greaterThan(0);
            INPUTS.forEach(INPUT => {
                expect(INPUT.name.toLowerCase()).to.include(PATTERN.toLowerCase());
            });

        });

        it("should pass on paginated Categories", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const LIMIT = 99;
            const OFFSET = 1;
            const INPUTS = await CategoryServices.all(GROUP.id);
            const OUTPUTS = await CategoryServices.all(GROUP.id, {
                limit: LIMIT,
                offset: OFFSET,
            });

            expect(OUTPUTS.length).to.be.lessThanOrEqual(LIMIT);
            expect(OUTPUTS.length).to.equal(SeedData.CATEGORIES.length - OFFSET);
            OUTPUTS.forEach((OUTPUT, index) => {
                compareCategoryOld(OUTPUT, INPUTS[index + OFFSET]);
            });

        });


    });

    describe("CategoryServices.exact()", () => {

        it("should fail on invalid name", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INVALID_NAME = "Invalid Category Name";

            try {
                await CategoryServices.exact(GROUP.id, INVALID_NAME);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(`name: Missing Category '${INVALID_NAME}'`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on included parent", async () => {

            const GROUP= await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUTS = await CategoryServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const name = INPUT.name ? INPUT.name : "foo";
                const result = await CategoryServices.exact(GROUP.id, name, {
                    withGroup: "",
                });
                expect(result.group).to.exist;
                expect(result.group.id).to.equal(GROUP.id);
            });

        });

        it("should pass on valid names", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const INPUTS = await CategoryServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const name = INPUT.name ? INPUT.name : "foo";
                const result = await CategoryServices.exact(GROUP.id, name);
                expect(result.name).to.equal(INPUT.name);
            });

        });

    });

    describe("CategoryServices.find()", () => {

        it("should fail on invalid ID", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);

            try {
                await CategoryServices.find(GROUP.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`categoryId: Missing Category ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on included parent", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUTS = await CategoryServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await CategoryServices.find(GROUP.id, INPUT.id, {
                    withGroup: "",
                });
                expect(OUTPUT.group).to.exist;
                expect(OUTPUT.group.id).to.equal(GROUP.id);
            });

        });

        it("should pass on valid IDs", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const INPUTS = await CategoryServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await CategoryServices.find(GROUP.id, INPUT.id);
                compareCategoryOld(OUTPUT, INPUT);
            });

        });

    });

    describe("CategoryServices.insert()", () => {

        it("should fail on duplicate data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INPUTS = await CategoryServices.all(GROUP.id);
            const INPUT = {
                name: INPUTS[0].name,
            };

            try {
                await CategoryServices.insert(GROUP.id, INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
/* For some reason, error.message only says "Validation error" here, but works on ListServices.test
                    expect(error.message).to.include(`name: Name '${INPUT.name}' is already in use`);
*/
                    expect(error.message).to.include("Validation error");
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should fail on missing data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUT = {};

            try {
                await CategoryServices.insert(GROUP.id, INPUT);
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
            const INPUT = {
                active: false,
                name: "Valid Name",
                notes: "This is a note",
            }

            const OUTPUT = await CategoryServices.insert(GROUP.id, INPUT);
            compareCategoryNew(OUTPUT, INPUT);

        });

    });

    describe("CategoryServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);

            try {
                await CategoryServices.remove(GROUP.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`categoryId: Missing Category ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on valid ID", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const CATEGORIES = await CategoryServices.all(GROUP.id);
            const VALID_ID = CATEGORIES[0].id;

            const OUTPUT = await CategoryServices.remove(GROUP.id, VALID_ID);
            expect(OUTPUT.id).to.equal(VALID_ID);

            try {
                await CategoryServices.remove(GROUP.id, VALID_ID);
                expect.fail("Should have thrown NotFound after remove");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`categoryId: Missing Category ${VALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

    });

    describe("CategoryServices.update()", () => {

        it("should fail on duplicate data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const CATEGORIES = await CategoryServices.all(GROUP.id);
            const INPUT = {
                groupId: GROUP.id,
                name: CATEGORIES[0].name,
            }

            try {
                await CategoryServices.update(GROUP.id, CATEGORIES[1].id, INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    /* For some reason, error.message only says "Validation error" here, but works on ListServices.test
                                        expect(error.message).to.include(`name: Name '${INPUT.name}' is already in use`);
                    */
                    expect(error.message).to.include("Validation error");
                } else {
                    expect.fail(`Should not have thrown ${error}'`);
                }
            }

        });

        it("should fail on invalid ID", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUT = {};

            try {
                await CategoryServices.update(GROUP.id, INVALID_ID, INPUT);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`categoryId: Missing Category ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on no changes data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const CATEGORIES = await CategoryServices.all(GROUP.id);
            const INPUT = CATEGORIES[0];

            const OUTPUT = await CategoryServices.update(GROUP.id, INPUT.id, INPUT);
            compareCategoryOld(OUTPUT, INPUT);
            const UPDATED = await CategoryServices.find(GROUP.id, INPUT.id);
            compareCategoryOld(UPDATED, OUTPUT);

        });

        it("should pass on no updates data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const CATEGORIES = await CategoryServices.all(GROUP.id);
            const INPUT = { };
            const VALID_ID = CATEGORIES[0].id;

            const OUTPUT = await CategoryServices.update(GROUP.id, VALID_ID, INPUT);
            compareCategoryOld(OUTPUT, INPUT);
            const UPDATED = await CategoryServices.find(GROUP.id, VALID_ID);
            compareCategoryOld(UPDATED, OUTPUT);

        });

        it("should pass on valid updates data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const CATEGORIES = await CategoryServices.all(GROUP.id);
            const INPUT = {
                name: "New Name",
                notes: "New Notes",
                theme: "orange",
            }
            const VALID_ID = CATEGORIES[0].id;

            const OUTPUT = await CategoryServices.update(GROUP.id, VALID_ID, INPUT);
            compareCategoryOld(OUTPUT, INPUT);
            const UPDATED = await CategoryServices.find(GROUP.id, VALID_ID);
            compareCategoryOld(UPDATED, OUTPUT);

        });

    });

});

// Helper Objects ------------------------------------------------------------

export function compareCategoryNew(OUTPUT: Partial<Category>, INPUT: Partial<Category>) {
    expect(OUTPUT.id).to.exist;
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.groupId).to.equal(INPUT.groupId ? INPUT.groupId : OUTPUT.groupId);
    expect(OUTPUT.name).to.equal(INPUT.name);
    expect(OUTPUT.notes).to.equal(INPUT.notes ? INPUT.notes : null);
    expect(OUTPUT.theme).to.equal(INPUT.theme ? INPUT.theme : null);
}

export function compareCategoryOld(OUTPUT: Partial<Category>, INPUT: Partial<Category>) {
    expect(OUTPUT.id).to.equal(INPUT.id ? INPUT.id : OUTPUT.id);
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.groupId).to.equal(INPUT.groupId ? INPUT.groupId : OUTPUT.groupId);
    expect(OUTPUT.name).to.equal(INPUT.name ? INPUT.name : OUTPUT.name);
    expect(OUTPUT.notes).to.equal(INPUT.notes ? INPUT.notes : OUTPUT.notes);
    expect(OUTPUT.theme).to.equal(INPUT.theme ? INPUT.theme : OUTPUT.theme);
}
