<template>
  <ul>
    <li v-for="definition in definitions">
      <p><i>({{definition.type}}.)</i> {{definition.definition}}</p>
      <small>{{definition.synonyms.join(', ').replace(/_/g, ' ')}}</small>
    </li>
  </ul>
</template>
<script lang="ts">
import Vue from 'vue';
import { Definition, DefinitionDictionary } from './definition-dictionary';
import electron from 'electron';
import { Component, Prop, Watch } from '@f-list/vue-ts';
// import { EventBus } from '../../chat/preview/event-bus';

@Component({})
export default class WordDefinition extends Vue {
  private wordDef = new DefinitionDictionary(electron.remote.app.getAppPath());

  @Prop
  readonly expression?: string;

  public definitions: Definition[] = [];

  // @Hook('mounted')
  // mounted(): void {
  //
  // }

  @Watch('expression')
  async onWordChange(newExpression: string): Promise<void> {
    this.definitions = await this.wordDef.getDefinition(newExpression);
  }
}

</script>

<style lang="scss">
.word-definition-viewer {
  ul {
    margin-left: 0;
    padding-left: 0;

    li {
      list-style: none;
      padding-left: 0;
      margin-left: 0;

      p {
        margin-bottom: 0.1em;
        color: var(--input-color);
      }

      small {
        display: block;
        margin-bottom: 1.2em;
        color: var(--secondary);
      }
    }
  }
}



</style>
