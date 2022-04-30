/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {

    pgm.createTable("groups", {
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
        email: {
            type: "text",
        },
        name: {
            notNull: true,
            type: "text",
        },
        notes: {
            type: "text",
        },
        scope: {
            notNull: true,
            type: "text",
        },
    });

    pgm.createIndex("groups", "name", {
        name: "uk_groups_name",
        unique: true,
    });


};

// exports.down = pgm => {};
