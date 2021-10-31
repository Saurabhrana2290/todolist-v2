const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-saurabh:sr123@cluster0.4l6ha.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = mongoose.Schema(
  {
    name: String
  }
);

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item(
  {
    name: "Welcome!"
  }
);
const item2 = new Item(
  {
    name: "Use + button to add todo's items"
  }
);
const item3 = new Item(
  {
    name: "<-- click here to delete item"
  }
);
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Items saved suceessfully in DB!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const addItem = new Item(
    {
      name: itemName
    }
  );
  if (listName === "Today") {
    addItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(addItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.deleteOne({ _id: checkedItemId }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted Item!");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }
  
});

app.get("/:customListName", function (req, res) {
  const custumListName = _.capitalize(req.params.customListName);
  List.findOne({ name: custumListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List(
          {
            name: custumListName,
            items: defaultItems
          }
        );
        list.save();
        res.redirect("/" + custumListName);
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
