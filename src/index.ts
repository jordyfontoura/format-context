export interface Delimiter{
  start: string;
  end: string
}
export interface FormatOptionsParam<T>{
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

/**
 * any not (null | undefined)
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface nonvoid{}
export interface Stringfy{
  toString(): string;
}

export function getDeepKey(key:string, obj: nonvoid): any {
  const keys = key.toString().split(".").reverse();
  const firstKey = keys.pop();
  if (firstKey !== undefined) {
    if (Object.keys(obj).includes(firstKey)) {
      let element = obj[firstKey];
      while (keys.length !== 0) {
        const k = keys.pop();
        if (k !== undefined) {
          if (Object.keys(element).includes(k)) {
            element = element[k];
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      }
      return element;
    }
  }
  return undefined;
}

/**
 * Context-based formatter
 * @param {string} text Text to format
 * @param {nonvoid} context Context from text
 * @param {FormatOptionsParam<T>} optss Options
 * @throws {Error("Close delimiter not found")}
 * @returns {string} Return text formated.
 */
export function format<T extends nonvoid>(text: string, context: T, optss?: FormatOptionsParam<T>): string {
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
      const deep = getDeepKey(segment.toString(), context);
      if (deep !== undefined) {
        return deep;
      } else {
        console.warn(`${segment} not foun in current context.`);
        return segment.toString();
      }
      // return (deep !== undefined) ? deep : segment.toString();
      // if (Object.keys(context).includes(segment.toString())) {
      //   const keys = segment.toString().split(".").reverse();
      //   const firstKey = keys.pop();
      //   if (firstKey !== undefined) {
      //     let element = context[firstKey];
      //     while (keys.length !== 0) {
      //       element = element[keys.pop()];
      //     }
      //     return element;
      //   }
      //   // if (keys.length === 1) {
      //   //   return context[keys[0]];
      //   // } else if (keys.length > 1) {
          
      //   // }
      // } else {
      //   console.warn(`${segment} não foi encontrado no contexto atual`);
      //   return segment;
      // }
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
          throw new Error("Close delimiter not found.");
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
export default format;