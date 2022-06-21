const http = require("http");
const path = require("path");
const express = require("express");

const { ApolloSever } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { resolvers, typeDefs } = require("./schema");

const db = require("./config/connection");
const routes = require("./routes");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
  }
  
  app.use(routes);
  
  async function startApolloServer() {
    const httpServer = http.createServer(app);
    const server = new ApolloSever({
      typeDefs,
      resolvers,
      // csrfPrevention: true,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
  
    await server.start();
    server.applyMiddleware({ app });
    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  }
  
  db.once("open", startApolloServer);