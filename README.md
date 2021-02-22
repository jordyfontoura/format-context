# Context-based formatter - format-context

## Installation
With [npm](https://www.npmjs.com/) do:

    $ npm install format-context

# Dependencies
There are no other NodeJS libraries that format-context is dependent of

# Usage
```typescript
format(message, context, options);
```
## message: string
is the message


## context: object | !(null|undefined)
is the context of the message


## options?: object
options can accept as many parameters as you prefer


### Recursive
recursive: false
```javascript
format("Hello {name}!", {name: "Jack {surname}", surname: "Sparrow"}) -> "Hello Jack {surname}!"
```
recursive: true
```javascript
format("Hello {name}!", {name: "Jack {surname}", surname: "Sparrow"}, {recursive: true}) -> "Hello Jack Sparrow!"
```
Warning:
```javascript
format("Hello {name}!", {name: "Jack {name}"}, {recursive: true, maxDepth: 2}) -> "Hello Jack Jack Jack {name}!"
```
maxDepth=Infinity will cause infinity loop

### Empty
empty: false
```javascript
format("Hello {}!", ["Jack"], {empty: false}) -> "Hello Jack!"
```
empty: true
```javascript
format("Hello {}!", ["Jack"], {empty: true}) -> "Hello !"
```

### EnableFunctionSegment
enableFunctionSegment: false
```javascript
let name = "Jack";
format("Hello {name}!", {name: (context)=>name}, {enableFunctionSegment: false}) -> "Hello [function]!"
```
nableFunctionSegment: true
```javascript
let name = "Jack";
format("Hello {name}!", {name: (context)=>name}, {enableFunctionSegment: true}) -> "Hello Jack!"
```

### Process
Function that is call before the function ```compile```

Example:
```javascript
format("Hello {nickname}!", {gender: 'male', male: {nickname: 'boy'}, female: {nickname: 'girl'}}, {
  process: (context)=>context.gender === 'male'? context.male : context.female 
}) -> "Hello boy!"
```
### Compile
Function used to compiled the segment 

Example:
```javascript
format("Hello {1} {17}!", {}, {
  compile: (segment)=>parseInt(segment.toString()) + 1
}) -> "Hello 2 18!"
```
### Make
Function is called after compile the segment

Example:
```javascript
const extern = "j";
format("Hello {1} {4}!", {
  compile: (segment)=>parseInt(segment.toString()) + 1,
  make: (resultado)=>`${resultado}-${extern}`
}) -> "Hello 2-j 5-j!"
```
### Cancelers
You can customize the cancelers as you want

Example:
```javascript
format("Hello anular{name} {name}!", {name: "Jack"}, {
  cancelers: [
    "anular"
  ]
}) -> "Hello {name} Jack!"
```
### Delimiters
You can customize the delimiters as you want 

Example:
```javascript
format("Hello ${name}!", {name: "Jack"}, {
  delimiters: [
    {start: "${", end: "}"}
  ]
}) -> "Hello Jack!"
```


## Others examples:
``` js
format("Hello {name}!", {name: "Jack"}) -> "Hello Jack!"
format("Hello {name}! You are {age} years old!", {name: "Jack", age: 22}) -> "Hello Jack! You are 22 years old!"
format("Hello {0}!", ["Jack"]) -> "Hello Jack!"
format("Hello {0}! You are {1} years old!", ["Jack", 22]) -> "Hello Jack! You are 22 years old!"
format("Hello {}! You are {} years old!", ["Jack", 22]) -> "Hello Jack! You are 22 years old!"
format("Hello {0}! You are {} years old!", ["Jack", 22]) -> "Hello Jack! You are Jack years old!"
format("Hello {}! You are {1} years old!", ["Jack", 22]) -> "Hello Jack! You are 22 years old!"

format("Hello {name}! You are {} years old!", {0:22, name: "Jack"}) -> "Hello Jack! You are 22 years old!"
format("Hello {} {}! You are {age} years old!", {...["Jack", "Sparrow"], age: "Jack"}) -> "Hello Jack Sparrow! You are 22 years old!"


```
```javascript
format("Hello {user.name}!", {user: {name: "Jack"}}) -> "Hello Jack!"
```
***