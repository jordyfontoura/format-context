import {format, getDeepKey} from "../src/index";

describe("Formar-Context", () => {
  it("Params", () => {
    expect(format("Olá {}!", ["Jack"])).toBe("Olá Jack!");
    expect(format("{}", ["Jack"])).toBe("Jack");
    expect(format("\\{{}}", ["Jack"])).toBe("{Jack}");
    expect(format("Olá {0}!", ["Jack"])).toBe("Olá Jack!");
    expect(format("Olá {0}! Você tem {1} anos!", ["Jack", 22])).toBe("Olá Jack! Você tem 22 anos!");
    expect(format("Olá {}! Você tem {} anos!", ["Jack", 22])).toBe("Olá Jack! Você tem 22 anos!");
    expect(format("Olá {0}! Você tem {} anos!", ["Jack", 22])).toBe("Olá Jack! Você tem Jack anos!");
    expect(format("Olá {}! Você tem {1} anos!", ["Jack", 22])).toBe("Olá Jack! Você tem 22 anos!");

    expect(format("Olá {nome}! Você tem {} anos!", { 0: 22, nome: "Jack" })).toBe("Olá Jack! Você tem 22 anos!");
    expect(format("Olá {} {}! Você tem {idade} anos!", { ...["Jack", "Sparrow"], idade: 22 })).toBe("Olá Jack Sparrow! Você tem 22 anos!");
  });
  it("Recursive", () => {
    expect(format("Olá {nome}!", { nome: "Jack {sobrenome}", sobrenome: "Sparrow" })).toBe("Olá Jack {sobrenome}!");

    expect(format("Olá {nome}!", { nome: "Jack {sobrenome}", sobrenome: "Sparrow" }, { recursive: true })).toBe("Olá Jack Sparrow!");

    expect(format("Olá {nome}!", { nome: "Jack {nome}" }, { recursive: true, maxDepth: 2 })).toBe("Olá Jack Jack Jack {nome}!");
  });
  it("EnableFunctionSegment", () => {
    let nome = "Jack";
    expect(format("Olá {nome}!", { nome: (context) => nome }, { enableFunctionSegment: false })).toBe("Olá [function]!");
    nome = "Jack";
    expect(format("Olá {nome}!", { nome: (context) => nome }, { enableFunctionSegment: true })).toBe("Olá Jack!");
  });
  it("Process", () => {
    expect(format("Olá {apelido}!", { genero: "masculino", masculino: { apelido: "garoto" }, feminino: { apelido: "garota" } }, {
      process: (context) => context.genero === "masculino" ? context.masculino : context.feminino
    })).toBe("Olá garoto!");
  });
  it("Compile", () => {
    expect(format("Olá {1} {17}!", {}, {
      compile: (segment) => (parseInt(segment.toString()) + 1).toString()
      
    })).toBe("Olá 2 18!");
  });
  it("Make", () => {
    const extern = "j";
    expect(format("Olá {1} {4}!", {}, {
      compile: (segment) => (parseInt(segment.toString()) + 1).toString(),
      make: (resultado) => `${resultado}-${extern}`
    })).toBe("Olá 2-j 5-j!");
  });
  it("Canvelers", () => {
    expect(format("Olá anular{nome} {nome}!", { nome: "Jack" }, {
      cancelers: [
        "anular"
      ]
    })).toBe("Olá {nome} Jack!");
  });
  it("Delimiters", () => {
    expect(format("Olá ${nome}!", { nome: "Jack" }, {
      delimiters: [
        { start: "${", end: "}" }
      ]
    })).toBe("Olá Jack!");
  });
  it("Empty", () => {
    expect(format("Olá {}!", ["Jack"], { empty: false })).toBe("Olá Jack!");
    expect(format("Olá {}!", ["Jack"], { empty: true })).toBe("Olá !");
  });
  it("KeyMap", () => {
    expect(format("nome: {user.nome}", { user: { nome: "jordy" } })).toBe("nome: jordy");
    expect(format("superdeep: {a.b.c.d.e.f}", {a: {b: {c: {d: {e: {f: "OK"}}}}}})).toBe("superdeep: OK");
    expect(format("superdeep: {a.c}", {a: {b: {c: {d: {e: {f: "OK"}}}}}})).toBe("superdeep: a.c");
  });
});
describe("DeepKey", () => {
  it("run", () => {
    expect(getDeepKey("user.nome", { user: { nome: "jordy" } })).toBe("jordy");
    expect(getDeepKey("user.idade", { user: { nome: "jordy" } })).toBe(undefined);
    expect(getDeepKey("user", { user: { nome: "jordy" } })).toEqual({nome: "jordy"});
  });
});