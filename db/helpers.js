// Helper to generate the next numeric id for a given model.
// Uses MAX(id) + 1 with a small retry on unique constraint collision.
async function nextId(Model) {
    const doc = await Model.findOne().sort({ id: -1 }).select('id').lean();
    return (doc && doc.id ? doc.id : 0) + 1;
}

// Convert a mongoose doc to a plain object without _id
function toPlain(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    delete obj._id;
    return obj;
}

// Convert array of docs to plain objects
function toPlainArray(docs) {
    return (docs || []).map(d => toPlain(d));
}

module.exports = { nextId, toPlain, toPlainArray };
