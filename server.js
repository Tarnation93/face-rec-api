const express = require ('express')
const bodyParser = require ('body-parser')
const bcrypt = require ('bcrypt-nodejs')
const cors = require ('cors')
const app = express()
const knex = require('knex')
const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '1',
    database : 'smart-brain'
  }
});
db.select('*').from ('users').then(data=>{
	
})


app.use(cors());
 app.use(bodyParser.json())
 

app.get('/profile/:id', (req,res)=> {

	
const {id} = req.params;
db.select('*').from('users').where({id:id})
.then(user=>{ if (user.length) 
	res.json(user[0])
 else res.status(400).json('user not found')
 	}
 )})


app.put('/image', (req,res) => {
    const {id} = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(enteries => {
        res.json(enteries);
    })
    .catch(err => res.status(400).json('cannotUpdate'));
 })

app.get('/', (req,res)=>
	res.send(db.users))

app.post('/signIn', (req,res)=>
{
    const {email, password} = req.body;
        if(!email || !password)
            return res.status(400).json("incorrect form submision")
	db.select ('email','hash')
	.from('login')
	.where('email','=', req.body.email)
	.then(data=> {
	const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
	if(isValid) {
		db.select('*')
		.from('users')
		.where('email', '=', req.body.email)
		.then(user=>{
			res.json(user[0])
		})
			.catch(err=> res.status(400).json('cannot find user'))
		
	}else
	res.status(400).json('wrong password')
	})
	.catch(err=>res.status(400).json('wrong email'))
})


app.post('/register', (req,res)=> {
        const {email, password, name} = req.body;
        if(!email || !password || name)
            return res.status(400).json("incorrect form submision")
    
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert(
        {
            email:email,
            hash:hash
        })
     .into('login')
     .returning('email')
     .then(loginEmail=>{
         return trx('users')
         .returning('*')
         .insert({
             email:loginEmail[0],
             name:name,
            joined:new Date()

         })
         })
    .then (user => {
        res.json(user[0]);
    })
    .then(trx.commit)
    .catch(trx.rollback)
}
)})

app.listen (process.env.PORT || 3000,()=>{
	console.log (`server is running on port ${process.env.PORT}`)
});


 
