// module.exports = {
//   presets: [
//     '@vue/cli-plugin-babel/preset'
//   ]
// }

module.exports = {
  "presets": [
    '@vue/cli-plugin-babel/preset'
  ],
  "env":{
     "production": {
         "plugins": ["transform-remove-console"]
     }
  } 
} 