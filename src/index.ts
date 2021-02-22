interface Delimiter{
  start: string;
  end: string
}
interface FormatOptionsParam<T>{
  cancelers?: string[]
  delimiters?: Delimiter[];
  process?: (context: T) => Stringfy;
  compile?: (segment: Stringfy, context: T|Stringfy, options?: FormatOptions<T>) => Stringfy;
  make?: (segment: Stringfy, context?: T|Stringfy)=>Stringfy;
  // if true empty args = "", else empty = context[n-ésimo encontrado]
  empty?: boolean;
  recursive?: boolean;
  enableFunctionSegment?: boolean;
  maxDepth?: number;
}

interface FormatOptions<T>{
  cancelers: string[]
  delimiters: Delimiter[];
  process: (context: T) => Stringfy;
  compile: (segment: Stringfy, context: T|Stringfy, options: FormatOptions<T>) => Stringfy;
  make: (segment: Stringfy|((context: T|Stringfy)=>Stringfy), context: T|Stringfy)=>Stringfy;
  // if true empty args = "", else empty = context[n-ésimo encontrado]
  empty: boolean;
  recursive: boolean;
  enableFunctionSegment: boolean;
  maxDepth: number;
}

/// Exemplos:
/*
format("Seu nome é {} e você tem {} anos", ["jordy", 22])
format("Sua idade é {1} e seu nome é {0}", ["jordy", 22])
format("Seu nome é {nome} e sua idade é {idade}", {nome: "jordy", idade: 22})
format("Seu nome é {nome} e sua idade é {idade}", {nome: "jordy", idade: 22})
format("Seu nome é $[nome] e sua idade é $[idade]", {nome: "jordy", idade: 22})



*/

interface Stringfy{
  toString(): string;
}

export function format<T extends Stringfy>(text: string, context: T, optss?: FormatOptionsParam<T>): string {
  const options: FormatOptions<T> = {
    cancelers: ["\\"],
    delimiters: [
      {
        start: "{",
        end: "}",
      }
    ],
    process: (context: T) => context,
    compile: (segment, context, opts) => {
      if (Object.keys(context).includes(segment.toString())) {
        return context[segment.toString()];
      } else {
        console.warn(`${segment} não foi encontrado no contexto atual`);
        return segment;
      }
    },
    make: (segment, context: T | any = {}) => {
      if (typeof segment === "function") {
        if (options.enableFunctionSegment) {
          return segment(context);
        } else {
          return "[function]";
        }
      }
      return segment;
    },
    enableFunctionSegment: false,
    empty: false,
    recursive: false,
    maxDepth: 6,
    ...optss
  };
  function m(p: number, t: string, ...ops: string[]): string | undefined {
    const max = Math.max(...ops.map(o => o.length));
    ops = ops.sort((a, b) =>b.length - a.length);
    for (let i = max; i > 0; i--) {
      const segment = t.slice(p, p + i);
      if (i === segment.length && ops.includes(segment)) {
        return segment;
      }
    }
    return undefined;
  }
  let result = "";
  let emptyIndex = 0;
  for (let pivot = 0, cancel = false, imax = text.length; pivot < imax; pivot++){
    const char = text[pivot];
    
    const canceler = m(pivot, text, ...options.cancelers);
    if (canceler !== undefined) {
      
      if (cancel) {
        cancel = false;
        result += text.slice(pivot, pivot + canceler.length);
        pivot += canceler.length - 1;
        continue;
      }
      pivot += canceler.length - 1;
      cancel = true;
      continue;
    } else{
      const startDelimiter = m(pivot, text, ...options.delimiters.map(delimiter => delimiter.start));
      if (startDelimiter !== undefined) {
        
        if (cancel) {
          cancel = false;
          result += text.slice(pivot, pivot+startDelimiter.length);
          pivot += startDelimiter.length - 1;
          continue;
        }
        pivot += startDelimiter.length;
        let inner = "", innerCancel = false;
        let i;
        const textSegment = text.slice(pivot);
        let eof = true;
        for (i = 0; i < textSegment.length; i++) {
          const endDelimiter = m(i, textSegment, ...options.delimiters.map(delimiter => delimiter.end));
          const canceler = m(pivot, text, ...options.cancelers);
          if (canceler !== undefined) {
            i += canceler.length - 1;
            if (innerCancel) {
              innerCancel = false;
              continue;
            }
            innerCancel = true;
            continue;
          } else if (endDelimiter !== undefined) {
            i += endDelimiter.length;
            if (cancel) {
              cancel = false;
              continue;
            }
            eof = false;
            inner = textSegment.slice(0, i-1);
            break;
          }
        }
        if (eof) {
          throw new Error("EOF");
        }
        if (inner === "" && options.empty) {
          pivot += i - 1;
          continue;
          const ctx = options.process(context);
          let compiled = options.make(inner, ctx);
          if (options.recursive) {
            let newCompiled = compiled;
            let n = options.maxDepth; // MAX RECURSION
            while (n--) {
              newCompiled = format(newCompiled.toString(), context, { ...optss, recursive: false });
              if (newCompiled === compiled) {
                break;
              }
              compiled = newCompiled;
            }
          }
          result += compiled;
          pivot += i-1;
          continue;
        }
        if (inner === "") {
          inner = emptyIndex.toString();
          emptyIndex++;
        }

        const ctx = options.process(context);
        let compiled = options.make(options.compile(inner, ctx, options), ctx);
        if (options.recursive) {
          let newCompiled = compiled;
          let n = options.maxDepth; // MAX RECURSION
          while (n--) {
            newCompiled = format(newCompiled.toString(), context, { ...optss, recursive: false });
            if (newCompiled === compiled) {
              break;
            }
            compiled = newCompiled;
          }
        }
        result += compiled;
        pivot += i-1;
      } else {
        result += char;
      }
    }
  }
  return result;
}

