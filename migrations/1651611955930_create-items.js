/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {

    pgm.createTable("items", {
        id: {
            notNull: true,
            primaryKey: true,
            type: "uuid",
        },
        active: {
            default: true,
            notNull: true,
            type: "boolean",
        },
        category_id: {
            onDelete: "cascade",
            onUpdate: "cascade",
            notNull: true,
            references: "categories",
            type: "uuid",
        },
        group_id: {
            onDelete: "cascade",
            onUpdate: "cascade",
            notNull: true,
            references: "groups",
            type: "uuid",
        },
        name: {
            notNull: true,
            type: "text",
        },
        notes: {
            type: "text",
        },
        theme: {
            type: "text",
        },
    });

    pgm.createIndex("items", ["group_id", "name"], {
        name: "items_group_id_name_key",
        unique: true,
    });

};

//exports.down = pgm => {};
