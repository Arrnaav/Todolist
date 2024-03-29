//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://lahanearnavslahane:krishna123@cluster0.w9cx3to.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item",itemSchema);


const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItem = [item1, item2, item3];

const listschema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listschema);

async function getItem(){
  const itemm = await Item.find({});
  return itemm;
}

app.get("/", function(req, res) {


  getItem().then(function(foundItems){
    if(foundItems.length==0){
      Item.insertMany(defaultItem).then(function(err){
        if(err){
          console.log(err);
        }
        else
        {
          console.log("Sucessfully saved the items to DB");
        }
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  })
});
app.get("/:customListName", function(req,res){
  const customListName  = _.capitalize(req.params.customListName);  
  List.findOne({name: customListName}).then(function(foundlist){
    
      if(!foundlist){
        const list = new List({
          name: customListName,
          items: defaultItem
        });
        list.save();
        console.log("not working");
        res.redirect("/"+ customListName)
      }
      else{
       res.render("list",{listTitle: foundlist.name, newListItems: foundlist.items})
  
      }
  })
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName }).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName); 
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="today"){
    Item.findByIdAndRemove(checkedItemId).then(function(err){
      if(!err){
        console.log(err);
      }
      else{
        console.log("Successfull deleted checked item.");
      }
    });
    res.redirect("/")
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}).then(function(err,foundList){
     
        res.redirect("/"+listName)
      
    })
  }
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