// function testa() {
//   let resultado: string = format("seu nome\\\\ ", {});
//   console.log("resultado:", resultado);
//   resultado = format("seu.nome.{nome}.", { nome: 'Jordy{idade}', idade: 22 }, { recursive: true });
//   resultado = format("seu.nome.|{nome}|.", { nome: '<{nome}[Jordy]{nome}>', idade: 22 }, { recursive: true, maxDepth: 1 });
//   console.log("resultado:", resultado);
//   resultado = format("seu.nome.{nome}", { genero: 0, f: { nome: "Clari" }, m: { nome: "Jordy" } }, {
//     process: (context) => context.genero === 0 ? context.f : context.m
//   });
//   console.log("resultado:", resultado);
//   resultado = format("seu.nome.{nome}", { genero: 1, f: { nome: "Clari" }, m: { nome: "Jordy" } }, {
//     process: (context) => context.genero === 0 ? context.f : context.m
//   });
//   console.log("resultado:", resultado);
//   resultado = format("Olá {s}!", { genero: 2, e: { s: 'estranho' }, f: { s: 'garot{letra}', letra: "a" }, m: { s: 'garot{letra}', letra: "o" } }, {
//     process: (context) => context.genero === 0 ? context.f : (context.genero === 1 ? context.m : context.e),
//     recursive: true
//   });
//   console.log("resultado:", resultado);

//   const teste = "Teste1";
//   resultado = format("Olá {nome}!", { nome: "teste" }, {
//     make: (txt) => teste
//   });
//   console.log("resultado:", resultado);

//   resultado = format("{1}{2}{0}", [0, 1, 2]);
//   console.log("resultado:", resultado);
  
//   resultado = format("{nome}:{}{}{}", {...[1, 2, 3, 4], nome: "jordy"});
//   console.log("resultado:", resultado);

//   resultado = format("Olá {apelido}!", {genero: 'masculino', masculino: {apelido: 'garoto'}, feminino: {apelido: 'garota'}}, {
//     process: (context)=>context.genero === 'masculino'? context.masculino : context.feminino 
//   })
//   console.log("resultado:", resultado);

//   resultado = format("Olá {}!", ["Jordy"], { empty: true });
//   console.log("resultado:", resultado);
// }
// testa()