// GroupServices.test ------------------------------------------------------

// Functional tests for GroupServices.

// External Modules ----------------------------------------------------------

import chai from "chai";
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import GroupServices from "./GroupServices";
import Group from "../models/Group";
import * as SeedData from "../test/SeedData";
import ServicesUtils from "../test/ServicesUtils";
import {BadRequest, NotFound} from "../util/HttpErrors";

const UTILS = new ServicesUtils();
const INVALID_ID = UTILS.invalidId();

// Test Specifications ------------------------------------------------------

describe("GroupServices Functional Tests", () => {

    // Test Hooks -----------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await UTILS.loadData({
            withGroups: true,
            withLists: true,
        });
    })

    // Test Methods ---------------------------------------------------------

    describe("GroupServices.all()", () => {

        it("should pass on active Groups", async () => {

            const groups = await GroupServices.all({ active: "" });
            groups.forEach(group => {
                expect(group.active).to.be.true;
            });

        })

        it("should pass on all Groups", async () => {

            const groups = await GroupServices.all();
            expect(groups.length).to.equal(SeedData.GROUPS.length);

        })

        it("should pass on included children", async () => {

            const groups = await GroupServices.all({
                withLists: "",
            });
            groups.forEach(group => {
                expect(group.lists).to.exist;
                group.lists.forEach(list => {
                    expect(list.groupId).to.equal(group.id);
                });
            })

        })

        it("should pass on named Groups", async () => {

            const PATTERN = "rOu";  // Should match on "Group"

            const groups = await GroupServices.all({ name: PATTERN });
            expect(groups.length).to.be.greaterThan(0);
            groups.forEach(group => {
                expect(group.name.toLowerCase()).to.include(PATTERN.toLowerCase());
            })

        })

        it("should pass on paginated Groups", async () => {

            const LIMIT = 99;
            const OFFSET = 1;
            const INPUTS = await GroupServices.all();

            const OUTPUTS = await GroupServices.all({
                limit: LIMIT,
                offset: OFFSET,
            });
            expect(OUTPUTS.length).to.be.lessThanOrEqual(LIMIT);
            expect(OUTPUTS.length).to.equal(SeedData.GROUPS.length - 1);
            OUTPUTS.forEach((OUTPUT, index) => {
                compareGroupOld(OUTPUT, INPUTS[index + OFFSET]);
            });

        })

    })

    describe("GroupServices.exact()", () => {

        it("should fail on invalid name", async () => {

            const INVALID_NAME = "INVALID GROUP NAME";

            try {
                await GroupServices.exact(INVALID_NAME);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes
                    (`Missing Group '${INVALID_NAME}'`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }
        })

        it("should pass on included children", async () => {

            const groups = await GroupServices.all();
            groups.forEach(async group => {
                const name = group.name ? group.name : "foo";
                const result = await GroupServices.exact(name, {
                    withLists: "",
                });
                expect(result.lists).to.exist;
                result.lists.forEach(list => {
                    expect(list.groupId).to.equal(result.id);
                });
            })

        })

        it ("should pass on valid names", async () => {

            SeedData.GROUPS.forEach(async group => {
                try {
                    const name = group.name ? group.name : "foo";
                    const result = await GroupServices.exact(name);
                    expect(result.name).equals(name);
                } catch (error) {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            })

        })

    })

    describe("GroupServices.find()", () => {

        it("should fail on invalid ID", async () => {

            try {
                await GroupServices.find(INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                    (`groupId: Missing Group ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on included children", async () => {

            const INPUTS = await GroupServices.all();

            INPUTS.forEach(async INPUT => {
                const group = await GroupServices.find(INPUT.id, {
                    withLists: "",
                });
                expect(group.lists).to.exist;
                group.lists.forEach(list => {
                    expect(list.groupId).to.equal(group.id);
                });
            });

        })

        it("should pass on valid IDs", async () => {

            const INPUTS = await GroupServices.all();

            INPUTS.forEach(async INPUT => {
                const OUTPUT = await GroupServices.find(INPUT.id);
                compareGroupOld(OUTPUT, INPUT);
            })

        })

    })

    describe("GroupServices.insert()", () => {

        it("should fail on duplicate input data", async () => {

            const INPUTS = await GroupServices.all();
            const INPUT = {
                name: INPUTS[0].name,
                scope: INPUTS[0].scope,
            }

            try {
                await GroupServices.insert(INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include
                    (`name: Name '${INPUT.name}' is already in use`);
                    expect(error.message).to.include
                    (`scope: Scope '${INPUT.scope}' is already in use`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }

            }

        })

        it("should fail on invalid input data", async () => {

            await GroupServices.all();
            const INPUT = {
                name: "Valid Name",
                scope: "invalid scope",
            }

            try {
                await GroupServices.insert(INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include
                    (`scope: Scope '${INPUT.scope}' must not contain spaces`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }

            }

        })

        it("should fail on missing input data", async () => {

            const INPUT = {};

            try {
                await GroupServices.insert(INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include("name: Is required");
                    expect(error.message).to.include("scope: Is required");
                } else {
                    expect.fail(`Should not have thrown ${error}'`);
                }
            }

        })

        it("should pass on valid input data", async () => {

            const INPUT = {
                active: false,
                name: "Valid Name",
                notes: "Valid notes",
                scope: "validscope",
            }

            const OUTPUT = await GroupServices.insert(INPUT);
            compareGroupNew(OUTPUT, INPUT);

        })

    })

    describe("GroupServices.lists()", () => {

        it("should pass on active Lists", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const LISTS = await GroupServices.lists(GROUP.id, {
                active: "",
            });

            expect(LISTS.length).to.be.lessThanOrEqual(SeedData.LISTS.length);
            LISTS.forEach(LIST => {
                expect(LIST.active).to.be.true;
                expect(LIST.groupId).to.equal(GROUP.id);
            });

        })

        it("should pass on all Lists", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);
            const LISTS = await GroupServices.lists(GROUP.id);

            expect(LISTS.length).to.equal(SeedData.LISTS.length);
            LISTS.forEach(LIST => {
                expect(LIST.groupId).to.equal(GROUP.id);
            });

        })

        it("should pass on name'd Lists", async () => {

            const GROUP = await UTILS.lookupGroup(SeedData.GROUP_NAME_THIRD);
            const NAME = "On"; // Should match "Second List"
            const LISTS = await GroupServices.lists(GROUP.id, {
                name: NAME,
            });

            expect(LISTS.length).to.equal(1);
            LISTS.forEach(LIST => {
                expect(LIST.name.toLowerCase()).to.include(NAME.toLowerCase());
            });

        })

    })

    describe("GroupServices.remove()", () => {

        it("should fail on invalid ID", async () => {

            try {
                await GroupServices.remove(INVALID_ID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                    (`groupId: Missing Group ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on valid ID", async () => {

            const INPUT = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);

            const OUTPUT = await GroupServices.remove(INPUT.id);
            expect(OUTPUT.id).to.equal(INPUT.id);

            try {
                await GroupServices.remove(INPUT.id);
                expect.fail("Should have thrown NotFound after remove");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                    (`groupId: Missing Group ${INPUT.id}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

    })

    describe("GroupServices.update()", () => {

        it("should fail on duplicate data", async () => {

            const ORIGINAL = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INPUT = {
                name: SeedData.GROUP_NAME_SECOND,
                scope: SeedData.GROUP_SCOPE_SECOND,
            }

            try {
                await GroupServices.update(ORIGINAL.id, INPUT);
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).to.include
                    (`name: Name '${INPUT.name}' is already in use`);
                    expect(error.message).to.include
                    (`scope: Scope '${INPUT.scope}' is already in use`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should fail on invalid ID", async () => {

            const ORIGINAL = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INPUT = {
                ...ORIGINAL,
            }

            try {
                await GroupServices.update(INVALID_ID, INPUT);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).to.include
                    (`groupId: Missing Group ${INVALID_ID}`);
                } else {
                    expect.fail(`Should not have thrown '${error}'`);
                }
            }

        })

        it("should pass on no changes data", async () => {

            const INPUT = await UTILS.lookupGroup(SeedData.GROUP_NAME_SECOND);

            const OUTPUT = await GroupServices.update(INPUT.id, INPUT);
            compareGroupOld(OUTPUT, INPUT);
            const UPDATED = await GroupServices.find(INPUT.id);
            compareGroupOld(UPDATED, OUTPUT);

        })

        it("should pass on no updates data", async () => {

            const ORIGINAL = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INPUT: Partial<Group> = {};

            const OUTPUT = await GroupServices.update(ORIGINAL.id, INPUT);
            compareGroupOld(OUTPUT, INPUT);
            const UPDATED = await GroupServices.find(ORIGINAL.id);
            compareGroupOld(UPDATED, OUTPUT);

        })

        it("should pass on valid updates data", async () => {

            const ORIGINAL = await UTILS.lookupGroup(SeedData.GROUP_NAME_FIRST);
            const INPUT: Partial<Group> = {
                active: false,
                name: "New Name",
                notes: "New note",
                scope: "newscope",
            };

            const OUTPUT = await GroupServices.update(ORIGINAL.id, INPUT);
            compareGroupOld(OUTPUT, INPUT);
            const UPDATED = await GroupServices.find(ORIGINAL.id);
            compareGroupOld(UPDATED, OUTPUT);

        })

    })

})

// Helper Objects ------------------------------------------------------------

export function compareGroupNew(OUTPUT: Partial<Group>, INPUT: Partial<Group>) {
    expect(OUTPUT.id).to.exist;
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : true);
    expect(OUTPUT.email).to.equal(INPUT.email ? INPUT.email : null);
    expect(OUTPUT.name).to.equal(INPUT.name);
    expect(OUTPUT.notes).to.equal(INPUT.notes ? INPUT.notes : null);
    expect(OUTPUT.scope).to.equal(INPUT.scope);
}

export function compareGroupOld(OUTPUT: Partial<Group>, INPUT: Partial<Group>) {
    expect(OUTPUT.id).to.equal(INPUT.id ? INPUT.id : OUTPUT.id);
    expect(OUTPUT.active).to.equal(INPUT.active !== undefined ? INPUT.active : OUTPUT.active);
    expect(OUTPUT.email).to.equal(INPUT.email ? INPUT.email : OUTPUT.email);
    expect(OUTPUT.name).to.equal(INPUT.name ? INPUT.name : OUTPUT.name);
    expect(OUTPUT.notes).to.equal(INPUT.notes ? INPUT.notes : OUTPUT.notes);
    expect(OUTPUT.scope).to.equal(INPUT.scope ? INPUT.scope : OUTPUT.scope);
}
