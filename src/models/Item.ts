// Item ----------------------------------------------------------------------

// An individual item that can be added to a shopping list, belonging to a Category.

// External Module -----------------------------------------------------------

import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";

// Internal Modules ----------------------------------------------------------

import Category from "./Category";
import Group from "./Group";
import {validateItemNameUnique} from "../util/AsyncValidators";
import {BadRequest} from "../util/HttpErrors";

// Public Objects ------------------------------------------------------------

@Table({
    tableName: "items",
    timestamps: false,
    validate: {
        isNameUnique: async function(this: Item): Promise<void> {
            if (!(await validateItemNameUnique(this))) {
                throw new BadRequest
                (`name: Name '${this.name}' is already in use`);
            }
        },
    },
    version: false,
})
class Item extends Model<Item> {

    @Column({
        allowNull: false,
        defaultValue: DataType.UUIDV4,
        field: "id",
        primaryKey: true,
        type: DataType.UUID,
    })
    // Primary key for this Item
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
    // Is this Item active?
    active!: boolean;

    @BelongsTo(() => Category, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    // Category this Item is assigned to
    category!: Category;

    @ForeignKey(() => Category)
    @Column({
        allowNull: false,
        field: "category_id",
        type: DataType.UUID,
        validate: {
            notNull: {
                msg: "categoryId: Is required",
            }
        }
    })
    // ID of the Category this Item is assigned to
    categoryId!: string;

    @BelongsTo(() => Group, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    // Group that owns this Item
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
    // ID of the Group that owns this Item
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
    // Per-group unique name of this Item
    name!: string;

    @Column({
        allowNull: true,
        field: "notes",
        type: DataType.TEXT
    })
    // General notes about this Item
    notes?: string;

    @Column({
        allowNull: true,
        field: "theme",
        type: DataType.TEXT
    })
    // Presentation theme (for future use)
    theme?: string;

}

export default Item;
