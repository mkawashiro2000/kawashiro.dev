class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let current = this.root;
    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
  }

  // Búsqueda profunda (DFS) para extraer todas las ramas viables a partir del nodo actual
  private getWordsFromNode(node: TrieNode, prefix: string, results: string[]): void {
    if (node.isEndOfWord) {
      results.push(prefix);
    }
    for (const [char, childNode] of node.children.entries()) {
      this.getWordsFromNode(childNode, prefix + char, results);
    }
  }

  findCompletions(prefix: string): string[] {
    let current = this.root;
    for (const char of prefix) {
      if (!current.children.has(char)) {
        return []; // No hay coincidencias para este prefijo
      }
      current = current.children.get(char)!;
    }

    const results: string[] = [];
    this.getWordsFromNode(current, prefix, results);
    return results;
  }
}
