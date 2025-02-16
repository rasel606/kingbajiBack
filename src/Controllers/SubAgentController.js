const SubAdminModel = require('../Models/SubAdminModel')

const CreateService = require('../Services/CreateService')
const LoginService = require('../Services/LoginService')

const updateOne = require('../Services/UpdateService')

exports.CreateAdmin = async (req, res) => {
    console.log(req.body)
    let dataModel = SubAdminModel;
    let result = await CreateService(req, dataModel);
    console.log(result, "line1")
    res.json({ status: result.status, data: result.data })
};
exports.AdminLogin = async (req, res) => {
    let dataModel = SubAdminModel;
    let result = await LoginService(req, res, dataModel);
    console.log(result, "line1")
    res.json({ status: result.status, data: result.data })
};
exports.AdminProfile = async (req, res) => {
    let dataModel = SubAdminModel;
    let result = await updateOne(req, res, dataModel);
    res.status(result.status).json({ status: result.status, data: result.data })
};