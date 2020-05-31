import Loki from 'lokijs'

export interface TDBOps extends LokiOps {
  $containsIgnoreCase: (a: string, b: string) => boolean
  $startsWith: (a: string, b: string) => boolean 
  $startsWithIgnoreCase: (a: string, b: string) => boolean 
  $endsWith: (a: string, b: string) => boolean 
  $endsWithIgnoreCase: (a: string, b: string) => boolean 
}

export default Object.assign(Loki.LokiOps, {
  /**
   * Returns true when string a is contained in string b while ignoring case
   * @param a 
   * @param b 
   */
  $containsIgnoreCase(a: string, b: string): boolean {
    return (typeof a === 'string' && typeof b === 'string') && (a.toLowerCase().indexOf(b.toLowerCase()) !== -1);
  },
  /**
   * Returns true when string a starts with string b
   * @param a 
   * @param b 
   */
  $startsWith(a: string, b: string): boolean {
    return (typeof a === 'string') && (a.indexOf(b) === 0);
  },
  /**
   * Returns true when string a starts with string b while ignoring case
   * @param a 
   * @param b 
   */
  $startsWithIgnoreCase(a: string, b: string): boolean {
    return (typeof a === 'string' && typeof b === 'string') && (a.toLowerCase().indexOf(b.toLowerCase()) === 0);
  },
  /**
   * Returns true when string a ends with string b
   * @param a 
   * @param b 
   */
  $endsWith(a: string, b: string): boolean {
    return (typeof a === 'string') && (a.lastIndexOf(b) === a.length - b.length);
  },
  /**
   * Returns true when string a ends with string b while ignoring case
   * @param a 
   * @param b 
   */
  $endsWithIgnoreCase(a: string, b: string): boolean {
    return (typeof a === 'string' && typeof b === 'string') && (a.toLowerCase().lastIndexOf(b.toLowerCase()) === a.length - b.length);
  }
})

