
const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

let instance = null; 


console.log("HOST: " + process.env.HOST);
console.log("DB USER: " + process.env.DB_USER);
console.log("DATABASE: " + process.env.DATABASE);
console.log("DB PORT: " + process.env.DB_PORT);

const connection = mysql.createConnection({
     host: process.env.HOST,
     user: process.env.DB_USER,        
     password: process.env.PASSWORD,
     database: process.env.DATABASE,
     port: process.env.DB_PORT
});




connection.connect((err) => {
     if(err){
        console.log(err.message);
     }
     console.log('db ' + connection.state);    // to see if the DB is connected or not
});


class DbService{
    static getDbServiceInstance(){
        return instance? instance: new DbService();
    }


    // async database function that retrieves all user information (excluding passwords)
    async getAllData(){
        try{
           const response = await new Promise((resolve, reject) => 
              {
                  const query = `SELECT id, username, firstname, lastname, salary, age, registerday, signintime FROM users;`;
                  connection.query(query, 
                       (err, results) => {
                             if(err) reject(new Error(err.message));
                             else resolve(results);
                       }
                  );
               }
            );
        
            return response;

        }  catch(error){
           console.log(error);
        }
   }


   // async function that inserts (adds) a new user into the database. The sign-in time in not including in this function as it is generated elsewhere
 async insertNewUser(username, hashedPassword, firstname, lastname, salary, age){
          try {
        const insertId = await new Promise((resolve, reject) => {

            const query = `
                INSERT INTO users
                (username, password, firstname, lastname, salary, age, registerday)
                VALUES (?, ?, ?, ?, ?, ?, CURDATE());
            `;

            connection.query(
                query,
                [username, hashedPassword, firstname, lastname, salary, age],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result.insertId);
                }
            );
        });

        console.log("Inserted user ID:", insertId);

