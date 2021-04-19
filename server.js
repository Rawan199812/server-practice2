'use strict';

// Application Dependencies 
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodoverride = require('method-override');

// Environmental variables
require('dotenv').config();

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// Application Setup
const app = express();
const client = new pg.Client(DATABASE_URL);

// Express Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));
app.use(express.static('./public'));

app.set('view engine', 'ejs');
// routes:
app.get('/home',allCharacters);
app.post('/favorite-character',saveCharacter)
app.get('/character/my-fav-characters',savedCharacters)
app.get('/character/create',creatCharacterPage)
app.post('/character/create',creatNewCharacter)
app.get('/character/my-characters',displayCreatedCharacters)
app.get('/character/:character_id',seeDetails)
app.delete('/character/:character_id',DeleteCharacter)
app.put('/character/:character_id',UpdateCharacter)




// Get data from api
function allCharacters(req,res) {
    let url=`http://hp-api.herokuapp.com/api/characters`;
    superagent.get(url).then(results=>{
  const Results=results.body.map(element=> new Character(element)); 
        res.render('index',{Results:Results})  
        // console.log(Results);
     
    })
}

// Save To DataBase
function saveCharacter(req,res) {
//  console.log('this is req',req.body);   
    let SQL=`INSERT INTO characters (name,house,patronus,is_alive,created_by) VALUES ($1,$2,$3,$4,$5) RETURNING id;`;
    let SQLArr=[req.body.name,req.body.house,req.body.patronus,req.body.is_alive,'api'];
    // console.log(SQLArr);
    client.query(SQL,SQLArr).then(()=>{
        res.redirect('/character/my-fav-characters')
        // console.log('this is result',results);
    }
)
}

// To render all saved from API
function savedCharacters(req,res) {
    let SQL=`SELECT * FROM characters;`
    client.query(SQL).then(results=>{
        // console.log(results.rows);
        res.render('display-characters',{results:results.rows})
    })
    
}

// to get the Character from DB and render it in details page
function seeDetails(req,res) {
    // console.log('from req',req.params);
    let SQL=`SELECT * FROM characters WHERE id=$1;`
    let idN=req.params.character_id;
    client.query(SQL,[idN]).then(results=>{
        // console.log('from result',results.rows);
        res.render('character-details',{results:results.rows})
    })
    
}

function DeleteCharacter(req,res) {
        //  console.log('from req',req.params);
    let SQL=`DELETE FROM characters WHERE id=$1`;
    let idN=req.params.character_id;
    
    client.query(SQL,[idN]).then(()=>{
        res.redirect('/character/my-fav-characters')

    }).catch(error => console.log(error));    
}


// we are not updating the created_by And we can make the is_alive select and options in the form
function UpdateCharacter(req,res) {
    const {name,house,patronus,is_alive}=req.body;
    const SQL=`UPDATE characters SET name=$1,house=$2,patronus=$3,is_alive=$4 WHERE id=$5`;
    let idN=req.params.character_id;
    let safeValues=[name,house,patronus,is_alive,idN]
    client.query(SQL,safeValues).then(()=>{
        res.redirect(`/character/${idN}`)
    }).catch(error => console.log(error)); 

    
}


// render the form to create new
function creatCharacterPage(req,res) {
    res.render('create-character');
    
}

function creatNewCharacter(req,res) {
    // console.log(req.body);
    const {name,house,patronus,is_alive}=req.body;
    let SQL=`INSERT INTO characters (name,house,patronus,is_alive,created_by) VALUES ($1,$2,$3,$4,$5);`;
    let safeValues=[name,house,patronus,is_alive,'user']    
    // console.log(safeValues);
    client.query(SQL,safeValues).then(()=>{
        res.redirect('/character/my-characters')
        console.log('all good');
    }

    )   
}

function displayCreatedCharacters(req,res) {
    // console.log(req.body);
    const SQL=`SELECT * FROM characters WHERE created_by=$1;`; //ask about the 1
    const safeValues = ['user'];
    client.query(SQL,safeValues).then(results=>{
        res.render('display-characters',{results:results.rows})
        console.log(results.rows);
    }).catch(error => console.log(error));


    
}

// constructor
let arrOf=[]
function Character(info) {
    this.name=info.name;
    this.house=info.house;
    this.patronus=info.patronus;
    this.is_alive=info.alive? info.alive:'Alive is not found';  
    arrOf.push(this);

}

client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
}).catch(error => console.log(error));