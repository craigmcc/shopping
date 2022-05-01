// ListServices.test ---------------------------------------------------------

// Functional tests for ListServices.

// External Modules ----------------------------------------------------------

import chai from "chai";
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import ListServices from "./ListServices";
import List from "../models/List";
import * as SeedData from "../test/SeedData";
import ServicesUtils from "../test/ServicesUtils";
import {BadRequest, NotFound} from "../util/HttpErrors";

const UTILS = new ServicesUtils();
const INVALID_ID = UTILS.invalidId();

// Test Specifications -------------------------------------------------------

describe("ListServices Functional Tests", () => {

    // Test Hooks ------------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await UTILS.loadData({
            withGroups: true,
            withLists: true,
        });
    });

    // Test Methods ----------------------------------------------------------

    describe("ListServices.all()", () => {

        it("should pass on active Lists", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const LISTS = await ListServices.all(GROUP.id, {
                active: "",
            });

            expect(LISTS.length).to.be.lessThanOrEqual(SeedData.LISTS.length);
            LISTS.forEach(LIST => {
                expect(LIST.active).to.be.true;
                expect(LIST.groupId).to.equal(GROUP.id);
            });

        });

        it("should pass on all Lists", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const LISTS = await ListServices.all(GROUP.id);

            expect(LISTS.length).to.equal(SeedData.LISTS.length);
            LISTS.forEach(LIST => {
                expect(LIST.groupId).to.equal(GROUP.id);
            });

        });

        it("should pass on included parent", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const LISTS = await ListServices.all(GROUP.id, {
                withGroup: "",
            });

            expect(LISTS.length).to.equal(SeedData.LISTS.length);
            LISTS.forEach(LIST => {
                expect(LIST.group).to.exist;
                expect(LIST.group.id).to.equal(GROUP.id);
            });

        });

        it("should pass on named Lists", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const PATTERN = "Ir"; // Should match "Third";
            const INPUTS = await ListServices.all(GROUP.id, { name: PATTERN });

            expect(INPUTS.length).to.be.greaterThan(0);
            INPUTS.forEach(INPUT => {
                expect(INPUT.name.toLowerCase()).to.include(PATTERN.toLowerCase());
            });

        });

        it("should pass on paginated Lists", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const LIMIT = 99;
            const OFFSET = 1;
            const INPUTS = await ListServices.all(GROUP.id);
            const OUTPUTS = await ListServices.all(GROUP.id, {
                limit: LIMIT,
                offset: OFFSET,
            });

            expect(OUTPUTS.length).to.be.lessThanOrEqual(LIMIT);
            expect(OUTPUTS.length).to.equal(SeedData.LISTS.length - OFFSET);
            OUTPUTS.forEach((OUTPUT, index) => {
                compareListOld(OUTPUT, INPUTS[index + OFFSET]);
            });

        });


    });

    describe("ListServices.exact()", () => {

        it("should fail on invalid name", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INVALID_NAME = "Invalid List Name";

            try {
                await ListServices.exact(GROUP.id, INVALID_NAME);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(`name: Missing List '${INVALID_NAME}'`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on included parent", async () => {

            const GROUP= await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUTS = await ListServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const name = INPUT.name ? INPUT.name : "foo";
                const result = await ListServices.exact(GROUP.id, name, {
                    withGroup: "",
                });
                expect(result.group).to.exist;
                expect(result.group.id).to.equal(GROUP.id);
            });

        });

        it("should pass on valid names", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const INPUTS = await ListServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const name = INPUT.name ? INPUT.name : "foo";
                const result = await ListServices.exact(GROUP.id, name);
                expect(result.name).to.equal(INPUT.name);
            });

        });

    });

    describe("ListServices.find()", () => {

        it("should fail on invalid ID", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);

            try {
                await ListServices.find(GROUP.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`listId: Missing List ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on included parent", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const INPUTS = await ListServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await ListServices.find(GROUP.id, INPUT.id, {
                    withGroup: "",
                });
                expect(OUTPUT.group).to.exist;
                expect(OUTPUT.group.id).to.equal(GROUP.id);
            });

        });

        it("should pass on valid IDs", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const INPUTS = await ListServices.all(GROUP.id);

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await ListServices.find(GROUP.id, INPUT.id);
                compareListOld(OUTPUT, INPUT);
            });

        });

    });

    describe("ListServices.insert()", () => {

        it("should fail on duplicate data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INPUTS = await ListServices.all(GROUP.id);
            const INPUT = {
                name: INPUTS[0].name,
            };

            try {
                await ListServices.insert(GROUP.id, INPUT);
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
                await ListServices.insert(GROUP.id, INPUT);
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

            const OUTPUT = await ListServices.insert(GROUP.id, INPUT);
            compareListNew(OUTPUT, INPUT);

        });

    });

    describe("ListServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);

            try {
                await ListServices.remove(GROUP.id, INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`listId: Missing List ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on valid ID", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const LISTS = await ListServices.all(GROUP.id);
            const VALID_ID = LISTS[0].id;

            const OUTPUT = await ListServices.remove(GROUP.id, VALID_ID);
            expect(OUTPUT.id).to.equal(VALID_ID);

            try {
                await ListServices.remove(GROUP.id, VALID_ID);
                expect.fail("Should have thrown NotFound after remove");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`listId: Missing List ${VALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

    });

    describe("ListServices.update()", () => {

        it("should fail on duplicate data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const LISTS = await ListServices.all(GROUP.id);
            const INPUT = {
                name: LISTS[0].name,
            }

            try {
                await ListServices.update(GROUP.id, LISTS[1].id, INPUT);
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
                await ListServices.update(GROUP.id, INVALID_ID, INPUT);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include(`listId: Missing List ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        });

        it("should pass on no changes data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const LISTS = await ListServices.all(GROUP.id);
            const INPUT = LISTS[0];

            const OUTPUT = await ListServices.update(GROUP.id, INPUT.id, INPUT);
            compareListOld(OUTPUT, INPUT);
            const UPDATED = await ListServices.find(GROUP.id, INPUT.id);
            compareListOld(UPDATED, OUTPUT);

        });

        it("should pass on no updates data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const LISTS = await ListServices.all(GROUP.id);
            const INPUT = { };
            const VALID_ID = LISTS[0].id;

            const OUTPUT = await ListServices.update(GROUP.id, VALID_ID, INPUT);
            compareListOld(OUTPUT, INPUT);
            const UPDATED = await ListServices.find(GROUP.id, VALID_ID);
            compareListOld(UPDATED, OUTPUT);

        });

        it("should pass on valid updates data", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const LISTS = await ListServices.all(GROUP.id);
            const INPUT = {
                name: "New Name",
                notes: "New Notes",
                theme: "orange",
            }
            const VALID_ID = LISTS[0].id;

            const OUTPUT = await ListServices.update(GROUP.id, VALID_ID, INPUT);
            compareListOld(OUTPUT, INPUT);
            const UPDATED = await ListServices.find(GROUP.id, VALID_ID);
            compareListOld(UPDATED, OUTPUT);

        });

    });

});

// Helper Objects ------------------------------------------------------------

export function compareListNew(OUTPUT: Partial<List>, INPUT: Partial<List>) {
    expect(OUTPUT.id).to.exist;
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.groupId).to.equal(INPUT.groupId ? INPUT.groupId : OUTPUT.groupId);
    expect(OUTPUT.name).to.equal(INPUT.name);
    expect(OUTPUT.notes).to.equal(INPUT.notes ? INPUT.notes : null);
    expect(OUTPUT.theme).to.equal(INPUT.theme ? INPUT.theme : null);
}

export function compareListOld(OUTPUT: Partial<List>, INPUT: Partial<List>) {
    expect(OUTPUT.id).to.equal(INPUT.id ? INPUT.id : OUTPUT.id);
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.groupId).to.equal(INPUT.groupId ? INPUT.groupId : OUTPUT.groupId);
    expect(OUTPUT.name).to.equal(INPUT.name ? INPUT.name : OUTPUT.name);
    expect(OUTPUT.notes).to.equal(INPUT.notes ? INPUT.notes : OUTPUT.notes);
    expect(OUTPUT.theme).to.equal(INPUT.theme ? INPUT.theme : OUTPUT.theme);
}
