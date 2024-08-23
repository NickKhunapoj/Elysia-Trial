import { Database } from "bun:sqlite";
import { t } from "elysia";

const db = new Database("mydb.sqlite");

// Books

const getBook = (id: number) => {
  try {
    const query = db.query("select * from books where id = $id;");
    return query.get({ $id: id });
  } catch (error) {
    console.log("error", error);
  }
};

const getBooks = () => {
  try {
    const query = db.query("select * from books;");
    return query.all();
  } catch (error) {
    console.log("error", error);
  }
};

const createBook = (title: string, author: string, price: number) => {
  try {
    if (!title || !author || !price) {
      throw new Error("Incomplete input");
    }
    const query = db.query(
      "insert into books (title, author, price) values ($title, $author, $price);"
    );
    return query.run({ $title: title, $author: author, $price: price });
    return { status: "ok" };
  } catch (error) {
    console.log("error", error);
    return { status: "error", error };
  }
};

const updateBook = (id: number, book: any) => {
  try {
    const query = db.query(
      "update books set title = $title, author = $author, price = $price where id = $id;"
    );
    return query.run({
      $title: book.title,
      $author: book.author,
      $price: book.price,
    });
    return { status: "ok" };
  } catch (error) {
    console.log("error", error);
    return { status: "error", error };
  }
};

const deleteBook = (id: number) => {
  try {
    const query = db.query("delete from books where id = $id;");
    return query.run({ $id: id });
    return { status: "ok" };
  } catch (error) {
    console.log("error", error);
    return { status: "error", error };
  }
};

// Users

const createUser = async(email: string, password: string) => {
  try {

    const existingUserQuery = db.query(
      "select * from users where email = $email;"
    );
    const existingUser = await existingUserQuery.get({ $email: email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const query = db.query(
      "insert into users (email, password) values ($email, $password);"
    );
    return query.run({ $email: email, $password: password });
  } catch (error) {
    throw error;
    console.log("error", error);
  }
};

const getUser = async (user: any) => {
  try {
    const query = db.query(
      "select * from users where email = $email;"
    );
    const userData = query.get({
      $email: user.email,
    });

    if(!userData){
      throw new Error("User not found");
    }
    const isMatch = await Bun.password.verify(user.password, userData.password)

    if(!isMatch){
      throw new Error("Invalid credentials");
    }
    return {
      loggedIn: true,
    };
  } catch (error) {
    console.log("error", error);
    return {
      loggedIn: false,
    };
  }
};

export {
  getBook,
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  createUser,
  getUser
};