        return {
            id: insertId,
            username: username,
            firstname: firstname,
            lastname: lastname,
            salary: salary,
            age: age
        };

    } catch (error) {
        console.error(error);
        throw error;
    }
   }



   // async function for searching for users based on firstname and/or lastname
   async searchByName(firstname, lastname){
        try{
             const response = await new Promise((resolve, reject) => 
                  {
                     let query;
                     if (firstname === "-") {
                        query = `SELECT id, username, firstname, lastname, salary, age, registerday, signintime FROM users WHERE lastname = ?;`;
                        connection.query(query, [lastname], (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                        });
                     }else if (lastname === "-"){
                           query = `SELECT id, username, firstname, lastname, salary, age, registerday, signintime FROM users WHERE firstname = ?;`;
                           connection.query(query, [firstname], (err, results) => {
                           if(err) reject(new Error(err.message));
                           else resolve(results);
                           });
                        
                     } else {
                        query = `SELECT id, username, firstname, lastname, salary, age, registerday, signintime FROM users WHERE firstname = ? AND lastname = ?;`;
                        connection.query(query, [firstname,lastname], (err, results) => {
                           if(err) reject(new Error(err.message));
                           else resolve(results);
                        });
                     }
                  }
             );

             return response;

         }  catch(error){
            console.log(error);
         }
   }

   // async function for searching for a user given an id
   async searchById(id){
      try{
         const response = await new Promise((resolve, reject) =>{
         const query = `SELECT id, username, firstname, lastname, salary, age, registerday, signintime FROM users WHERE id = ?;`;
            connection.query(query, [Number(id)], (err, res) => {
               if(err) reject(new Error(err.message));
               else resolve(res);
            })
         })

         console.log(response);
         return response;
      } catch (err){
         console.log(err);
      }
   }

   // async function that deleted an entire database row given an id
   async deleteRowById(id){
         try{
              id = parseInt(id, 10);
              const response = await new Promise((resolve, reject) => 
                  {
                     const query = "DELETE FROM users WHERE id = ?;";
                     connection.query(query, [id], (err, result) => {
                          if(err) reject(new Error(err.message));
                          else resolve(result.affectedRows);
                     });
                  }
               );

               console.log(response);  // for debugging to see the result of select
               return response === 1? true: false;

         }  catch(error){
              console.log(error);
         }
   }

  
   // async function that changes a user's firstname and lastname given an id
  async updateNameById(id, firstname, lastname){
      try{
           id = parseInt(id, 10);
           const response = await new Promise((resolve, reject) => 
               {
                  const query = "UPDATE users SET firstname = ?, lastname = ? WHERE id = ?;";
                  connection.query(query, [firstname,lastname, id], (err, result) => {
                       if(err) reject(new Error(err.message));
                       else resolve(result.affectedRows);
                  });
               }
            );

            return response === 1? true: false;
      }  catch(error){
            console.log(error);
      }

  }


  // async function for creation of user account specifically for sign-up
  async createUser(username, hashedPassword, firstname, lastname, salary, age){
   const query = `INSERT INTO users (username, password, firstname, lastname, salary, age, registerday) VALUES (?,?,?,?,?,?, CURDATE());`;
   return new Promise((resolve, reject) => {
      connection.query(query, [username, hashedPassword, firstname,lastname,salary,age],(err,result)=>{
         if (err) reject(err);
         else resolve(result);
      })
   })
  }

  // async function that selects all data given a user's id. Used exclusively for sign-in
  async getUserByUsername(username) {
   const query = `SELECT * FROM users WHERE username = ?;`;
   return new Promise((resolve,reject)=>{
      connection.query(query, [username], (err,results)=>{
         if (err) reject(err);
         else resolve(results[0], null);
      })
   })
  }


  // async function that searches for all users that fall within a given salary range
  async searchBySalary(lower, upper){
      const query = `SELECT id, username, firstname, lastname, salary, age, registerday, signintime FROM users WHERE salary > ? AND salary < ?;`;

      return new Promise((resolve, reject) => {
      connection.query(query, [Number(lower), Number(upper)], (err, result)=>{
         if (err) reject(err);
         else resolve(result);
      })
   })
  }


  // async function that searches for all users that fall within a given age range
  async searchByAge(lower, upper){
      const query = `SELECT id, username, firstname, lastname, salary, age, registerday, signintime FROM users WHERE age > ? AND age < ?;`;

      return new Promise((resolve, reject) => {
      connection.query(query, [Number(lower), Number(upper)], (err, result)=>{
         if (err) reject(err);
         else resolve(result);
      })
   })
  }


  // async function that searches for all users that have not yet signed in
  async searchByNULLSignin(){
   const query = `SELECT id, username, firstname, lastname, salary, age, registerday FROM users WHERE signintime IS NULL;`;

   return new Promise((resolve, reject) =>{
      connection.query(query, [], (err,res)=>{
         if(err) reject(err);
         else resolve(res);
      })
   })
  }


   // async function that searches for all users who have registered after user 'John'
    async searchByJohn() {
    const query = `
        SELECT id, username, firstname, lastname, salary, age, registerday, signintime
        FROM users
        WHERE registerday > (SELECT registerday FROM users WHERE id = 10);`;

    return new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}


   // async function that searches for all users who have registered on the same day as user 'John'
   async searchByJohnSame(){
   const query = `
        SELECT id, username, firstname, lastname, salary, age, registerday, signintime
        FROM users
        WHERE registerday = (SELECT registerday FROM users WHERE id = 10);`;

    return new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
  }


  // async function that searches for all users that have registered today
  async searchBySameDay(){
   const query = `
        SELECT id, username, firstname, lastname, salary, age, registerday, signintime
        FROM users
        WHERE registerday = (CURDATE());`;

    return new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
  }

  // async function that updates the signin time whenever a users signs in
  async updateSignInTime(username){
   const query = `UPDATE users SET signintime = NOW() WHERE username = ?;`;

   return new Promise((resolve, reject) => {
      connection.query(query, [username], (err, result)=>{
         if (err) reject(err);
         else resolve(result);
      })
   })
  }
}

module.exports = DbService;
