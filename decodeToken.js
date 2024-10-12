const jwt = require("jsonwebtoken");

// Replace 'your-token-here' with the actual JWT token you want to decode
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZWFjaGVyX2lkIjoxMDEsImlhdCI6MTcyNTkzMTIxMiwiZXhwIjoxNzI1OTM0ODEyfQ.6iTzN3uD4cFOZf6LY6-VPcbU_XcNFUnRkRXBliq5kJs";
const decoded = jwt.decode(token);

console.log(decoded);
