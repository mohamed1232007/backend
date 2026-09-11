module.exports = function addIdField(schema) {
    schema.set("toJSON", {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret.__v;
            return ret;
        },
    });

    schema.set("toObject", {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            return ret;
        },
    });
};
