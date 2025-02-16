const jwt = require('jsonwebtoken')

const CreateAffiliate = async (req, res, dataModel) => {


    const { email, password, referralCode } = req.body;
    try {
        let datas = await dataModel.findOne({ email: req.body.email })


        if (!datas) {

            let data = await dataModel.create(reqBody)



            if (!data) {
                console.log(data, "L2")
                return ({ status: "fail", data: "err" })
            } else {
                let Payload = {
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                    data: data?.email,

                }

                let token = jwt.sign(Payload, `${data?.email}`);
                console.log(token, "L4")
                return ({ status: "success", data: token })
            }

        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}
module.exports = CreateAffiliate