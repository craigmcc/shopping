// Group -------------------------------------------------------------------

// Group of categories, lists, items, and selecteds that can be managed
// by users with the corresponding scope.

// External Modules ----------------------------------------------------------

import {Column, DataType, HasMany, Model, Table} from "sequelize-typescript";

// Internal Modules ----------------------------------------------------------

import Category from "./Category";
import List from "./List";
import {validateGroupScope} from "../util/ApplicationValidators";
import {validateGroupNameUnique, validateGroupScopeUnique} from "../util/AsyncValidators";
import {BadRequest} from "../util/HttpErrors";

// Public Objects ------------------------------------------------------------

@Table({
    tableName: "groups",
    timestamps: false,
    validate: {
        isNameUnique: async function(this: Group): Promise<void> {
            if (!(await validateGroupNameUnique(this))) {
                throw new BadRequest
                    (`name: Name '${this.name}' is already in use`);
            }
        },
        isScopeUnique: async function(this: Group): Promise<void> {
            if (!(await validateGroupScopeUnique(this))) {
                throw new BadRequest
                    (`scope: Scope '${this.scope}' is already in use`);
            }
        },
    },
    version: false,
})
class Group extends Model<Group> {

    @Column({
        allowNull: false,
        defaultValue: DataType.UUIDV4,
        field: "id",
        primaryKey: true,
        type: DataType.UUID,
    })
    // Primary key for this Group
    id!: string;

    @Column({
        allowNull: false,
        defaultValue: true,
        field: "active",
        type: DataType.BOOLEAN,
        validate: {
            notNull: {
                msg: "active: Is required"
            }
        }
    })
    // Is this Group active?
    active!: boolean;

    @HasMany(() => Category, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    // Categories owned by this Group
    categories!: Category[];

    @Column({
        allowNull: true,
        field: "email",
        type: DataType.TEXT,
    })
    // Email address for this User
    email!: string;

    @HasMany(() => List, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    // Lists owned by this Group
    lists!: List[];

    @Column({
        allowNull: false,
        field: "name",
        type: DataType.TEXT,
        unique: "uniqueGroupName",
        validate: {
            notNull: {
                msg: "name: Is required"
            },
        }
    })
    // Globally unique name of this Group
    name!: string;

    @Column({
        allowNull: true,
        field: "notes",
        type: DataType.TEXT
    })
    // General notes about this Group
    notes?: string;

    @Column({
        allowNull: false,
        field: "scope",
        type: DataType.TEXT,
        unique: true,
        validate: {
            isValidScope: function (value: string): void {
                if (!validateGroupScope(value)) {
                    throw new BadRequest(`scope: Scope '${value}' must not contain spaces`);
                }
            },
            notNull: {
                msg: "scope: Is required"
            },
        }
    })
    // Globally unique scope prefix for this Group
    scope!: string;

}

export default Group;
