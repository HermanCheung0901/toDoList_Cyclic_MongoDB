//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const {Item, List} = require("./models/items")

const app = express();
const port = process.env.port || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

connectDB().catch(err => console.log(err));

const item1 = new Item({
    name:"Welcome to your ToDoList!"
});

const item2 = new Item({
    name:"Hit the + button to add a new item."
});

const item3 = new Item({
    name:"<--- Hit this to delete an item."
});

const defalutItems = [item1, item2, item3];

async function connectDB() {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connect.host}`)    
}


app.get("/", async function(req, res) {
    try {
     const foundItems = await Item.find({});
     if (foundItems.length == 0) {
      await Item.insertMany(defalutItems);
      console.log("Successful saved default items to DB.");
      res.redirect("/");
     } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
     }
    } catch (err) {
        console.log(err);
    }
});

app.post("/", async function(req, res){
    try {
        const itemName = req.body.newItem;
        const listName = req.body.list;
    
        const item = new Item ({
        name: itemName,
        });
    
        if (listName === "Today") {
        item.save();
        res.redirect("/");
        } else {
        const foundList = await List.findOne({name: listName}).exec();
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
  
    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId)
      .then((result) => {
        console.log("Deleted");
      })
      .catch((err) => {
        console.log(err);
      })
      res.redirect("/");
    } else {
      List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}})
      .then((result) => {
        console.log("removed");
        res.redirect("/" + listName)
      })
      .catch ((err) => {
        console.log(err)
      })
    }
  
    
  });
  
  app.get("/:customListName", async function(req, res) {
    try {
        const customListName = _.capitalize(req.params.customListName);
        const foundList = await List.findOne({name:customListName}).exec();
        if (foundList) {
        //Show an ecisting list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        } else { 
        //Create a new list
        const list = new List({
            name: customListName,
            items: defalutItems,
        });
    
        list.save();
        res.redirect("/" + customListName);
        }
        
    } catch (err) {
        console.log(err);
    }   
  })
  
  
  
  app.get("/about", function(req, res){
    res.render("about");
  });
  

connectDB().then(() => {
    app.listen(3000, function() {
        console.log(`Server started on port ${port}`);
      });
})