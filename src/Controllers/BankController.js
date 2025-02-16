const bankTable = require("../Models/BankTable");


// router.post("/bank_add", 
  
  exports.AddBank = async (req, res) => {
  try {
    const { userId, name, acc_name, acc_no, route, branch, currency_id } = req.body;
    let image = "";

    if (req.file) {
      const formData = new FormData();
      formData.append("image", req.file.buffer.toString("base64"));
      const response = await axios.post("https://api.imgbb.com/1/upload?key=YOUR_IMAGEBB_API_KEY", formData);
      image = response.data.data.url;
    }

    let user_id = req.session?.logged_in?.id || null;
    // let staff_id = user_id ? null : req.body.staff_id;
    // let contact_id = user_id ? null : req.body.contact_id;

    let bankData = { name, acc_name, acc_no, route, branch, currency_id, image, user_id, staff_id, contact_id };

    let result;
    if (userId) {
      result = await Bank.findOneAndUpdate(userId, bankData, { new: true });
    } else {
      result = await Bank.create(bankData);
    }

    res.json({ error: false, message: "Successfully bank added", bank: result });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to add bank", details: error.message });
  }
}









exports.UpdateBank = async (req, res) => {
    try {
      const { id, ...data } = req.body;
  
      // If an image is uploaded, add the filename to the data
      if (req.file) {
        data.image = req.file.filename;
      }
  
      // Check user info
      if (req.session && req.session.logged_in) {
        data.userId = req.session.logged_in.id;
      }
  
      let result;
  
      if (id) {
        // Update existing bank
        const existingBank = await bankTable.findById(id);
        if (!existingBank) {
          return res.status(404).json({ error: true, message: 'Bank not found' });
        }
  
        // Remove old image if a new one is uploaded
        if (req.file && existingBank.image) {
          const oldImagePath = path.join(uploadPath, existingBank.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
  
        result = await bankTable.findByIdAndUpdate(id, data, { new: true });
      } else {
        // Add new bank
        result = await bankTable.create(data);
      }
  
      res.json({ error: false, message: 'Successfully added/updated bank', data: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: true, message: 'Failed to add/update bank', details: error.message });
    }
  }

  exports.DeleteBank = async (req, res) => {
    try {
      const { id } = req.params;
      const bank = await bankTable.findById(id);
  
      if (!bank) {
        return res.status(404).json({ error: true, message: 'Bank not found' });
      }
  
      // Delete associated image
      if (bank.image) {
        const imagePath = path.join(uploadPath, bank.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
  
      await bankTable.findByIdAndDelete(id);
      res.json({ error: false, message: 'Successfully deleted bank' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: true, message: 'Failed to delete bank', details: error.message });
    }
  }







  