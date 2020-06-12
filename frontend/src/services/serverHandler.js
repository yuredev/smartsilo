import axios from "axios";
const port = 8124;

const serverHandler = axios.create({
  baseURL: "http://localhost:" + port,
});

export default serverHandler;
