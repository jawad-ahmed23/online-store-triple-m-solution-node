import { startStandaloneServer } from "@apollo/server/standalone";
import * as mongoDB from "mongodb";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express, { Application } from "express";
import cors from "cors";
import Mongo, { Db } from "mongodb";
import http from "http";
import gql from "graphql-tag";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Product {
    id: Int,
    imageUrl: String,
    title: String,
    price: Float,
    avgRating: Float,
    totalReviews: Int,
  }

  type Order {
    id: Int,
    imageUrl: String,
    title: String,
    price: Float,
    avgRating: Float,
    totalReviews: Int,
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    products: [Product]
  }

  type Order {
    _id: ID!
    products: [String!]!
    total: Float!
    submit: Boolean!
    name: String!
    address: String!
  }

  type Mutation {
    submitOrder(order: OrderInput!): Order!
  }

  input OrderInput {
    products: [String!]!
    total: Float!
    name: String!
    address: String!
  }
`;

const products = [
  {
    id: 1,
    imageUrl:
      "https://www.hollywoodreporter.com/wp-content/uploads/2022/07/best-mens-hats-H-MAIN-2022.jpg?w=1296",
    title: "Child Hat",
    price: 20,
    avgRating: 10,
    totalReviews: 20,
  },
  {
    id: 2,
    imageUrl:
      "https://www.hollywoodreporter.com/wp-content/uploads/2022/07/best-mens-hats-H-MAIN-2022.jpg?w=1296",
    title: "Women Hat",
    price: 20,
    avgRating: 20,
    totalReviews: 40,
  },
  {
    id: 3,
    imageUrl:
      "https://www.hollywoodreporter.com/wp-content/uploads/2022/07/best-mens-hats-H-MAIN-2022.jpg?w=1296",
    title: "Men Hat",
    price: 20,
    avgRating: 30,
    totalReviews: 10,
  },
  {
    id: 3,
    imageUrl:
      "https://www.hollywoodreporter.com/wp-content/uploads/2022/07/best-mens-hats-H-MAIN-2022.jpg?w=1296",
    title: "Men Hat",
    price: 20,
    avgRating: 30,
    totalReviews: 10,
  },
  {
    id: 3,
    imageUrl:
      "https://www.hollywoodreporter.com/wp-content/uploads/2022/07/best-mens-hats-H-MAIN-2022.jpg?w=1296",
    title: "Men Hat",
    price: 20,
    avgRating: 30,
    totalReviews: 10,
  },
  {
    id: 3,
    imageUrl:
      "https://www.hollywoodreporter.com/wp-content/uploads/2022/07/best-mens-hats-H-MAIN-2022.jpg?w=1296",
    title: "Men Hat",
    price: 20,
    avgRating: 30,
    totalReviews: 10,
  },
  {
    id: 3,
    imageUrl:
      "https://www.hollywoodreporter.com/wp-content/uploads/2022/07/best-mens-hats-H-MAIN-2022.jpg?w=1296",
    title: "Men Hat",
    price: 20,
    avgRating: 30,
    totalReviews: 10,
  },
  {
    id: 3,
    imageUrl:
      "https://www.hollywoodreporter.com/wp-content/uploads/2022/07/best-mens-hats-H-MAIN-2022.jpg?w=1296",
    title: "Men Hat",
    price: 20,
    avgRating: 30,
    totalReviews: 10,
  },
  {
    id: 3,
    imageUrl:
      "https://www.hollywoodreporter.com/wp-content/uploads/2022/07/best-mens-hats-H-MAIN-2022.jpg?w=1296",
    title: "Men Hat",
    price: 20,
    avgRating: 30,
    totalReviews: 10,
  },
];

// Resolvers define how to fetch the types defined in your schema.
const resolvers = (db: Db) => ({
  Query: {
    products: () => products,
  },
  Mutation: {
    async submitOrder(_, { order }) {
      try {
        const result = await db
          .collection("orders")
          .insertOne({ ...order, submit: true });
        const newOrder = { _id: result.insertedId, ...order, submit: true };
        return newOrder;
      } catch (err) {
        console.log(err);
        throw new Error("Failed to submit order.");
      }
    },
  },
});

export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    "mongodb+srv://jawadahmed23:wJcf1vKgmi9pB4gw@cluster0.odhn6yc.mongodb.net/auth-app?retryWrites=true&w=majority"
  );

  await client.connect();

  const db: mongoDB.Db = client.db("auth-app");
  console.log(`Successfully connected to database: ${db.databaseName}`);
  return db;
}

async function startApolloServer(schema: any, db: Db) {
  let app: Application = express();
  app.use(cors({ credentials: true }));

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    ...schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  server.applyMiddleware({ app, cors: true });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.PORT || 4000 }, resolve)
  );

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

const init = async () => {
  try {
    // Initializing DB connection:
    const db: Mongo.Db = await connectToDatabase();

    const schema = {
      typeDefs: gql`
        ${typeDefs}
      `,
      resolvers: resolvers(db),
    };

    await startApolloServer(schema, db);
  } catch (error) {
    console.log(error);
  }
};

init();
