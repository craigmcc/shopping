/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {

    pgm.createTable("access_tokens", {
        id: {
            notNull: true,
            primaryKey: true,
            type: "serial",
        },
        expires: {
            notNull: true,
            type: "timestamp with time zone",
        },
        scope: {
            notNull: true,
            type: "text",
        },
        token: {
            notNull: true,
            type: "text",
        },
        user_id: {
            onDelete: "cascade",
            onUpdate: "cascade",
            notNull: true,
            references: "users",
            type: "uuid",
        }
    });

    pgm.createIndex("access_tokens", "token", {
        name: "uk_access_tokens_token",
        unique: true,
    });

};

//exports.down = pgm => {};
