import { Elysia, t } from "elysia";
import {
  getBooks,
  getBook,
  createBook,
  deleteBook,
  updateBook,
  createUser,
  getUser,
} from "./model";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(
    cors({
      origin: 'http://localhost:3000', // Your Next.js frontend URL
      methods: ['POST','GET','PUT','DELETE'] // Methods you want to allow
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "secret",
    })
  )
  .derive(async ({ jwt, cookie: { auth } }) => {
    const profile = await jwt.verify(auth.value);
    return {
      profile,
    };
  })
  .use(swagger());

// ---------------- Guard Hook ---------------- //

app.guard(
  {
    beforeHandle({ set, profile }) {
      console.log("before router");
      if (!profile) return (set.status = "Unauthorized");
    },
  },
  (app) => {
    // ---------------- Get Books API ---------------- //

    app.get("/books", () => getBooks());

    // ---------------- Get Book By ID API ---------------- //

    app.get("/books/:id", async ({ params, profile }) => {
      console.log("profile", profile);
      return getBook(parseInt(params.id));
    });

    // ---------------- Insert Books API ---------------- //

    app.post(
      "/books",
      ({ body, set }) => {
        const bookBody: any = body;
        const response = createBook(
          bookBody.title,
          bookBody.author,
          bookBody.price
        );
        if (response.status === "error") {
          set.status = 400;
          return { message: "Incomplete input" };
        }
        return { message: "ok" };
      },
      {
        body: t.Object({
          title: t.String(),
          author: t.String(),
          price: t.Number(),
        }),
      }
    );

    // ---------------- Update Books API ---------------- //

    app.put("/books/:id", ({ params, body, set }) => {
      try {
        const bookBody: any = body;
        const bookId: number = parseInt(params.id);
        const response = createBook({
          title: bookBody.title,
          author: bookBody.author,
          price: bookBody.price,
        });
        if (response.status === "error") {
          set.status = 400;
          return { message: "Incomplete input" };
        }
        return { message: "ok" };
      } catch (error) {
        set.status = 500;
        return { message: "Internal Server Error" };
      }
    });

    // ---------------- Delete Books API ---------------- //

    app.delete("/books/:id", ({ params }) => {
      const bookId: number = parseInt(params.id);
      const response = deleteBook(bookId);
      if (response.status === "error") {
        set.status = 500;
        return { message: "Unable to Delete" };
      }
      return { message: "Delete bookId: " + bookId };
    });

    return app;
  }
);

// ---------------- User Register API ---------------- //

app.post("/register", async ({ body, set }) => {
  try {
    let userData: any = body;
    userData.password = await Bun.password.hash(userData.password, {
      algorithm: "bcrypt",
      cost: 4,
    });
    await createUser(userData.email, userData.password);
    return { message: "Created successfully" };
  } catch (error) {
    if (error.message === "User already exists") {
      set.status = 409;
      return { message: "User already exists"};
    } else {
      set.status = 500;
      return { message: "Internal Server Error", error: error.message };
    }
  }
},
{
  body: t.Object({
    email: t.String(),
    password: t.String(),
  }),
});


// ---------------- User Login API ---------------- //

app.post("/login", async ({ body, set, jwt, cookie: { auth }, params }) => {
  try {
    let userData: any = body;
    const response = await getUser(userData);
    if (!response.loggedIn) {
      set.status = 401;
      return { message: "Invalid login" };
    }

    auth.set({
      value: await jwt.sign(params),
      httpOnly: true,
      maxAge: 7 * 86400,
      path: "/",
    });

    return {
      message: "Logged in successfully",
      token: auth.value,
    };
  } catch (error) {
    set.status = 500;
    return { message: "error", error };
  }
});

app.listen(8000);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
