# Formatador baseado em contexto - format-context

## Installation
With [npm](https://www.npmjs.com/) do:

    $ npm install format-context

# Dependencies
There are no other NodeJS libraries that format-context is dependent of


## Opções

### Recursive
recursive: false
```javascript
format("Olá {nome}!", {nome: "Jack {sobrenome}", sobrenome: "Sparrow"}) -> "Olá Jack {sobrenome}!"
```
recursive: true
```javascript
format("Olá {nome}!", {nome: "Jack {sobrenome}", sobrenome: "Sparrow"}, {recursive: true}) -> "Olá Jack Sparrow!"
```
Warning:
```javascript
format("Olá {nome}!", {nome: "Jack {nome}"}, {recursive: true, maxDepth: 2}) -> "Olá Jack Jack Jack!"
```
maxDepth=Infinity will cause infinity loop

### Empty
empty: false
```javascript
format("Olá {}!", ["Jack"], {empty: false}) -> "Olá Jack!"
```
empty: true
```javascript
format("Olá {}!", ["Jack"], {empty: true}) -> "Olá !"
```

### EnableFunctionSegment
enableFunctionSegment: false
```javascript
let nome = "Jack";
format("Olá {}!", {nome: (context)=>nome}, {enableFunctionSegment: false}) -> "Olá [function]!"
```
nableFunctionSegment: true
```javascript
let nome = "Jack";
format("Olá {}!", {nome: (context)=>nome}, {enableFunctionSegment: true}) -> "Olá Jack!"
```

### Process
Função que é chamada antes da função ```compile```
Exemplo:
```javascript
format("Olá {apelido}!", {genero: 'masculino', masculino: {apelido: 'garoto'}, feminino: {apelido: 'garota'}}, {
  process: (context)=>context.genero === 'masculino'? context.masculino : context.feminino 
}) -> "Olá garoto!"
```
### Compile
Função usada para "compilar" o segmento encontrado.
Exemplo:
```javascript
format("Olá {1} {17}!", {
  compile: (segment)=>parseInt(segment) + 1
}) -> "Olá 2 18!"
```
### Make
Função é chamada após "compilar" o segmento.
Exemplo:
```javascript
const extern = "j";
format("Olá {1} {4}!", {
  compile: (segment)=>parseInt(segment) + 1,
  make: (resultado)=>`${resultado}-${extern}`
}) -> "Olá 2-j 5-j!"
```
### Cancelers
Você pode customizar os canceladores (\\ por exemplo) como quiser
Exemplo:
```javascript
format("Olá anular{nome} {nome}!", {nome: "Jack"}, {
  cancelers: [
    "anular"
  ]
}) -> "Olá {nome} Jack!"
```
### Delimiters
Você pode customizar os delimitadores como quiser
Exemplo:
```javascript
format("Olá ${nome}!", {nome: "Jack"}, {
  delimiters: [
    {start: "${", end: "}"}
  ]
}) -> "Olá Jack!"
```


## Outros exemplos:
``` js
format("Olá {nome}!", {nome: "Jack"}) -> "Olá Jack!"
format("Olá {nome}! Você tem {idade} anos!", {nome: "Jack", idade: 22}) -> "Olá Jack! Você tem 22 anos!"
format("Olá {0}!", ["Jack"]) -> "Olá Jack!"
format("Olá {0}! Você tem {1} anos!", ["Jack", 22]) -> "Olá Jack! Você tem 22 anos!"
format("Olá {}! Você tem {} anos!", ["Jack", 22]) -> "Olá Jack! Você tem 22 anos!"
format("Olá {0}! Você tem {} anos!", ["Jack", 22]) -> "Olá Jack! Você tem Jack anos!"
format("Olá {}! Você tem {1} anos!", ["Jack", 22]) -> "Olá Jack! Você tem 22 anos!"

format("Olá {nome}! Você tem {} anos!", {0:22, nome: "Jack"}) -> "Olá Jack! Você tem 22 anos!"
format("Olá {} {}! Você tem {idade} anos!", {["Jack", "Sparrow"], idade: "Jack"}) -> "Olá Jack Sparrow! Você tem 22 anos!"

```