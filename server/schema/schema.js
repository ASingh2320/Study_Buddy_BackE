const {projects, clients} = require('../sampleData.js');
const Project = require("../models/Project");
const Client = require('../models/Client');
const Group = require('../models/group-model');
const User = require('../models/user-model');

const { GraphQLObjectType, GraphQLID, GraphQLInt, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType, GraphQLFloat } = require('graphql');
//const { resolve } = require('patch-package/dist/path.js');

const GroupType = new GraphQLObjectType({
    name: 'Group',
    fields: () => ({
        groupName: { type: GraphQLString},
        className: { type: GraphQLString},
        classNumber: { type: GraphQLString },
        email: { type: GraphQLList(GraphQLString) },
        time: {type: GraphQLString},
        longitude: {type: GraphQLFloat},
        latitude: {type: GraphQLFloat}
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        userName: { type: GraphQLString},
        firstName: { type: GraphQLString},
        lastName: { type: GraphQLString},
        email: { type: GraphQLString},
        passwordHash: { type: GraphQLString},
        groups: {type: GraphQLList(GraphQLString)}
    })
});

const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        phone: {type: GraphQLString}
    })
});

const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () =>({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        status: {type: GraphQLString},
        client: {
            type: ClientType,
            resolve(parent, args){
                return Client.findById(parent.clientId);
            }
        }
    })
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        register:{
            type: UserType,
            args: {
                userName: { type: GraphQLString},
                firstName: { type: GraphQLString},
                lastName: { type: GraphQLString},
                email: { type: GraphQLString},
                passwordHash: { type: GraphQLString},
            },
            resolve(parent, args){
                return User.create({
                    userName: args.userName,
                    firstName: args.firstName,
                    lastName: args.lastName,
                    email: args.email,
                    passwordHash: args.passwordHash,
                    groups: []
                });
            }
        },
        addGroup:{
            type: GroupType,
            args: {
                groupName: { type: GraphQLString},
                className: { type: GraphQLString},
                classNumber: { type: GraphQLString},
                email: { type: GraphQLString},
                time: { type: GraphQLString },
                longitude: { type: GraphQLFloat },
                latitude: { type: GraphQLFloat }
            },
            resolve(parent, args){
                return Group.create({
                    groupName: args.groupName,
                    className: args.className,
                    classNumber: args.classNumber,
                    email: args.email,
                    time: args.time,
                    longitude: args.longitude,
                    latitude: args.latitude
                });
            }
        },
        addtoGroup:{
            type: GroupType,
            args: {
                groupName: { type: GraphQLString},
                email: { type: GraphQLString},
            },
            resolve(parent, args){
                return Group.findOne({groupName: args.groupName}).then(doc => {
                    doc.email.push(args.email);
                    doc.save();
                    return doc;
                })
            }
        },
        deleteGroup:{
            type: GroupType,
            args: {
                groupName: { type: GraphQLString},
            },
            resolve(parent, args){
                return Group.findOneAndDelete({groupName: args.groupName});
            }
        },
        addClient:{
            type: ClientType,
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                email: {type: GraphQLNonNull(GraphQLString)},
                phone: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args){
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                });
                return client.save();
            }
        },
        deleteClient:{
            type: ClientType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)},
            },
            resolve(parent, args){
                return Client.findByIdAndDelete(args.id);
            }
            
        },
        addProject:{
            type: ProjectType,
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                description: {type: GraphQLNonNull(GraphQLString)},
                status: {
                    type: new GraphQLEnumType({
                        name: "ProjectStatus",
                        values: {
                            'new': {value: "Not Started"},
                            'progress': {value: "In Progress"},
                            'completed': {value: "Completed"},
                        }
                    }),
                    defaultValue: "Not Started",
                },
                clientId: {type: GraphQLNonNull(GraphQLID)},
            },
            resolve(parent, args){
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId,
                });
                return project.save();
            }
            
        },

        deleteProject:{
            type: ProjectType,
            args:{
                id: {type: GraphQLNonNull(GraphQLID)},
            },
            resolve(parent, args){
                return Project.findByIdAndDelete(args.id);
            }
        },

        updateProject: {
            type: ProjectType,
            args:{
                id: {type: GraphQLNonNull(GraphQLID)},
                name: {type: GraphQLString},
                description: {type: GraphQLString},
                status:{
                    type: new GraphQLEnumType({
                        name: "ProjectStatusUpdate",
                        values: {
                            'new': {value: "Not Started"},
                            'progress': {value: "In Progress"},
                            'completed': {value: "Completed"},
                        }
                    }),
                },
            },
            resolve(parent, args){
                return Project.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            description: args.description,
                            status: args.status,
                        }
                    },
                    {new: true},
                )
            }
        }
    }
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        groups: {
            type: GraphQLList(GroupType),
            resolve(parent, args){
                return Group.find();
            }
        },
        group_by_class: {
            type: GraphQLList(GroupType),
            args:{
                className: {type: GraphQLString},
                classNumber: {type: GraphQLString}
            },
            resolve(parent, args){
                console.log(args);
                return Group.find({'$and': [{className: 'AMS', classNumber: '101'}]});
            }
        },
        login: {
            type: UserType,
            args: {
                userName: {type: GraphQLString}
            },
            resolve(parent, args){
                return User.find({userName: args.userName});
            }
        }
    }
});
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: mutation,
});