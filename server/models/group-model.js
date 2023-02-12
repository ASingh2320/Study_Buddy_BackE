const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId


const GroupSchema = new Schema(
    {
        groupName: { type: String, required: true},
        className: { type: String, required: true },
        classNumber: { type: String, required: true },
        email: { type: [String], required: true },
        time: {type: String, required: true},
        longitude: {type: Number, required: true},
        latitude: {type:Number, required: true}
        
    },
    { timestamps: true },
)

module.exports = mongoose.model('Group', GroupSchema)