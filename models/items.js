const mongoose = require("mongoose")

const itemsSchema = new mongoose.Schema({
    name : String,
});

const Item = mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

module.exports = {
    Item: Item,
    List: List
}