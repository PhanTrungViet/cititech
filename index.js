var express = require("express");
var app = express();
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.listen(3001);
//cau hinh pg
var pg = require("pg");
var config={
	user: 'postgres',
	database: 'TeamManageApp',
	password: '2511',
	host: 'localhost',
	port: 5432,
	max:10,
	idleTimeoutMillis:30000,
};
var pool = new pg.Pool(config);

//cau hinh ejs
app.set("view engine", "ejs");
app.set("views","./views");
//file css
app.use(express.static(__dirname + '/views'));

app.get("/",function(req, res){
	res.send("HOME");
});
//test bodyparser
app.post("/",urlencodedParser,function(req, res){
	var u = req.body.username;
	res.send(u);
});

app.get("/project/:id",function(req, res){
	var i = req.params.id;
	res.send("server nhan duoc " + i);
});

//cititech
app.get("/projects/list", function(req, res){
    pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query('SELECT * FROM project ORDER BY id ASC' ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           //res.status(200).send(result.rows);
           //console.log(result.rows[0].hoten);
           res.render("projects_list", {danhsach:result});
       });
    });
});
app.get("/projects/add",function(req, res){
	res.render("projects_add");
});
app.post("/projects/add",urlencodedParser,function(req, res){
	
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       var name = req.body.name;
       client.query("INSERT INTO project(name) VALUES('"+name+"')" ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.redirect("/projects/list");
       });
    });
	
});
app.get("/projects/edit/:id",function(req, res){
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       var id = req.params.id;
       client.query("SELECT * FROM project WHERE id ='"+id+"' " ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.render("projects_edit", {id:result.rows[0]});
       });
    });
});
app.post("/projects/edit",urlencodedParser,function(req, res){
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       var id = req.body.id;
       var name = req.body.name;
       client.query("UPDATE project SET name='"+name+"' WHERE id='"+id+"'" ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.redirect("/projects/list");
       });
    });
});
app.get("/projects/delete/:id",function(req, res){
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       var id = req.params.id;
       client.query("DELETE FROM project WHERE id='"+id+"'" ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.redirect("/projects/list");
       });
    });
});
//manage project memeber
app.get("/projects/read/:id",function(req, res){
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       var id = req.params.id;
       client.query("SELECT member.id, member.name, member.phone FROM relationship JOIN member ON relationship.member_id = member.id AND relationship.project_id='"+id+"'" ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.render("projects_read",{thamgia:result, project_id:id});
       });      
    });
});
app.get("/projects/read/out/:project_id/:member_id",function(req, res){
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       var project_id = req.params.project_id;
       var member_id = req.params.member_id;
       client.query("DELETE FROM relationship WHERE project_id='"+project_id+"' AND member_id = '"+member_id+"'" ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.redirect("/projects/read/"+project_id);
       });
    });
});
app.get("/projects/read/in/:project_id", function(req, res){
  //select member not in relationship
    pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       var project_id = req.params.project_id;
       client.query("SELECT * FROM member WHERE member.id NOT IN (SELECT member.id FROM relationship, member WHERE relationship.member_id=member.id AND relationship.project_id='"+project_id+"')",function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.render("projects_add_members",{danhsach:result, project_id:project_id});
       });
    });
});
app.get("/projects/memberstoadd/:project_id/:member_id",function(req, res){
      pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       var project_id = req.params.project_id;
       var member_id = req.params.member_id;
       client.query("INSERT INTO relationship(project_id, member_id) values('"+project_id+"','"+member_id+"')",function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.redirect("/projects/read/"+project_id);
       });
    });
});
//member
app.get("/members/list",function(req, res){
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       client.query('SELECT * FROM member ORDER BY id ASC' ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           //res.status(200).send(result.rows);
           //console.log(result.rows[0].name);
           //res.send(result.rows[0].name);
           res.render("members_list", {danhsach:result});
       });
    });
});
app.get("/members/add",function(req, res){
	res.render("members_add");
});
app.post("/members/add",urlencodedParser,function(req, res){
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       name = req.body.name;
       phone = req.body.phone;
       client.query("INSERT INTO member(name, phone) VALUES('"+name+"', '"+phone+"')" ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.redirect("/members/list");
       });
    });
});
app.get("/members/edit/:id",function(req, res){
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       id = req.params.id;
       client.query("SELECT * FROM member WHERE id = '"+id+"'" ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.render("members_edit", {danhsach:result.rows[0]});
       });
    });
});
app.post("/members/edit",urlencodedParser,function(req, res){
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       id = req.body.id;
       name = req.body.name;
       phone = req.body.phone;
       client.query("UPDATE member SET name='"+name+"', phone='"+phone+"' WHERE id = '"+id+"'" ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.redirect("/members/list");
       });
    });
});
app.get("/members/delete/:id",function(req, res){
	pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
       var id = req.params.id;
       client.query("DELETE FROM member WHERE id='"+id+"'" ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
           res.redirect("/members/list");
       });
    });
});