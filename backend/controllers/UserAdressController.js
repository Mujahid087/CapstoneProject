const Address = require("../models/AddressModel");



exports.addAddress = async (req, res) => {
    try {
        if (req.body.isDefault) {
             
             await Address.updateMany({ userId: req.body.userId }, { $set: { isDefault: false } });
        }

        const address = await Address.create(req.body);

        res.status(201).json({
            message: "Address added successfully",
            address
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getUserAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.params.userId }).sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateAddress = async (req, res) => {
    try {
        
        const currAddress = await Address.findById(req.params.id);
        if(!currAddress) {
             return res.status(404).json({ message: "Address not found" });
        }

        if (req.body.isDefault) {
             
             await Address.updateMany({ userId: currAddress.userId, _id: { $ne: req.params.id } }, { $set: { isDefault: false } });
        }

        const address = await Address.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json({
            message: "Address updated",
            address
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.deleteAddress = async (req, res) => {
try {

    await Address.findByIdAndDelete(req.params.id);

    res.json({
        message: "Address deleted successfully"
    });

} catch (error) {

    res.status(500).json({
        message: error.message
    });

}
};