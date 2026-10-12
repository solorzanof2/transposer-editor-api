
import * as fs from 'fs';
import * as path from 'path';
import { useCutSourcePath } from '../../../core/commons/hooks/Texts';

export class AiToolRegistry {

  private tools: Map<string, any> = new Map();

  constructor() { }

  addTool(tool: string, implementation: any) {
    this.tools.set(tool, implementation);
  }

  getTool(name: string) {
    return this.tools.get(name);
  }

  getDefinitions() {
    return Array.from(this.tools.values()).map((tool) => tool.definition);
  }

  fromPath(directoryPath: string, classSuffix: string = 'Tool') {
    const resolvedPath = path.isAbsolute(directoryPath)
      ? directoryPath
      : path.resolve(process.cwd(), directoryPath);

    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
      throw new Error(`El directorio de herramientas no existe: ${resolvedPath}`);
    }

    const files = this.getFilesRecursive(resolvedPath);

    let filePath: string;

    for (filePath of files) {
      const moduleExports = require(filePath);

      Object.values(moduleExports).forEach((exportedValue: any) => {
        if (typeof exportedValue !== 'function') {
          return;
        }

        if (!exportedValue.name || !exportedValue.name.endsWith(classSuffix)) {
          return;
        }

        const instance = new exportedValue();
        const toolName = typeof instance.getName === 'function'
          ? instance.getName()
          : instance.name || exportedValue.name;

        if (!toolName) {
          return;
        }

        console.log(`[INF0] AiToolRegistry.fromPath > ${toolName} - ${useCutSourcePath(filePath).padStart(10, ' ')}`);

        this.addTool(toolName, instance);
      });
    }
  }

  private getFilesRecursive(directory: string): string[] {
    const entries = fs.readdirSync(directory);
    const files: string[] = [];

    entries.forEach((entry) => {
      const entryPath = path.join(directory, entry);
      const stat = fs.statSync(entryPath);

      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursive(entryPath));
        return;
      }

      if (!stat.isFile()) {
        return;
      }

      if (!/\.(js|ts)$/.test(entry) || entry.endsWith('.d.ts')) {
        return;
      }

      files.push(entryPath);
    });

    return files;
  }

}

