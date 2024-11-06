const APIFeatures = require('./../utils/apiFeatures');
const mongoose = require('mongoose');

const optionsUpdate = {
    new: true, 
    runValidators: true
};

exports.filterObject = (body, filterFields) => {
    return Object.fromEntries(
        Object.entries(body).filter(([key]) => filterFields.includes(key))
    );
};

exports.getOneId = (model) => async (id, popOptions) => {
    let query = model.findById(id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) throw new Error('No document found with that ID');
    return doc;
};

exports.getOne = (model) => async (filter, popOptions, selectOptions, popSelect) => {
    
    let query = model.findOne(filter);
    if (selectOptions) query = query.select(selectOptions);
    if (popSelect) query = query.populate({path: popOptions, select: popSelect});
    else if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    return doc;
};

exports.getAll = (model) => async (filter, query, popOptions) => {
    const features = new APIFeatures(model.find(filter), query, popOptions).execute();
    return features;
};

exports.createOne = (model) => async (body, optionsValidator) => {
    const objectValue = new model(body);
    const filterFields = objectValue.getFields();
    const bodyFilter = exports.filterObject(body, filterFields);
    console.log("bodyFilter",bodyFilter)
    return objectValue.save(bodyFilter, optionsValidator);
};

exports.updateOne = (model) => async (filter, body, selectOptions, optionsValidator) => {
    const validator = optionsValidator || optionsUpdate;
    const doc = await model.findOneAndUpdate(filter, body, validator).select(selectOptions);
    if (!doc) throw new Error('No document found to update');
    return doc;
};

exports.deleteOne = (model) => async (_id) => {
    const doc = await model.findByIdAndUpdate(_id, {active: false}, { new: true });
    if (!doc) throw new Error('No document found to delete');
    return doc;
};

exports.deleteAll = (model) => async (property, _id) => {
    const result = await model.updateMany({ [property]: _id }, { $set: { active: false } });
    if (result.nModified === 0) throw new Error('No documents found to delete');
    return result;
};

exports.clearOne = (model) => async (_id) => {
    const doc = await model.findByIdAndDelete(_id);
    if (!doc) throw new Error('No document found to clear');
    return doc;
};

exports.activeOne = (model) => async (_id) => {
    const doc = await model.findByIdAndUpdate(_id, {active: true}, { new: true });
    if (!doc) throw new Error('No document found to activate');
    return doc;
};

exports.activeAll = (model) => async (property, _id) => {
    const result = await model.updateMany({ [property]: _id }, { $set: { active: true } });
    if (result.nModified === 0) throw new Error('No documents found to activate');
    return result;
};

exports.countDocuments = (model) => async (filter) => {
    return model.countDocuments(filter);
};

exports.getCountArrayAggregate = (model) => async (fieldName, fieldValue, name) => {
    return model.aggregate([
        { $match: { [fieldName]: fieldValue } },
        { $project: { count: { $size: `$${name}` } } }
    ]);
};

exports.getModel = (model) =>()=> {
    return new model();
};

exports.getModelConstructor = (model) => (values) => {
    return new model(values);
};

exports.bulkWrite = (model) => async (operations) => {
    return model.bulkWrite(operations);
};

exports.aggregate = (model) => async (pipeline) => {
    return model.aggregate(pipeline);
};

exports.distinct = (model) => async (field, filter) => {
    return model.distinct(field, filter);
};

exports.findOneAndDelete = (model) => async (filter) => {
    const doc = await model.findOneAndDelete(filter);
    if (!doc) throw new Error('No document found to delete');
    return doc;
};

exports.findByIdAndReplace = (model) => async (id, replacement, options) => {
    const doc = await model.findByIdAndReplace(id, replacement, { new: true, ...options });
    if (!doc) throw new Error('No document found to replace');
    return doc;
};

exports.updateMany = (model) => async (filter, update, options) => {
    const result = await model.updateMany(filter, update, options);
    if (result.nModified === 0) throw new Error('No documents found to update');
    return result;
};

exports.transaction = (session) => async (operations) => {
    session.startTransaction();
    try {
        for (let op of operations) {
            await op();
        }
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

exports.populateVirtuals = (doc, fields) => {
    fields.forEach(field => {
        if (doc.populated(field)) return;
        doc.populate(field);
    });
    return doc;
};

exports.lean = (query) => {
    return query.lean();
};

exports.pagination = (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
};