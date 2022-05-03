// List ----------------------------------------------------------------------

// An individual shopping list that belongs to a Group.

// External Module -----------------------------------------------------------

import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";

// Internal Modules ----------------------------------------------------------

import Group from "./Group";
import {validateListNameUnique} from "../util/AsyncValidators";
import {BadRequest} from "../util/HttpErrors";

// Public Objects ------------------------------------------------------------

@Table({
    tableName: "lists",
    timestamps: false,
    validate: {
        isNameUnique: async function(this: List): Promise<void> {
            if (!(await validateListNameUnique(this))) {
                throw new BadRequest
                    (`name: Name '${this.name}' is already in use`);
            }
        },
    },
    version: false,
})
class List extends Model<List> {

    @Column({
        allowNull: false,
        defaultValue: DataType.UUIDV4,
        field: "id",
        primaryKey: true,
        type: DataType.UUID,
    })
    // Primary key for this List
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
    // Is this List active?
    active!: boolean;

    @BelongsTo(() => Group, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    // Group that owns this List
    group!: Group;

    @ForeignKey(() => Group)
    @Column({
        allowNull: false,
        field: "group_id",
        type: DataType.UUID,
        unique: "uniqueNameWithinGroup",
        validate: {
            notNull: {
                msg: "groupId: Is required",
            }
        }
    })
    // ID of the Group that owns this List
    groupId!: string;

    @Column({
        allowNull: false,
        field: "name",
        type: DataType.TEXT,
        unique: "uniqueNameWithinGroup",
        validate: {
            notNull: {
                msg: "name: Is required"
            },
        }
    })
    // Per-group unique name of this List
    name!: string;

    @Column({
        allowNull: true,
        field: "notes",
        type: DataType.TEXT
    })
    // General notes about this List
    notes?: string;

    @Column({
        allowNull: true,
        field: "theme",
        type: DataType.TEXT
    })
    // Presentation theme (for future use)
    theme?: string;

}

export default List;
