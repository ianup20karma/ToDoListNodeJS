require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + '/date.js');
const PORT = process.env.PORT || 3000;

const app = express();
const dbUrl = `mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLAS_PASSWORD}@cluster0.7mu5ag5.mongodb.net/toDoList`;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
const language = 'en-IN';

mongoose.connect(dbUrl, { useNewUrlParser: true });

const day = date.getDate(language);
const itemsSchema = { name: String };
const Item = mongoose.model('Item', itemsSchema);
const initialDocs = [
    new Item({ name: 'Welcome to your To Do List!' }),
    new Item({ name: 'Hit the + button to add a new item.' }),
    new Item({ name: '<-- Hit this to delete an item.' })
];
const listsSchema = { name: String, items: [itemsSchema] };
const List = mongoose.model('List', listsSchema);

app.get('/', (req, res) => {
    Item.find().then(listItems => {
        if (listItems.length) res.render('index.ejs', { listName: day, listItems });
        else Item.insertMany(initialDocs);
    });
});

app.get('/:customListName', (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }).then(foundItem => {
        if (!foundItem) {
            const list = new List({ name: customListName, items: initialDocs })
            list.save();
            res.redirect('/' + customListName);
        } else {
            res.render('index.ejs', { listName: customListName, listItems: foundItem.items })
        }
    });
});

app.post('/', (req, res) => {
    const newItem = req.body.newItem;
    const listName = req.body.list;

    if (req.body.newItem.trim() === '') {
        res.redirect('/');
    } else {
        const newItemEntry = new Item({ name: newItem })
        if (listName == day) {
            newItemEntry.save();
            res.redirect('/');
        } else {
            List.findOne({ name: listName }).then(foundItem => {
                foundItem.items.push(newItemEntry);
                foundItem.save();
                res.redirect('/' + listName);
            });
        }
    }
});

app.post('/delete', (req, res) => {
    const checkBoxId = req.body.checkbox;
    const listName = req.body.listName;

    setTimeout(() => {
        if (listName == day) {
            Item.findByIdAndRemove({ _id: checkBoxId }).then(() => res.redirect('/'));
        } else {
            List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkBoxId } } }).then(() => res.redirect('/' + listName));
        }
    }, "1000");
});

app.listen(PORT, () => console.log('Server is Up and Running on Port 3000 !'));