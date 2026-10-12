import { Changelog } from '../interfaces/Changelog';
import { Migration } from '../models/Migration';
import { MigrationRepository } from '../repository/MigrationRepository';
import { ChangelogModel } from './ChangelogModel';
import { FileManager } from './FileManager';
import { DatabaseType } from '../DatabaseFactory';


export class MigrationKernel {
  static readonly CHANGELOG_TABLE: string = 'databasechangelog';

  repository: MigrationRepository;
  migrationRoute: string

  fileManager: FileManager;
  changelogCollection: Changelog[];

  databaseType: DatabaseType;

  get hasChangelog(): boolean {
    return (this.changelogCollection.length > 0);
  }

  isLock = false;

  constructor(migrationRoute: string, databaseType: DatabaseType = DatabaseType.MYSQL) {
    this.repository = new MigrationRepository();
    this.migrationRoute = migrationRoute;
    this.fileManager = new FileManager(migrationRoute);
    this.changelogCollection = new Array<Changelog>();
    this.databaseType = databaseType;
  }

  async initialize(): Promise<void> {
    try {
      // verify if migration changelog exists or create it if isn't;
      await this.createIfNotExistChangelog();

      // scan migration folder searching files;
      await this.fileManager.scanMigrationPath();

      // parse all migrations;
      await this.fileManager.parseMigrations();

      this.changelogCollection = await this.repository.findAll();

      return Promise.resolve();
    }
    catch (error: any) {
      console.log(error);
      this.isLock = true;
      return Promise.resolve();
    }
  }

  async start(): Promise<void> {
    try {
      if (this.isLock) {
        return Promise.reject(new Error('Migration has been locked.'));
      }

      // starting iterator function;
      const generator = this.fileManager.getMigration();
      let current = generator.next();
      let migration = current.value as Migration;

      while (!current.done) {
        console.log(``);
        console.log(`Running Migration ${migration.title} created by ${migration.author}...`);
        console.log(``);

        const changelog = this.findChangelogByAuthorAndTitle(migration.author, migration.title);
        if (changelog) {
          if (changelog.signature !== migration.signature) {
            throw new Error(`MD5 signature has changed before was '${changelog.signature}', but now is: ${migration.signature}`);
          }
          current = generator.next();
          migration = current.value as Migration;

          continue;
        }

        for (const query of migration.queriesCollection) {
          await this.repository.queryBySql(query);
        }

        const model = new ChangelogModel();
        model.author = migration.author;
        model.title = migration.title;
        model.route = migration.route;
        model.dateexecuted = new Date().toISOString().replace('T', ' ').replace('Z', '').trim();
        model.signature = migration.signature;

        await this.repository.save(model);

        // going to next migration
        current = generator.next();
        migration = current.value as Migration;
      }
    }
    catch (error: any) {
      return Promise.reject(new Error(error.message));
    }
  }

  async createIfNotExistChangelog(): Promise<void> {
    try {
      const quote = this.databaseType === DatabaseType.POSTGRESQL ? '"' : '`';
      await this.repository.queryBySql(`SELECT 1 FROM ${quote}${MigrationKernel.CHANGELOG_TABLE}${quote}`);

      return Promise.resolve();
    }
    catch (error: any) {
      const errorCode = this.databaseType === DatabaseType.POSTGRESQL ? '42P01' : 'ER_NO_SUCH_TABLE';
      if (!String(error.code || error.message).includes(errorCode)) {
        return Promise.reject(new Error(error.message));
      }

      // databasechangelog table doesn't exists;
      const builder = new Array<string>();
      const quote2 = this.databaseType === DatabaseType.POSTGRESQL ? '"' : '`';
      builder.push(`CREATE TABLE ${quote2}${MigrationKernel.CHANGELOG_TABLE}${quote2} (`);
      if (this.databaseType === DatabaseType.POSTGRESQL) {
        builder.push(`"id" SERIAL PRIMARY KEY, `);
        builder.push(`"author" VARCHAR(255) NOT NULL, `);
        builder.push(`"title" VARCHAR(255) UNIQUE NOT NULL, `);
        builder.push(`"route" VARCHAR(255) NOT NULL, `);
        builder.push(`"dateexecuted" TIMESTAMP NOT NULL, `);
        builder.push(`"signature" VARCHAR(35) NOT NULL);`);
      } else {
        builder.push(`\`id\` bigint(11) PRIMARY KEY NOT NULL AUTO_INCREMENT, `);
        builder.push(`\`author\` varchar(255) NOT NULL, `);
        builder.push(`\`title\` varchar(255) UNIQUE NOT NULL, `);
        builder.push(`\`route\` varchar(255) NOT NULL, `);
        builder.push(`\`dateexecuted\` DATETIME NOT NULL, `);
        builder.push(`\`signature\` varchar(35) NOT NULL);`);
      }

      await this.repository.queryBySql(builder.join(''));

      Promise.resolve();
    }
  }

  private findChangelogByAuthorAndTitle(author: string, title: string): Changelog | undefined  {
    if (this.hasChangelog) {
      return this.changelogCollection.find(x => x.author === author && x.title === title);
    }
    return undefined;
  }

}