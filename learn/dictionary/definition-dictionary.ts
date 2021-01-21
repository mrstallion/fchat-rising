import _ from 'lodash';
import path from 'path';

// tslint:disable-next-line ban-ts-ignore
// @ts-ignore
import anyAscii from 'any-ascii';

// tslint:disable-next-line ban-ts-ignore
// @ts-ignore
import WordNet from './wordnet/wordnet';


export interface Definition {
  definition: string;
  synonyms: string[];
  type: string;
}


export class DefinitionDictionary {
  private wordnet: any;
  private extendedWords: Record<string, Definition[]> = {};

  constructor(basePath: string) {
    const dataDir = path.join(basePath, 'assets', 'wordnet-dictionary');

    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    this.wordnet = new WordNet(
      {
        dataDir
      }
    );
  }


  async getDefinition(expression: string): Promise<Definition[]> {
    const exp = DefinitionDictionary.cleanExpression(expression);
    const forms = await this.getWordNetValidForms(exp);

    const results = await Promise.all(
      [
        this.getExtendedDefinitions(forms),
        this.getWordNetDefinitions(forms)
      ]
    );

    return _.flatten(results);
  }


  private async getExtendedDefinitions(forms: string[]) {
    return _.flatten(_.map(forms, (f) => this.extendedWords[f] || []));
  }


  private async getWordNetValidForms(expression: string): Promise<string[]> {
    return  [...(await this.wordnet.validFormsAsync(expression)), expression];
  }


  private async getWordNetDefinitions(forms: string[]): Promise<Definition[]> {
    const definitions = await Promise.all(_.map(forms, (f: string) => this.wordnet.lookupAsync(f).catch(() => [])));

    return _.map(
      _.reverse(_.flatten(definitions)),
      (r) => (
        {
          definition: r.def,
          synonyms: r.synonyms,
          type: r.pos
        } as any as Definition
      )
    );
  }


  public static cleanExpression(expression: string): string {
    return anyAscii(expression).toLowerCase().replace(/[^a-z0-9\-]/g, ' ').replace(/  +/g, ' ').trim();
  }
}
